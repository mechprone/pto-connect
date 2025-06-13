# 🚀 Railway Supabase Environment Variables Setup Guide

## Overview
The frontend and public sites are showing "supabaseUrl is required" errors because they need Supabase environment variables configured in Railway. The backend already has these configured, which is why it's working properly.

## Required Environment Variables

### For Backend (pto-connect-backend):
✅ **Already Configured** - Backend is working properly
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### For Frontend (pto-connect):
❌ **Needs Configuration**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_URL=https://api.ptoconnect.com/api`
- `VITE_CLIENT_URL=https://app.ptoconnect.com`

### For Public Site (pto-connect-public):
❌ **Needs Configuration**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_URL=https://api.ptoconnect.com/api`
- `VITE_CLIENT_URL=https://www.ptoconnect.com`

## Step-by-Step Setup Instructions

### Step 1: Get Supabase Keys
1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the following values:
   - **Project URL** (for `VITE_SUPABASE_URL`)
   - **anon public** key (for `VITE_SUPABASE_ANON_KEY`)

### Step 2: Configure Frontend Environment Variables
1. Go to Railway dashboard: https://railway.app/dashboard
2. Select your **pto-connect** project (frontend)
3. Click on **Variables** tab
4. Add the following environment variables:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_API_URL=https://api.ptoconnect.com/api
VITE_CLIENT_URL=https://app.ptoconnect.com
```

### Step 3: Configure Public Site Environment Variables
1. Go to Railway dashboard: https://railway.app/dashboard
2. Select your **pto-connect-public** project
3. Click on **Variables** tab
4. Add the following environment variables:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_API_URL=https://api.ptoconnect.com/api
VITE_CLIENT_URL=https://www.ptoconnect.com
```

### Step 4: Trigger Rebuilds
After adding the environment variables:
1. Both services should automatically redeploy
2. If not, you can manually trigger a redeploy by:
   - Going to the **Deployments** tab
   - Clicking **Deploy** on the latest deployment

## Expected Results After Setup

### ✅ What Should Work:
- Frontend should load without "supabaseUrl is required" error
- Public site should load without "supabaseUrl is required" error
- Supabase authentication should be available
- API calls to backend should work properly

### 🔍 How to Verify:
1. Visit https://app.ptoconnect.com - should load without errors
2. Visit https://www.ptoconnect.com - should load without errors
3. Check browser console - no Supabase configuration errors
4. Authentication flows should be available

## Troubleshooting

### If Variables Don't Take Effect:
1. Check that variable names are exactly correct (case-sensitive)
2. Ensure no extra spaces in variable names or values
3. Manually trigger a redeploy if auto-deploy didn't work
4. Check deployment logs for any build errors

### If Still Getting Supabase Errors:
1. Verify the Supabase URL format: `https://your-project-id.supabase.co`
2. Ensure the anon key is the public anon key, not the service role key
3. Check that the Supabase project is active and accessible

## Current Status
- ✅ **Backend**: Fully configured and operational
- ❌ **Frontend**: Needs Supabase environment variables
- ❌ **Public**: Needs Supabase environment variables

Once these environment variables are configured, all three services will be fully operational with complete Supabase integration.
