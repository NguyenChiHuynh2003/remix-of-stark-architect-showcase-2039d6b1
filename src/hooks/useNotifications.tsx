import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDateVN } from "@/lib/dateUtils";

export function useNotifications() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const checkAndCreateNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date();
      const thirtyDaysFromNow = new Date(today);
      thirtyDaysFromNow.setDate(today.getDate() + 30);

      // Check guarantees expiring soon
      const { data: guarantees } = await supabase
        .from("contract_guarantees")
        .select(`
          *,
          contracts (
            contract_number,
            client_name
          )
        `)
        .gte("expiry_date", today.toISOString().split('T')[0])
        .lte("expiry_date", thirtyDaysFromNow.toISOString().split('T')[0]);

      if (guarantees && guarantees.length > 0) {
        for (const guarantee of guarantees) {
          const { data: existing } = await supabase
            .from("notifications")
            .select("id")
            .eq("reference_id", guarantee.id)
            .eq("type", "guarantee_expiry")
            .single();

          if (!existing) {
            await supabase.from("notifications").insert({
              user_id: user.id,
              title: "Bảo lãnh sắp hết hạn",
              message: `Bảo lãnh ${guarantee.guarantee_type} - ${guarantee.contracts?.contract_number} sẽ hết hạn vào ${formatDateVN(guarantee.expiry_date)}`,
              type: "guarantee_expiry",
              reference_id: guarantee.id,
            });
          }
        }
      }

      // Check employee birthdays (within 7 days)
      const sevenDaysFromNow = new Date(today);
      sevenDaysFromNow.setDate(today.getDate() + 7);

      const { data: employees } = await supabase
        .from("employees")
        .select("*");

      if (employees) {
        for (const employee of employees) {
          if (employee.date_of_birth) {
            const birthDate = new Date(employee.date_of_birth);
            const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
            
            if (thisYearBirthday >= today && thisYearBirthday <= sevenDaysFromNow) {
              const { data: existing } = await supabase
                .from("notifications")
                .select("id")
                .eq("reference_id", employee.id)
                .eq("type", "birthday")
                .gte("created_at", today.toISOString().split('T')[0])
                .maybeSingle();

              if (!existing) {
                await supabase.from("notifications").insert({
                  user_id: user.id,
                  title: "Sinh nhật nhân viên",
                  message: `${employee.full_name} sẽ có sinh nhật vào ${formatDateVN(thisYearBirthday)}`,
                  type: "birthday",
                  reference_id: employee.id,
                });
              }
            }
          }
        }
      }

      // Check contracts expiring soon
      const { data: contracts } = await supabase
        .from("contracts")
        .select("*")
        .gte("expiry_date", today.toISOString().split('T')[0])
        .lte("expiry_date", thirtyDaysFromNow.toISOString().split('T')[0]);

      if (contracts && contracts.length > 0) {
        for (const contract of contracts) {
          const { data: existing } = await supabase
            .from("notifications")
            .select("id")
            .eq("reference_id", contract.id)
            .eq("type", "contract_expiry")
            .single();

          if (!existing) {
            await supabase.from("notifications").insert({
              user_id: user.id,
              title: "Hợp đồng sắp hết hạn",
              message: `Hợp đồng ${contract.contract_number} - ${contract.client_name} sẽ hết hạn vào ${formatDateVN(contract.expiry_date)}`,
              type: "contract_expiry",
              reference_id: contract.id,
            });
          }
        }
      }

      // Check asset allocations with expected return date coming up (within 7 days)
      // Only create ONE notification per allocation
      const { data: upcomingReturns } = await supabase
        .from("asset_allocations")
        .select(`
          *,
          asset_master_data (
            asset_id,
            asset_name
          )
        `)
        .eq("status", "active")
        .not("expected_return_date", "is", null)
        .gte("expected_return_date", today.toISOString().split('T')[0])
        .lte("expected_return_date", sevenDaysFromNow.toISOString().split('T')[0]);

      if (upcomingReturns && upcomingReturns.length > 0) {
        for (const allocation of upcomingReturns) {
          // Check if ANY notification exists for this allocation (regardless of when created)
          const { data: existingNotifications, error: checkError } = await supabase
            .from("notifications")
            .select("id")
            .eq("reference_id", allocation.id)
            .eq("type", "asset_return_due");

          if (checkError) {
            console.error("Error checking existing notification:", checkError);
            continue;
          }

          // Only create notification if NO notification exists for this allocation
          if (!existingNotifications || existingNotifications.length === 0) {
            const assetName = allocation.asset_master_data?.asset_name || "Tài sản";
            const allocatedToName = allocation.allocated_to_name || "Nhân viên";
            await supabase.from("notifications").insert({
              user_id: user.id,
              title: "Tài sản sắp đến hạn hoàn trả",
              message: `${assetName} được phân bổ cho ${allocatedToName} sẽ đến hạn hoàn trả vào ${formatDateVN(allocation.expected_return_date)}`,
              type: "asset_return_due",
              reference_id: allocation.id,
            });
          }
        }
      }

      fetchNotifications();
    } catch (error: any) {
      console.error("Error checking notifications:", error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_read", false)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error: any) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId);

      if (error) throw error;
      setNotifications(notifications.filter(n => n.id !== notificationId));
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false);

      if (error) throw error;
      setNotifications([]);
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    checkAndCreateNotifications();
    
    // Check for new notifications every hour
    const interval = setInterval(checkAndCreateNotifications, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    notifications,
    loading,
    markAsRead,
    markAllAsRead,
    refresh: checkAndCreateNotifications,
  };
}
