# 🚨 Railway Deployment Troubleshooting
## Environment Variables Not Loading Issue

**Current Status**: Environment variables are set in Shared Variables but frontend still shows blank screen.

---

## 🔧 SOLUTION: Set Variables at Service Level

The issue is likely that the variables need to be set at the **individual service level** rather than just shared variables.

### **Step 1: Access Your Frontend Service**
1. Go to https://railway.app/dashboard
2. Click on your **pto-connect** project
3. You should see multiple services (frontend, backend, etc.)
4. Click on the **frontend service** (the one that deploys to app.ptoconnect.com)

### **Step 2: Set Service-Level Variables**
1. In the frontend service, click on the **"Variables"** tab
2. Add the same environment variables directly to this service:

```
VITE_SUPABASE_URL=https://dakyetfomciihdiuwrbx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRha3lldGZvbWNpaWhkaXV3cmJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwODgzNDYsImV4cCI6MjA2MzY2NDM0Nn0.ylHsHeu-XoB2SRA4YDCLThjFk-Lq8jyK2RnsWk1JBiw
VITE_BACKEND_URL=https://api.ptoconnect.com
VITE_CLIENT_URL=https://app.ptoconnect.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51RUoQ8ELYORwZpGhOakEOCqOpL9AWarhS6CxkcuJAvXET27ifg5sX4K2tl6pq55sH6WGiBd4HR0TQnKfvqhXBRzE00n3DO68cY
```

### **Step 3: Force Redeploy**
1. After adding variables, click **"Deploy"** or **"Redeploy"** 
2. Wait for deployment to complete (2-3 minutes)
3. Check the deployment logs for any errors

---

## 🔍 ALTERNATIVE DEBUGGING STEPS

### **Check Deployment Logs**
1. In your frontend service, click on **"Deployments"** tab
2. Click on the latest deployment
3. Check the **build logs** for any errors
4. Look for environment variable references during build

### **Verify Build Process**
The build logs should show:
```
✓ Environment variables loaded
✓ Vite build completed
✓ Static files generated
```

### **Check Service Configuration**
1. Make sure the frontend service is connected to the correct GitHub repository
2. Verify the build command is: `npm run build`
3. Verify the start command is: `npm run preview` or similar

---

## 🚨 COMMON RAILWAY ISSUES

### **Issue 1: Wrong Service Type**
- Make sure your frontend is deployed as a **"Static Site"** or **"Web Service"**
- Not as a "Database" or "Worker"

### **Issue 2: Build Command Problems**
- Build command should be: `npm run build`
- Start command should be: `npm run preview` or `npm start`

### **Issue 3: Port Configuration**
- Railway should automatically detect the port
- If not, set `PORT` environment variable to `3000`

### **Issue 4: Domain Configuration**
- Verify the custom domain (app.ptoconnect.com) is properly configured
- Check DNS settings if using custom domain

---

## 🔧 MANUAL VERIFICATION STEPS

### **Step 1: Check Build Output**
In deployment logs, look for:
```
Building for production...
✓ 1234 modules transformed.
dist/index.html                  0.45 kB
dist/assets/index-abc123.js      123.45 kB
✓ built in 30s
```

### **Step 2: Check Environment Loading**
Look for lines like:
```
VITE_SUPABASE_URL: https://dakyetfomciihdiuwrbx.supabase.co
VITE_BACKEND_URL: https://api.ptoconnect.com
```

### **Step 3: Test Direct Access**
Try accessing: `https://your-railway-url.railway.app` (the Railway-generated URL)
If this works but app.ptoconnect.com doesn't, it's a domain issue.

---

## 🚀 QUICK TEST AFTER FIX

1. **Visit**: https://app.ptoconnect.com/login
2. **Expected**: Login form appears (not blank screen)
3. **Console**: No "supabaseUrl is required" error
4. **Network Tab**: Should see API calls to api.ptoconnect.com

---

## 📞 IF STILL NOT WORKING

### **Last Resort Options:**

1. **Delete and Recreate Service**
   - Remove the frontend service from Railway
   - Create a new service from the same GitHub repo
   - Set environment variables during creation

2. **Check Railway Status**
   - Visit https://status.railway.app
   - Check for any ongoing issues

3. **Alternative: Use Railway CLI**
   ```bash
   railway login
   railway link
   railway variables set VITE_SUPABASE_URL=https://dakyetfomciihdiuwrbx.supabase.co
   railway deploy
   ```

---

## ⏰ EXPECTED TIMELINE

- **Variable Setup**: 5 minutes
- **Deployment**: 3-5 minutes  
- **DNS Propagation**: 1-2 minutes
- **Total**: 10-15 minutes maximum

**The new permission management system is ready to test as soon as this deployment issue is resolved!**
