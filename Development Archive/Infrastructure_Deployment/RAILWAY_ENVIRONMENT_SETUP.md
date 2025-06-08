# 🚨 URGENT: Railway Environment Variables Setup
## Fix for Supabase Configuration Error

**Issue**: The frontend is showing a blank screen because Railway doesn't have the required environment variables.

**Error**: `supabaseUrl is required` - This means the Supabase environment variables aren't available in production.

---

## 🔧 IMMEDIATE FIX REQUIRED

### **Step 1: Access Railway Dashboard**
1. Go to https://railway.app/dashboard
2. Find your `pto-connect` frontend project
3. Click on the project to open it

### **Step 2: Set Environment Variables**
1. Click on the **"Variables"** tab in your Railway project
2. Add the following environment variables:

```
VITE_SUPABASE_URL=https://dakyetfomciihdiuwrbx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRha3lldGZvbWNpaWhkaXV3cmJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwODgzNDYsImV4cCI6MjA2MzY2NDM0Nn0.ylHsHeu-XoB2SRA4YDCLThjFk-Lq8jyK2RnsWk1JBiw
VITE_BACKEND_URL=https://api.ptoconnect.com
VITE_CLIENT_URL=https://app.ptoconnect.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51RUoQ8ELYORwZpGhOakEOCqOpL9AWarhS6CxkcuJAvXET27ifg5sX4K2tl6pq55sH6WGiBd4HR0TQnKfvqhXBRzE00n3DO68cY
```

### **Step 3: Trigger Redeploy**
1. After adding all environment variables, Railway should automatically redeploy
2. If not, click **"Deploy"** or **"Redeploy"** button
3. Wait for deployment to complete (usually 2-3 minutes)

### **Step 4: Verify Fix**
1. Visit https://app.ptoconnect.com/login
2. Should now show the login page instead of blank screen
3. Check browser console (F12) - should have no Supabase errors

---

## 🔍 VERIFICATION STEPS

### **Before Fix:**
- ❌ Blank white screen at app.ptoconnect.com
- ❌ Console error: "supabaseUrl is required"
- ❌ Cannot access any part of the application

### **After Fix:**
- ✅ Login page loads properly
- ✅ No Supabase configuration errors
- ✅ Can proceed with permission system testing

---

## 🚀 NEXT STEPS AFTER FIX

Once the environment variables are set and the site loads:

1. **Test Login** - Verify you can log in with admin credentials
2. **Test Admin Dashboard** - Navigate to /admin
3. **Test Permission Management** - Navigate to /admin/permissions
4. **Run Full Testing Suite** - Follow the TESTING_GUIDE_PHASE_1C_SPRINT_3.md

---

## 📋 RAILWAY ENVIRONMENT VARIABLES CHECKLIST

Make sure ALL of these are set in Railway:

- [ ] `VITE_SUPABASE_URL` - Supabase project URL
- [ ] `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- [ ] `VITE_BACKEND_URL` - Backend API URL (https://api.ptoconnect.com)
- [ ] `VITE_CLIENT_URL` - Frontend URL (https://app.ptoconnect.com)
- [ ] `VITE_STRIPE_PUBLISHABLE_KEY` - Stripe public key

---

## 🔧 TROUBLESHOOTING

### **If Still Getting Errors:**
1. **Check Variable Names** - Must be exactly as shown (case-sensitive)
2. **Check for Spaces** - No leading/trailing spaces in values
3. **Redeploy** - Force a new deployment after adding variables
4. **Clear Browser Cache** - Hard refresh (Ctrl+F5) after deployment

### **Common Issues:**
- **Typos in variable names** - Must start with `VITE_`
- **Missing variables** - All 5 variables are required
- **Old cache** - Browser may cache the broken version

---

## ⚡ PRIORITY: HIGH

**This is a blocking issue that prevents all testing of the new permission management system. The environment variables must be configured in Railway before we can proceed with any testing or development.**

**Estimated Fix Time: 5-10 minutes**
**Deployment Time: 2-3 minutes**
**Total Resolution Time: 10-15 minutes**
