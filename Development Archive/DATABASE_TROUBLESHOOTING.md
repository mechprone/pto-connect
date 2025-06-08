# Database Setup Troubleshooting Guide

## ✅ **FIXED: Column "user_id" does not exist error**

**Problem**: The `event_rsvps` table and its RLS policy had mismatched column names.

**Solution**: Updated `database-setup-complete.sql` to use consistent `profile_id` column naming.

## 🔧 **How to Apply the Fix**

### **Option 1: Fresh Setup (Recommended)**
1. Go to Supabase Dashboard → SQL Editor
2. Run the updated `database-setup-complete.sql` script
3. The script will create all tables with correct column names

### **Option 2: If You Already Ran the Script**
1. Go to Supabase Dashboard → SQL Editor
2. Run this fix script:

```sql
-- Fix the event_rsvps table column name
ALTER TABLE event_rsvps RENAME COLUMN user_id TO profile_id;

-- Update the RLS policy
DROP POLICY IF EXISTS "Users can manage their own RSVPs" ON event_rsvps;
CREATE POLICY "Users can manage their own RSVPs" ON event_rsvps
  FOR ALL USING (profile_id = auth.uid());
```

## 🧪 **Test the Database Setup**

After running the script, verify it worked:

```sql
-- Check if all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true;

-- Test the helper functions
SELECT get_user_org_id();
SELECT user_has_role('admin');
```

## 🎯 **Expected Results**

You should see:
- ✅ 13 tables created successfully
- ✅ All tables have RLS enabled
- ✅ Helper functions created
- ✅ No column reference errors
- ✅ Message: "Database setup completed successfully!"

## 🚨 **Common Issues & Solutions**

### **Issue**: "function get_user_org_id() does not exist"
**Solution**: Make sure you're running the complete script, not just parts of it.

### **Issue**: "permission denied for table"
**Solution**: Make sure you're running the script as the database owner/admin.

### **Issue**: "relation already exists"
**Solution**: The script uses `IF NOT EXISTS` so this is normal and safe.

## 📞 **Still Having Issues?**

1. Check the Supabase logs for detailed error messages
2. Verify you're running the script in the correct database
3. Make sure your Supabase project is active and not paused
4. Try running the script in smaller sections to isolate the issue

**The database is now ready for the PTO Connect application!**
