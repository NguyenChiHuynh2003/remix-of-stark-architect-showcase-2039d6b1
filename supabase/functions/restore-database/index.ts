import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { getCorsHeaders } from "../_shared/cors.ts";

// ALL tables in order - REVERSE order for deletion (child tables first)
// NORMAL order for insertion (parent tables first)
const TABLES_ORDER = [
  // User-related tables (depends on auth.users) - SKIP THESE, handle separately
  // "profiles",
  // "user_roles",
  // "user_permissions",
  
  // Core business tables that don't depend on auth.users
  "employees",
  "projects",
  "team_members",
  "tasks",
  "project_items",
  "project_kpis",
  "client_requirements",
  "materials",
  
  // Organization charts
  "organization_charts",
  "org_chart_positions",
  "org_chart_connections",
  
  // Inventory management - parent tables first
  "brands",
  "product_categories",
  "product_groups",
  "warehouses",
  "inventory_items",
  "asset_master_data",
  "asset_allocations",
  "asset_location_history",
  "asset_disposals",
  "depreciation_schedules",
  "maintenance_records",
  "goods_receipt_notes",
  "grn_items",
  "goods_issue_notes",
  "gin_items",
  "handover_slips",
  
  // Accounting
  "contracts",
  "contract_guarantees",
  "accounting_transactions",
  
  // Notifications
  "notifications",
];

// Tables that depend on auth.users - handle separately
const AUTH_DEPENDENT_TABLES = ["profiles", "user_roles", "user_permissions"];

// Columns that reference auth.users - need to be remapped to current admin
const USER_REFERENCE_COLUMNS = [
  "created_by",
  "user_id", 
  "assigned_to",
  "reported_by",
  "approved_by",
  "moved_by",
  "allocated_by",
  "allocated_to",
];

// Tables that need special handling for foreign keys
const FK_DELETE_ORDER = [
  // Delete children first, then parents
  "notifications",
  "accounting_transactions",
  "contract_guarantees",
  "contracts",
  "gin_items",
  "goods_issue_notes",
  "handover_slips",
  "grn_items",
  "goods_receipt_notes",
  "maintenance_records",
  "depreciation_schedules",
  "asset_disposals",
  "asset_location_history",
  "asset_allocations",
  "asset_master_data",
  "inventory_items",
  "warehouses",
  "product_groups",
  "product_categories",
  "brands",
  "org_chart_connections",
  "org_chart_positions",
  "organization_charts",
  "materials",
  "client_requirements",
  "project_kpis",
  "project_items",
  "tasks",
  "team_members",
  "projects",
  "employees",
];

// Function to check if a user exists in auth.users
async function checkUserExists(supabase: ReturnType<typeof createClient>, userId: string): Promise<boolean> {
  try {
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle();
    return !!data;
  } catch {
    return false;
  }
}

// Tables where created_by is TEXT (stores name instead of UUID)
const TEXT_CREATED_BY_TABLES = ["goods_receipt_notes", "goods_issue_notes"];

// Function to remap user IDs in a record
function remapUserIds(
  record: Record<string, unknown>, 
  adminUserId: string,
  validUserIds: Set<string>,
  tableName: string
): Record<string, unknown> {
  const remapped = { ...record };
  
  for (const column of USER_REFERENCE_COLUMNS) {
    if (column in remapped && remapped[column]) {
      const originalValue = remapped[column] as string;
      
      // Skip if this is a TEXT column (already stores name, not UUID)
      if (column === "created_by" && TEXT_CREATED_BY_TABLES.includes(tableName)) {
        continue; // Keep the original value (it's a name, not UUID)
      }
      
      // If user doesn't exist, remap to admin or set to null
      if (!validUserIds.has(originalValue)) {
        // For created_by (UUID columns), use admin; for others, set to null
        if (column === "created_by") {
          remapped[column] = adminUserId;
        } else {
          remapped[column] = null;
        }
      }
    }
  }
  
  return remapped;
}

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Use service role key for full access - bypasses RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const body = await req.json();
    const { backupData, mode = "replace", emergencyRestore = false } = body;

    let adminUserId: string | null = null;

    // For emergency restore, verify confirmation text
    if (emergencyRestore) {
      const { confirmText } = body;
      if (confirmText !== "confirm") {
        console.warn("Emergency restore attempt without proper confirmation");
        return new Response(
          JSON.stringify({ error: "Vui lòng nhập 'confirm' để xác nhận khôi phục" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      console.log("Emergency restore confirmed - FULL REPLACEMENT MODE");
      
      // Get any admin user for emergency restore
      const { data: adminData } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "admin")
        .limit(1)
        .maybeSingle();
      
      if (adminData) {
        adminUserId = adminData.user_id;
      }
    } else {
      // Normal authentication check for non-emergency restore
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) {
        console.warn("Restore attempt without authorization header");
        return new Response(
          JSON.stringify({ error: "Unauthorized: No authorization header" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);

      if (authError || !user) {
        console.warn("Restore attempt with invalid token");
        return new Response(
          JSON.stringify({ error: "Unauthorized: Invalid token" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Admin role check
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!roleData) {
        console.warn(`Restore attempt by non-admin user: ${user.id}`);
        return new Response(
          JSON.stringify({ error: "Forbidden: Admin access required" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      adminUserId = user.id;
      console.log(`Starting database restore by admin user: ${user.id}, mode: ${mode}`);
    }

    if (!adminUserId) {
      return new Response(
        JSON.stringify({ error: "Không tìm thấy tài khoản admin để thực hiện restore" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle both old format (direct tables) and new format (with _metadata)
    let actualBackupData = backupData;
    if (backupData._metadata) {
      console.log("Detected new backup format with metadata");
      console.log("Backup metadata:", backupData._metadata);
      // Extract actual data (exclude _metadata)
      const { _metadata, ...tables } = backupData;
      actualBackupData = tables;
    }

    if (!actualBackupData || typeof actualBackupData !== "object") {
      return new Response(
        JSON.stringify({ error: "Invalid backup data format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Starting FULL database restore (REPLACE mode), emergency: ${emergencyRestore}`);
    console.log("Tables in backup:", Object.keys(actualBackupData).filter(k => k !== "_metadata"));
    console.log("Admin user for remap:", adminUserId);

    // Get list of valid user IDs in current database
    const { data: existingProfiles } = await supabase
      .from("profiles")
      .select("id");
    
    const validUserIds = new Set<string>(
      existingProfiles?.map(p => p.id) || []
    );
    console.log(`Found ${validUserIds.size} valid user IDs in current database`);

    const results: Record<string, { deleted: number; inserted: number; errors: string[]; remapped: number }> = {};
    const deleteErrors: string[] = [];

    // STEP 1: DELETE existing data in reverse order (children first)
    console.log("=== STEP 1: Deleting existing data ===");
    for (const table of FK_DELETE_ORDER) {
      try {
        // Delete all records from the table
        const { error: deleteError, count } = await supabase
          .from(table)
          .delete()
          .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all (hacky but works)
        
        if (deleteError) {
          console.error(`Error deleting from ${table}:`, deleteError.message);
          deleteErrors.push(`${table}: ${deleteError.message}`);
        } else {
          console.log(`Deleted from ${table}: ${count || 'all'} records`);
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error(`Exception deleting from ${table}:`, err);
        deleteErrors.push(`${table}: ${errorMessage}`);
      }
    }

    // STEP 2: INSERT new data in correct order (parents first)
    console.log("=== STEP 2: Inserting backup data ===");
    
    // First, process auth-dependent tables separately (just skip them, as they need manual user creation)
    for (const table of AUTH_DEPENDENT_TABLES) {
      const tableData = actualBackupData[table];
      if (tableData && Array.isArray(tableData) && tableData.length > 0) {
        console.log(`Skipping ${table}: This table depends on auth.users. ${tableData.length} records not imported.`);
        results[table] = {
          deleted: 0,
          inserted: 0,
          remapped: 0,
          errors: [`Bảng ${table} phụ thuộc vào auth.users. Dữ liệu cần được tạo lại sau khi tạo tài khoản người dùng.`]
        };
      }
    }

    // Process other tables
    for (const table of TABLES_ORDER) {
      const tableData = actualBackupData[table];
      
      if (!tableData || !Array.isArray(tableData) || tableData.length === 0) {
        console.log(`Skipping ${table}: no data in backup`);
        continue;
      }

      results[table] = { deleted: 0, inserted: 0, errors: [], remapped: 0 };
      console.log(`Processing ${table}: ${tableData.length} records`);

      // Insert records in batches for better performance
      const batchSize = 50;
      for (let i = 0; i < tableData.length; i += batchSize) {
        const batch = tableData.slice(i, i + batchSize);
        
        // Clean and remap records
        const cleanBatch = batch.map((record: Record<string, unknown>) => {
          // Remove undefined values
          const cleanRecord: Record<string, unknown> = {};
          for (const [key, value] of Object.entries(record)) {
            if (value !== undefined) {
              cleanRecord[key] = value;
            }
          }
          
          // Remap user IDs
          const remappedRecord = remapUserIds(cleanRecord, adminUserId!, validUserIds, table);
          
          // Track if any remapping happened
          if (JSON.stringify(cleanRecord) !== JSON.stringify(remappedRecord)) {
            results[table].remapped++;
          }
          
          return remappedRecord;
        });

        // Try to insert batch
        try {
          const { error: insertError } = await supabase
            .from(table)
            .insert(cleanBatch);
          
          if (insertError) {
            console.error(`Batch error inserting to ${table}:`, insertError.message);
            
            // Try one by one if batch fails
            for (const record of cleanBatch) {
              const { error: singleError } = await supabase
                .from(table)
                .insert(record);
              
              if (singleError) {
                // Check for specific errors and provide better messages
                const errorMsg = singleError.message || JSON.stringify(singleError);
                if (errorMsg.includes("foreign key") || errorMsg.includes("violates")) {
                  results[table].errors.push(`Record ${record.id}: Foreign key không hợp lệ - đã bỏ qua`);
                } else if (errorMsg.includes("duplicate")) {
                  // Skip duplicates silently
                  results[table].inserted++; // Count as success since data exists
                } else {
                  results[table].errors.push(`Record ${record.id}: ${errorMsg}`);
                }
              } else {
                results[table].inserted++;
              }
            }
          } else {
            results[table].inserted += cleanBatch.length;
          }
        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : String(err);
          console.error(`Exception inserting to ${table}:`, err);
          results[table].errors.push(`Batch error: ${errorMessage}`);
        }
      }

      console.log(`Completed ${table}: ${results[table].inserted} inserted, ${results[table].remapped} remapped, ${results[table].errors.length} errors`);
    }

    // Calculate summary
    const summary = {
      totalTables: Object.keys(results).length,
      totalRecords: Object.values(results).reduce((sum, r) => sum + r.inserted, 0),
      totalRemapped: Object.values(results).reduce((sum, r) => sum + r.remapped, 0),
      totalErrors: Object.values(results).reduce((sum, r) => sum + r.errors.length, 0),
      deleteErrors: deleteErrors.length,
      tablesProcessed: TABLES_ORDER.filter(t => actualBackupData[t]?.length > 0),
      skippedAuthTables: AUTH_DEPENDENT_TABLES.filter(t => actualBackupData[t]?.length > 0),
      adminUserUsedForRemap: adminUserId,
    };

    console.log(`=== RESTORE COMPLETED ===`);
    console.log(`Summary:`, summary);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Khôi phục thành công ${summary.totalRecords} bản ghi từ ${summary.totalTables} bảng. ${summary.totalRemapped} bản ghi đã được remap user ID.`,
        summary,
        deleteErrors: deleteErrors.length > 0 ? deleteErrors : undefined,
        details: results,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Restore failed:", error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
