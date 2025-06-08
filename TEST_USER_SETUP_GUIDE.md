# 🔐 TEST USER SETUP GUIDE - PTO CONNECT

## 📋 **OVERVIEW**

This guide provides step-by-step instructions for setting up test users in Supabase to enable login functionality for PTO Connect.

---

## 🎯 **REQUIRED TEST USERS**

Based on `pto_test_users.xlsx`, the following users need to be created:

### **Sunset Elementary PTO (SUNSET2024)**
- **admin@sunsetpto.com** - Admin User (Role: admin)
- **board@sunsetpto.com** - Board Member (Role: board)
- **committee@sunsetpto.com** - Committee Lead (Role: committee)
- **volunteer@sunsetpto.com** - Volunteer User (Role: volunteer)
- **parent@sunsetpto.com** - Parent Member (Role: parent)
- **teacher@sunsetpto.com** - Teacher User (Role: teacher)

### **Oakwood Middle PTO (OAKWOOD123)**
- **admin@oakwoodpto.com** - Oakwood Admin (Role: admin)
- **parent@oakwoodpto.com** - Oakwood Parent (Role: parent)

**All users use password**: `TestPass123!`

---

## 🚀 **SETUP INSTRUCTIONS**

### **Step 1: Access Supabase Dashboard**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Sign in to your account
3. Select the PTO Connect project

### **Step 2: Create Auth Users**
1. Navigate to **Authentication** → **Users** in the sidebar
2. Click **"Add User"** button
3. For each test user, enter:
   - **Email**: (from list above)
   - **Password**: `TestPass123!`
   - **Email Confirm**: ✅ Check this box
   - **Auto Confirm User**: ✅ Check this box

### **Step 3: Set User Metadata**
For each created user:
1. Click on the user email in the users list
2. Scroll down to **"User Metadata"** section
3. Click **"Edit"** 
4. Add the following JSON:
```json
{
  "role": "admin"
}
```
Replace `"admin"` with the appropriate role for each user.

### **Step 4: Run Database Seed Script**
1. Navigate to **SQL Editor** in Supabase dashboard
2. Create a new query
3. Copy and paste the contents of `pto-connect/database/seed-test-users.sql`
4. Click **"Run"** to execute the script

### **Step 5: Verify Setup**
1. Go to **Table Editor** → **users** table
2. Confirm all test users are present
3. Check that roles are correctly assigned

---

## 🧪 **TESTING CHECKLIST**

### **✅ Supabase Auth Users Created**
- [ ] admin@sunsetpto.com
- [ ] board@sunsetpto.com  
- [ ] committee@sunsetpto.com
- [ ] volunteer@sunsetpto.com
- [ ] parent@sunsetpto.com
- [ ] teacher@sunsetpto.com
- [ ] admin@oakwoodpto.com
- [ ] parent@oakwoodpto.com

### **✅ User Metadata Set**
- [ ] All users have correct role in metadata
- [ ] Email confirmation enabled
- [ ] Auto-confirm enabled

### **✅ Database Records Created**
- [ ] Users table populated
- [ ] Sample transactions added
- [ ] Sample events created
- [ ] Sample fundraisers added
- [ ] Sample teacher requests added
- [ ] Sample documents added

### **✅ Login Testing**
- [ ] admin@sunsetpto.com can log in
- [ ] Redirects to correct dashboard
- [ ] No page reload on login
- [ ] Enter key works for submission

---

## 🔧 **TROUBLESHOOTING**

### **Issue: 400 Error on Login**
**Cause**: User doesn't exist in Supabase Auth
**Solution**: Create user in Supabase Dashboard → Authentication → Users

### **Issue: User exists but no role**
**Cause**: Missing user metadata
**Solution**: Add role to user metadata in Supabase Dashboard

### **Issue: Login succeeds but dashboard fails**
**Cause**: User not in database users table
**Solution**: Run the seed script to populate users table

### **Issue: Environment variables**
**Cause**: Missing or incorrect Supabase configuration
**Solution**: Check `.env` file has correct SUPABASE_URL and SUPABASE_ANON_KEY

---

## 📝 **QUICK SETUP COMMANDS**

### **For Database Setup:**
```sql
-- Run this in Supabase SQL Editor
-- (Copy from pto-connect/database/seed-test-users.sql)
```

### **For User Metadata (JSON):**
```json
{
  "role": "admin"
}
```

---

## 🎊 **VERIFICATION STEPS**

### **1. Test Login Locally**
```bash
cd pto-connect
npm run dev
# Visit http://localhost:3000/login
# Try: admin@sunsetpto.com / TestPass123!
```

### **2. Test Login on Production**
```
# Visit https://pto-connect.vercel.app/login
# Try: admin@sunsetpto.com / TestPass123!
```

### **3. Verify Dashboard Access**
- Should redirect to appropriate dashboard based on role
- Should show user-specific content
- Should have proper navigation

---

## 🚨 **IMPORTANT NOTES**

1. **Two-Step Process**: Supabase requires users to be created in both:
   - Supabase Auth (for login)
   - Database users table (for app data)

2. **Role Metadata**: The role must be stored in Supabase Auth user metadata for the app to work correctly

3. **Email Confirmation**: Disable email confirmation for test users to avoid email verification step

4. **Password Requirements**: Supabase requires strong passwords (8+ chars, mixed case, numbers, symbols)

---

## 📞 **SUPPORT**

If you encounter issues:
1. Check Supabase project logs
2. Verify environment variables
3. Confirm RLS policies are active
4. Test with browser developer tools open

**🎯 Goal**: Enable seamless login testing for PTO Connect with realistic test data.
