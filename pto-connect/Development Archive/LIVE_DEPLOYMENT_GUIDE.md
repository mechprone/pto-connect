# PTO Connect - Live Deployment Guide

## 🚀 **Live Deployment Overview**

**Frontend**: Deploy to Vercel (React app)
**Backend**: Deploy to Render (Node.js API)
**Database**: Already on Supabase (live)

## 📋 **Pre-Deployment Checklist**

### ✅ **Completed**:
- ✅ Database setup complete on Supabase
- ✅ Frontend code pushed to GitHub
- ✅ Backend code pushed to GitHub
- ✅ Environment variable templates ready

### 🔄 **Required for Deployment**:
- [ ] Update Supabase API keys
- [ ] Deploy backend to Render
- [ ] Deploy frontend to Vercel
- [ ] Update CORS settings
- [ ] Test live application

---

## 🎯 **Step 1: Update API Keys for Production**

### **1.1 Get Supabase Keys**
1. Go to: https://supabase.com/dashboard/project/dakyetfomciihdiuwrbx/settings/api
2. Copy these values:
   - **URL**: `https://dakyetfomciihdiuwrbx.supabase.co`
   - **anon/public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRha3lldGZvbWNpaWhkaXV3cmJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwODgzNDYsImV4cCI6MjA2MzY2NDM0Nn0.ylHsHeu-XoB2SRA4YDCLThjFk-Lq8jyK2RnsWk1JBiw`
   - **service_role key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRha3lldGZvbWNpaWhkaXV3cmJ4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODA4ODM0NiwiZXhwIjoyMDYzNjY0MzQ2fQ.bTv1srF785LRBOGFojEqqVvEFJNqddqKHgKrVllWdbQ`

### **1.2 Prepare Environment Variables**
You'll need these for both Vercel and Render deployments.

---

## 🖥️ **Step 2: Deploy Backend to Render**

### **2.1 Create Render Account**
1. Go to: https://render.com
2. Sign up/login with GitHub
3. Connect your GitHub account

### **2.2 Deploy Backend Service**
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository: `pto-connect-backend`
3. Configure deployment:

**Basic Settings:**
- **Name**: `pto-connect-backend`
- **Region**: `US East (Ohio)` or closest to you
- **Branch**: `main`
- **Root Directory**: Leave blank
- **Runtime**: `Node`
- **Build Command**: `npm install` (⚠️ Use npm, not pnpm for Render)
- **Start Command**: `npm start`

**⚠️ IMPORTANT**: If you get pnpm cache errors, use these settings:
- **Build Command**: `rm -rf node_modules && npm install`
- **Start Command**: `npm start`

**Environment Variables** (Add these in Render dashboard):
```bash
NODE_ENV=production
PORT=10000

# Supabase (CRITICAL)
SUPABASE_URL=https://dakyetfomciihdiuwrbx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]

# Stripe (Optional for now)
STRIPE_SECRET_KEY=sk_test_[your-key]
STRIPE_WEBHOOK_SECRET=whsec_[your-webhook-secret]

# OpenAI (Optional for now)
OPENAI_API_KEY=sk-[your-key]

# Twilio (Optional for now)
TWILIO_ACCOUNT_SID=[your-sid]
TWILIO_AUTH_TOKEN=[your-token]
TWILIO_PHONE_NUMBER=[your-phone]

# Meta (Optional for now)
META_ACCESS_TOKEN=[your-token]
META_APP_ID=[your-app-id]
META_APP_SECRET=[your-secret]
```

4. Click **"Create Web Service"**
5. Wait for deployment (5-10 minutes)
6. Note your backend URL: `https://pto-connect-backend.onrender.com`

---

## 🌐 **Step 3: Deploy Frontend to Vercel**

### **3.1 Create Vercel Account**
1. Go to: https://vercel.com
2. Sign up/login with GitHub
3. Connect your GitHub account

### **3.2 Deploy Frontend**
1. Click **"New Project"**
2. Import your GitHub repository: `pto-connect`
3. Configure deployment:

**Project Settings:**
- **Project Name**: `pto-connect`
- **Framework Preset**: `Vite`
- **Root Directory**: Leave blank
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

**Environment Variables** (Add these in Vercel dashboard):
```bash
# Supabase (CRITICAL)
VITE_SUPABASE_URL=https://dakyetfomciihdiuwrbx.supabase.co
VITE_SUPABASE_ANON_KEY=[your-anon-key]

# Backend API (Update after Render deployment)
VITE_API_URL=https://pto-connect-backend.onrender.com

# Stripe (Optional for now)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_[your-key]

# Meta (Optional for now)
VITE_META_APP_ID=[your-app-id]
```

4. Click **"Deploy"**
5. Wait for deployment (3-5 minutes)
6. Note your frontend URL: `https://pto-connect.vercel.app`

---

## 🔧 **Step 4: Update CORS and API Settings**

### **4.1 Update Backend CORS**
Your backend needs to allow requests from your Vercel domain.

**File**: `pto-connect-backend/index.js`
```javascript
// Update CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3001',
    'https://pto-connect.vercel.app',  // Add your Vercel domain
    'https://pto-connect-*.vercel.app' // Allow preview deployments
  ],
  credentials: true
};
```

### **4.2 Update Frontend API URL**
Make sure your frontend points to the live backend.

**File**: `pto-connect/src/utils/api.js`
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://pto-connect-backend.onrender.com';
```

### **4.3 Redeploy After Changes**
1. Push changes to GitHub
2. Both Vercel and Render will auto-redeploy
3. Wait for deployments to complete

---

## 🧪 **Step 5: Test Live Application**

### **5.1 Basic Functionality Test**
1. Visit: `https://pto-connect.vercel.app`
2. Check that the homepage loads
3. Navigate to: `/onboarding/simple-signup`
4. Test organization creation flow

### **5.2 API Connectivity Test**
1. Open browser developer tools
2. Check Network tab for API calls
3. Verify calls to `https://pto-connect-backend.onrender.com`
4. Check for CORS errors

### **5.3 Database Connectivity Test**
1. Try creating a test organization
2. Check Supabase dashboard for new data
3. Verify authentication works
4. Test user signup flow

---

## 🔍 **Step 6: Troubleshooting Common Issues**

### **Backend Deployment Issues**
```bash
# Check Render logs
# Verify environment variables are set
# Check Node.js version compatibility
# Verify package.json scripts
```

### **Frontend Deployment Issues**
```bash
# Check Vercel build logs
# Verify environment variables start with VITE_
# Check for import/export errors
# Verify API URL is correct
```

### **CORS Issues**
```bash
# Update backend CORS origins
# Check browser console for CORS errors
# Verify API calls use correct domain
# Test with browser dev tools
```

### **Database Connection Issues**
```bash
# Verify Supabase keys are correct
# Check Supabase project status
# Test database connection in Render logs
# Verify RLS policies allow service role
```

---

## 📊 **Step 7: Monitor and Verify**

### **7.1 Deployment URLs**
- **Frontend**: `https://pto-connect.vercel.app`
- **Backend**: `https://pto-connect-backend.onrender.com`
- **Database**: `https://dakyetfomciihdiuwrbx.supabase.co`

### **7.2 Health Checks**
- [ ] Frontend loads without errors
- [ ] Backend API responds to requests
- [ ] Database connections work
- [ ] Authentication flow functional
- [ ] Organization creation works

### **7.3 Performance Monitoring**
- **Vercel**: Built-in analytics and performance monitoring
- **Render**: Service metrics and logs
- **Supabase**: Database performance and usage stats

---

## 🎯 **Step 8: Post-Deployment Configuration**

### **8.1 Custom Domain (Optional)**
1. **Vercel**: Add custom domain in project settings
2. **Render**: Add custom domain in service settings
3. Update CORS and API URLs accordingly

### **8.2 SSL Certificates**
- **Vercel**: Automatic SSL for all deployments
- **Render**: Automatic SSL for all services
- **Supabase**: SSL enabled by default

### **8.3 Environment Management**
- **Production**: Live deployment URLs
- **Staging**: Use Vercel preview deployments
- **Development**: Local development servers

---

## 🚀 **Quick Deployment Commands**

### **Deploy Backend to Render**
```bash
# Push to GitHub (auto-deploys to Render)
git add .
git commit -m "Deploy to production"
git push origin main
```

### **Deploy Frontend to Vercel**
```bash
# Push to GitHub (auto-deploys to Vercel)
git add .
git commit -m "Deploy to production"
git push origin main
```

### **Manual Redeploy**
- **Render**: Click "Manual Deploy" in dashboard
- **Vercel**: Click "Redeploy" in dashboard

---

## 🎉 **Success Criteria**

Your deployment is successful when:
- ✅ Frontend loads at Vercel URL
- ✅ Backend responds at Render URL
- ✅ Database connections work
- ✅ User can create organizations
- ✅ Authentication flow works
- ✅ No CORS errors in browser console
- ✅ API calls complete successfully

**🎯 Goal**: Have a fully functional, live PTO Connect application accessible via public URLs for testing and demonstration.
