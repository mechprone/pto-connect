# PTO Connect - API Keys Verification Guide

## 🎯 **Live Application Status**

### ✅ **Infrastructure Verified**
- **Frontend**: https://app.ptoconnect.com ✅ LIVE
- **Backend API**: https://api.ptoconnect.com ✅ LIVE
- **Routes**: All routes properly configured ✅

### 🔍 **API Keys Verification Steps**

## **Step 1: Basic Connectivity Test**

### Frontend Test:
```bash
# Test 1: Basic app loading
curl -I https://app.ptoconnect.com
# Expected: 200 OK

# Test 2: Check if React app loads
curl https://app.ptoconnect.com
# Expected: HTML with React app
```

### Backend Test:
```bash
# Test 1: API health check
curl https://api.ptoconnect.com
# Expected: "PTO Connect API is running"

# Test 2: Test CORS headers
curl -H "Origin: https://app.ptoconnect.com" https://api.ptoconnect.com
# Expected: Proper CORS headers
```

## **Step 2: Supabase Connection Test**

### Test Database Connection:
```bash
# Test auth endpoint (should return method not allowed but connect to DB)
curl -X GET https://api.ptoconnect.com/api/auth/test
# Expected: 405 Method Not Allowed (but no connection errors)

# Test organizations endpoint
curl -X GET https://api.ptoconnect.com/api/organizations
# Expected: 401 Unauthorized (but no DB connection errors)
```

### Browser Test:
1. **Navigate to**: https://app.ptoconnect.com/onboarding/create-pto
2. **Expected**: Organization creation form loads
3. **Check Console**: No Supabase connection errors

## **Step 3: API Keys Status Check**

### **Supabase Keys** (CRITICAL):
- ✅ **SUPABASE_URL**: Should be `https://dakyetfomciihdiuwrbx.supabase.co`
- ⚠️ **SUPABASE_ANON_KEY**: Verify in both Vercel and Render
- ⚠️ **SUPABASE_SERVICE_ROLE_KEY**: Verify in Render backend

### **Stripe Keys** (For Payments):
- ⚠️ **STRIPE_PUBLISHABLE_KEY**: Verify in Vercel frontend
- ⚠️ **STRIPE_SECRET_KEY**: Verify in Render backend
- ⚠️ **STRIPE_WEBHOOK_SECRET**: Verify in Render backend

### **OpenAI Keys** (For AI Features):
- ⚠️ **OPENAI_API_KEY**: Verify in Render backend

### **Twilio Keys** (For SMS):
- ⚠️ **TWILIO_ACCOUNT_SID**: Verify in Render backend
- ⚠️ **TWILIO_AUTH_TOKEN**: Verify in Render backend
- ⚠️ **TWILIO_PHONE_NUMBER**: Verify in Render backend

## **Step 4: Functional Testing**

### **Test 1: Organization Creation**
1. Go to: https://app.ptoconnect.com/onboarding/create-pto
2. Fill out organization form
3. Submit and check for errors
4. **Success**: Redirects to pricing page
5. **Failure**: Check console for Supabase errors

### **Test 2: User Authentication**
1. Go to: https://app.ptoconnect.com/signup
2. Try to create an account
3. **Success**: Account created, email verification sent
4. **Failure**: Check Supabase auth configuration

### **Test 3: API Endpoints**
```bash
# Test organization creation endpoint
curl -X POST https://api.ptoconnect.com/api/organizations \
  -H "Content-Type: application/json" \
  -d '{"name":"Test PTO","slug":"test-pto"}'
# Expected: 401 Unauthorized (but no connection errors)
```

## **Step 5: Environment Variables Verification**

### **Vercel Frontend Environment Variables**:
```bash
# Check in Vercel Dashboard > Project > Settings > Environment Variables
VITE_SUPABASE_URL=https://dakyetfomciihdiuwrbx.supabase.co
VITE_SUPABASE_ANON_KEY=[your-anon-key]
VITE_API_URL=https://api.ptoconnect.com
VITE_STRIPE_PUBLISHABLE_KEY=[your-stripe-key]
```

### **Render Backend Environment Variables**:
```bash
# Check in Render Dashboard > Service > Environment
NODE_ENV=production
PORT=10000
SUPABASE_URL=https://dakyetfomciihdiuwrbx.supabase.co
SUPABASE_ANON_KEY=[your-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]
STRIPE_SECRET_KEY=[your-stripe-secret]
STRIPE_WEBHOOK_SECRET=[your-webhook-secret]
OPENAI_API_KEY=[your-openai-key]
TWILIO_ACCOUNT_SID=[your-twilio-sid]
TWILIO_AUTH_TOKEN=[your-twilio-token]
TWILIO_PHONE_NUMBER=[your-twilio-phone]
```

## **Step 6: Error Diagnosis**

### **Common Issues & Solutions**:

#### **Frontend Issues**:
```bash
# Issue: "Network Error" in console
# Solution: Check VITE_API_URL points to https://api.ptoconnect.com

# Issue: "Supabase client error"
# Solution: Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

# Issue: Routes not working
# Solution: Check React Router configuration (already verified ✅)
```

#### **Backend Issues**:
```bash
# Issue: "Database connection failed"
# Solution: Verify SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY

# Issue: "CORS errors"
# Solution: Check CORS configuration allows https://app.ptoconnect.com

# Issue: "Stripe errors"
# Solution: Verify STRIPE_SECRET_KEY is valid test/live key
```

## **Step 7: Quick Verification Commands**

### **Test Everything at Once**:
```bash
# Frontend health
curl -s https://app.ptoconnect.com | grep -q "PTO Connect" && echo "✅ Frontend OK" || echo "❌ Frontend Error"

# Backend health  
curl -s https://api.ptoconnect.com | grep -q "running" && echo "✅ Backend OK" || echo "❌ Backend Error"

# Test organization route exists
curl -s -o /dev/null -w "%{http_code}" https://app.ptoconnect.com/onboarding/create-pto
# Expected: 200
```

## **🎯 Expected Results After Proper API Key Configuration**

### **✅ Success Indicators**:
1. **Organization creation form loads** without errors
2. **No Supabase connection errors** in browser console
3. **API endpoints respond** with proper error codes (not connection failures)
4. **User signup/login flows** work without database errors
5. **Payment processing** works (if Stripe keys configured)

### **⚠️ Warning Signs**:
1. **"Network Error"** - API URL misconfigured
2. **"Supabase client error"** - Database keys missing/invalid
3. **"CORS error"** - Backend CORS misconfigured
4. **"Stripe error"** - Payment keys missing/invalid

## **🚀 Next Steps After Verification**

Once API keys are verified working:
1. **Test full user flow** - Organization creation → User signup → Login
2. **Test core features** - Events, Communications, Budget tracking
3. **Test integrations** - Stripe payments, AI features, SMS notifications
4. **Performance testing** - Load testing, error handling
5. **Security review** - RLS policies, authentication flows

---

**🎯 Goal**: Confirm all API keys are properly configured and the live application is fully functional for production use.
