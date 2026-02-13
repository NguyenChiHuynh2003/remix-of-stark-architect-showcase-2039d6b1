
-- Drop foreign key constraints that reference auth.users
-- These prevent data restore from other projects

-- asset_master_data.created_by -> auth.users(id)
ALTER TABLE public.asset_master_data DROP CONSTRAINT IF EXISTS asset_master_data_created_by_fkey;

-- goods_receipt_notes.created_by -> auth.users(id) 
ALTER TABLE public.goods_receipt_notes DROP CONSTRAINT IF EXISTS goods_receipt_notes_created_by_fkey;

-- asset_location_history.moved_by -> auth.users(id)
ALTER TABLE public.asset_location_history DROP CONSTRAINT IF EXISTS asset_location_history_moved_by_fkey;

-- maintenance_records.reported_by -> auth.users(id)
ALTER TABLE public.maintenance_records DROP CONSTRAINT IF EXISTS maintenance_records_reported_by_fkey;

-- asset_disposals.approved_by -> auth.users(id)
ALTER TABLE public.asset_disposals DROP CONSTRAINT IF EXISTS asset_disposals_approved_by_fkey;

-- employees.user_id -> auth.users(id) - already has ON DELETE SET NULL but still blocks restore
ALTER TABLE public.employees DROP CONSTRAINT IF EXISTS employees_user_id_fkey;

-- notifications.user_id -> auth.users(id)
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;

-- Change goods_receipt_notes.created_by from UUID to TEXT to store user name instead
ALTER TABLE public.goods_receipt_notes 
ALTER COLUMN created_by TYPE TEXT USING created_by::TEXT;
