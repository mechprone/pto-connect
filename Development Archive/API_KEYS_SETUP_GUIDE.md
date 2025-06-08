# PTO Connect - API Keys Setup Guide

## 🔑 Complete List of API Keys to Cycle

### ✅ **Already Done** (Stripe & OpenAI)
- Stripe (Publishable & Secret Keys)
- OpenAI API Key

### 🔄 **Still Need to Cycle**

#### **1. Supabase Keys** (CRITICAL - App won't work without these)
- **Where to get**: https://supabase.com/dashboard/project/[your-project]/settings/api
- **Keys needed**:
  - `SUPABASE_URL` (Project URL)
  - `SUPABASE_ANON_KEY` (Public anon key)
  - `SUPABASE_SERVICE_ROLE_KEY` (Service role key - backend only)

#### **2. Twilio Keys** (For SMS functionality)
- **Where to get**: https://console.twilio.com/
- **Keys needed**:
  - `TWILIO_ACCOUNT_SID`
  - `TWILIO_AUTH_TOKEN`
  - `TWILIO_PHONE_NUMBER` (Your Twilio phone number)

#### **3. Meta/Facebook Keys** (For social media posting)
- **Where to get**: https://developers.facebook.com/
- **Keys needed**:
  - `META_ACCESS_TOKEN`
  - `META_APP_ID`
  - `META_APP_SECRET`

---

## 📁 Where to Put the New Keys

### **Frontend Environment Variables** (`pto-connect/.env`)
```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://dakyetfomciihdiuwrbx.supabase.co
VITE_SUPABASE_ANON_KEY=your_new_supabase_anon_key_here

# API Configuration
VITE_API_URL=http://localhost:3000/api
VITE_CLIENT_URL=http://localhost:3001

# Stripe Configuration (Public Key)
VITE_STRIPE_PUBLISHABLE_KEY=your_new_stripe_publishable_key_here
```

### **Backend Environment Variables** (`pto-connect-backend/.env`)
```bash
# Supabase Backend Configuration
SUPABASE_URL=https://dakyetfomciihdiuwrbx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_new_supabase_service_role_key_here

# Server Configuration
PORT=3000

# API URLs
CLIENT_URL=http://localhost:3001

# OpenAI
OPENAI_API_KEY=your_new_openai_api_key_here

# Stripe
STRIPE_SECRET_KEY=your_new_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=your_new_stripe_webhook_secret_here

# Twilio
TWILIO_ACCOUNT_SID=your_new_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_new_twilio_auth_token_here
TWILIO_PHONE_NUMBER=your_new_twilio_phone_number_here

# Meta Graph API
META_ACCESS_TOKEN=your_new_meta_access_token_here
META_APP_ID=your_new_meta_app_id_here
META_APP_SECRET=your_new_meta_app_secret_here
```

---

## 🚀 For Production Deployment

### **Frontend Deployment** (Vercel/Netlify)
Add these environment variables in your deployment dashboard:
```
VITE_SUPABASE_URL=https://dakyetfomciihdiuwrbx.supabase.co
VITE_SUPABASE_ANON_KEY=your_new_supabase_anon_key_here
VITE_API_URL=https://your-backend-domain.com/api
VITE_CLIENT_URL=https://your-frontend-domain.com
VITE_STRIPE_PUBLISHABLE_KEY=your_new_stripe_publishable_key_here
```

### **Backend Deployment** (Render/Railway/Heroku)
Add these environment variables in your deployment dashboard:
```
SUPABASE_URL=https://dakyetfomciihdiuwrbx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_new_supabase_service_role_key_here
PORT=3000
CLIENT_URL=https://your-frontend-domain.com
OPENAI_API_KEY=your_new_openai_api_key_here
STRIPE_SECRET_KEY=your_new_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=your_new_stripe_webhook_secret_here
TWILIO_ACCOUNT_SID=your_new_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_new_twilio_auth_token_here
TWILIO_PHONE_NUMBER=your_new_twilio_phone_number_here
META_ACCESS_TOKEN=your_new_meta_access_token_here
META_APP_ID=your_new_meta_app_id_here
META_APP_SECRET=your_new_meta_app_secret_here
```

---

## 🔒 Security Best Practices

### **Key Priority Levels**:

#### **🚨 CRITICAL (App won't work without these)**:
1. **Supabase Keys** - Database and authentication
2. **Stripe Keys** - Payment processing (if using payments)

#### **⚠️ HIGH (Core features won't work)**:
3. **OpenAI Key** - AI features ✅ (Already done)

#### **📱 MEDIUM (Specific features won't work)**:
4. **Twilio Keys** - SMS notifications
5. **Meta Keys** - Social media posting

### **Key Management Tips**:
- ✅ Never commit real keys to GitHub
- ✅ Use different keys for development vs production
- ✅ Rotate keys regularly (every 3-6 months)
- ✅ Monitor key usage in respective dashboards
- ✅ Revoke old keys after confirming new ones work

---

## 🧪 Testing After Key Updates

### **1. Test Supabase Connection**:
```bash
# Check if database queries work
# Test user authentication
# Verify RLS policies
```

### **2. Test Stripe Integration**:
```bash
# Test payment processing
# Verify webhook endpoints
# Check subscription management
```

### **3. Test OpenAI Features**:
```bash
# Test AI content generation
# Verify API rate limits
# Check response quality
```

### **4. Test Twilio SMS**:
```bash
# Send test SMS
# Verify phone number format
# Check delivery status
```

### **5. Test Meta Integration**:
```bash
# Test social media posting
# Verify permissions
# Check API limits
```

---

## 📋 Quick Checklist

### **Keys to Cycle**:
- [ ] Supabase URL & Keys (CRITICAL)
- [ ] Twilio Account SID, Auth Token, Phone Number
- [ ] Meta Access Token, App ID, App Secret
- [x] Stripe Publishable & Secret Keys ✅
- [x] OpenAI API Key ✅

### **Files to Update**:
- [ ] `pto-connect/.env` (Frontend)
- [ ] `pto-connect-backend/.env` (Backend)
- [ ] Production deployment environment variables

### **After Updates**:
- [ ] Test local development environment
- [ ] Deploy to production
- [ ] Test all integrations
- [ ] Revoke old keys

---

**🎯 Priority Order**: Start with Supabase keys (most critical), then Twilio, then Meta. The app will work without Twilio and Meta, but not without Supabase!
