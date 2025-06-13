# 📋 Backup Export Format Guide

**Date**: June 12, 2025  
**Purpose**: Guide for exporting database backup data  
**Recommended Format**: CSV

---

## 🎯 RECOMMENDED FORMAT: CSV

### ✅ Why CSV is Best for This Backup:

1. **Easy to Read**: Human-readable format for verification
2. **Universal Support**: Opens in Excel, Google Sheets, any text editor
3. **Simple Restoration**: Easy to convert back to SQL INSERT statements
4. **Compact Size**: Smaller file sizes than JSON
5. **No Formatting Issues**: No special characters or escaping problems

### 📊 How to Export as CSV in Supabase:

**Step 1: Run Query**
```sql
SELECT * FROM profiles;
```

**Step 2: Export Results**
1. After running the query, look for **"Download CSV"** button in Supabase SQL Editor
2. Click the download button (usually appears near the results)
3. Save as `profiles_backup.csv`

**Step 3: Repeat for Each Table**
- `organizations_backup.csv`
- `events_backup.csv` (if any data)
- `transactions_backup.csv` (if any data)
- `foreign_keys_backup.csv` (constraint definitions)

---

## 📁 BACKUP FILE STRUCTURE

Create a folder on your computer: `PTO_Connect_Backup_2025-06-12/`

**Files to Save:**
```
PTO_Connect_Backup_2025-06-12/
├── profiles_backup.csv              # User profile data (8 records)
├── organizations_backup.csv         # Organization data (1 record)
├── events_backup.csv               # Event data (if any)
├── transactions_backup.csv         # Transaction data (if any)
├── foreign_keys_backup.csv         # Current constraint definitions
└── table_structures.txt            # Column definitions
```

---

## 🔄 ALTERNATIVE: Copy-Paste Method

If CSV download isn't available in Supabase free plan:

**Step 1: Run Query**
```sql
SELECT * FROM profiles;
```

**Step 2: Copy Results**
1. Select all result rows in Supabase interface
2. Copy to clipboard (Ctrl+C)
3. Paste into Excel or Google Sheets
4. Save as CSV

**Step 3: Manual Text Backup**
As a fallback, copy the raw text results and save to `.txt` files:
- `profiles_backup.txt`
- `organizations_backup.txt`

---

## 🚨 CRITICAL BACKUP ITEMS

### Must-Have Backups:
1. **profiles table** (your 8 user records) - CRITICAL
2. **organizations table** (your PTO data) - CRITICAL  
3. **Foreign key constraints** (for rollback) - IMPORTANT

### Nice-to-Have Backups:
4. events table (if any data exists)
5. transactions table (if any data exists)
6. Table structure definitions

---

## 📝 BACKUP VERIFICATION

After exporting, verify your backups:

**Check File Sizes:**
- `profiles_backup.csv` should have 8 rows + header
- `organizations_backup.csv` should have 1 row + header
- Files should not be empty (0 bytes)

**Quick Content Check:**
- Open CSV files to verify data looks correct
- Check that UUIDs, names, emails are present
- Ensure no obvious corruption or missing data

---

## 🔄 RESTORATION PROCESS (If Needed)

If you need to restore from CSV backups:

**Step 1: Clear Tables**
```sql
DELETE FROM profiles;
DELETE FROM organizations;
```

**Step 2: Import CSV Data**
- Use Supabase's CSV import feature
- Or convert CSV back to INSERT statements
- Or manually re-enter the small amount of data

**Step 3: Restore Constraints**
- Run the saved foreign key constraint commands
- Verify relationships are restored

---

## 🎯 RECOMMENDATION

**For Your Migration:**
1. **Export profiles as CSV** (most important - 8 records)
2. **Export organizations as CSV** (1 record)
3. **Copy foreign key definitions** to text file
4. **Proceed with migration** - low risk with good backups

**Time Required:** 5-10 minutes for complete backup
**Storage Space:** Less than 1MB total for all files

---

**Status**: CSV format recommended for optimal backup strategy  
**Next Step**: Export data, then proceed with migration  
**Risk Level**: Very low with proper CSV backups
