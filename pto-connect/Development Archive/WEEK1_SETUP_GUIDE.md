# PTO Connect - Week 1 Setup Guide

## 🎯 Immediate Tasks Checklist

### ✅ Task 1: Database Migration

**Status**: ✅ COMPLETED
**File**: `database-diagnostic-and-fix.sql` (successfully executed)

**✅ COMPLETED STEPS:**
1. ✅ Diagnosed existing database state
2. ✅ Fixed notifications table structure issues
3. ✅ Created all 13 tables with proper schema
4. ✅ Set up Row Level Security (RLS) policies
5. ✅ Created helper functions for role checking
6. ✅ Added performance indexes
7. ✅ Verified notifications table has correct columns

**Verification Output Received:**
```
"Final notifications table columns: id, org_id, user_id, title, message, type, action_url, is_read, created_at"
```

**What this does:**
- Creates all tables with proper multi-tenant structure
- Sets up Row Level Security (RLS) policies
- Creates helper functions for role checking
- Adds performance indexes
- Enables organization-based data isolation

---

### ⚠️ Task 2: API Keys Configuration

**Status**: ⚠️ CRITICAL - Required for live app functionality

**Current State:**
- ✅ Frontend environment variables configured
- ✅ Backend environment variables configured  
- ✅ Live deployment infrastructure ready
- ⚠️ **URGENT**: Need real API keys for production functionality

**NEXT IMMEDIATE STEP**: Add real API keys to live services

**Required API Keys:**

#### Supabase (CRITICAL - App won't work without these)
```bash
# Get from: https://supabase.com/dashboard/project/[your-project]/settings/api
SUPABASE_URL=https://dakyetfomciihdiuwrbx.supabase.co
SUPABASE_ANON_KEY=[your-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]
```

#### Stripe (For payments)
```bash
# Get from: https://dashboard.stripe.com/apikeys
STRIPE_PUBLISHABLE_KEY=pk_test_[your-key]
STRIPE_SECRET_KEY=sk_test_[your-key]
STRIPE_WEBHOOK_SECRET=whsec_[your-webhook-secret]
```

#### OpenAI (For AI features)
```bash
# Get from: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-[your-key]
```

#### Twilio (For SMS)
```bash
# Get from: https://console.twilio.com/
TWILIO_ACCOUNT_SID=[your-sid]
TWILIO_AUTH_TOKEN=[your-token]
TWILIO_PHONE_NUMBER=[your-phone]
```

#### Meta/Facebook (For social posting)
```bash
# Get from: https://developers.facebook.com/
META_ACCESS_TOKEN=[your-token]
META_APP_ID=[your-app-id]
META_APP_SECRET=[your-secret]
```

---

### 🔧 Task 3: Live Production Deployment

**Status**: ✅ COMPLETED - Both services deployed successfully!

**Live URLs:**
- **Frontend**: https://app.ptoconnect.com ✅ LIVE
- **Backend API**: https://api.ptoconnect.com ✅ LIVE

**Deployment Details:**
- ✅ Frontend deployed to Vercel
- ✅ Backend deployed to Render (after cache issues resolved)
- ✅ Custom domains configured and working
- ✅ HTTPS certificates active

**Local Development (still available):**
```bash
# Terminal 1 - Backend
cd pto-connect-backend
pnpm start

# Terminal 2 - Frontend  
cd pto-connect
pnpm dev
```

---

### 🧪 Task 4: Test User Authentication Flow

**Status**: ⚠️ NEXT PRIORITY - Test live application functionality

**Test on Live URLs:**
- **Frontend**: https://app.ptoconnect.com
- **Backend API**: https://api.ptoconnect.com

**Test Scenarios:**

#### 4.1 Organization Creation Flow
1. Navigate to: https://app.ptoconnect.com/onboarding/create-pto
2. Fill in PTO details
3. Proceed through pricing (will need Stripe keys)
4. Complete admin account creation
5. Verify organization and signup code generation

#### 4.2 User Join Flow
1. Use signup code from step 4.1
2. Test user joining existing organization
3. Verify role assignment and permissions

#### 4.3 Authentication Testing
1. Test login/logout functionality
2. Verify protected routes work correctly
3. Test role-based access control

**Local Testing (backup):**
```bash
# If needed for debugging
http://localhost:3001/onboarding/create-pto
```

---

### 🏢 Task 5: Multi-Tenant Data Isolation Verification

**Status**: Ready after database setup

**Verification Steps:**

#### 5.1 Create Test Organizations
```sql
-- Run in Supabase SQL Editor after main setup
INSERT INTO organizations (name, slug, signup_code, subscription_status, trial_ends_at, settings)
VALUES 
  ('Lincoln Elementary PTO', 'lincoln-elementary', 'LINCOLN123', 'trial', now() + interval '14 days', '{"school_name": "Lincoln Elementary"}'),
  ('Washington Middle PTO', 'washington-middle', 'WASH456', 'trial', now() + interval '14 days', '{"school_name": "Washington Middle School"}');
```

#### 5.2 Test Data Isolation
1. Create users in different organizations
2. Create events, transactions, etc. in each org
3. Verify users can only see their organization's data
4. Test RLS policies are working correctly

---

## 🚀 Quick Start Commands

### Start Development Environment
```bash
# Clone and setup (if not done)
cd pto-connect-backend && pnpm install && pnpm start &
cd pto-connect && pnpm install && pnpm dev
```

### Database Setup
```bash
# Copy database-setup-complete.sql to Supabase SQL Editor and run
```

### Test Application
```bash
# Open browser to:
http://localhost:3001
http://localhost:3001/onboarding/create-pto
```

---

## 🔍 Verification Checklist

### Database Setup ✅/❌
- [ ] Tables created successfully
- [ ] RLS policies enabled
- [ ] Helper functions working
- [ ] Test organization created
- [ ] No SQL errors in Supabase logs

### API Configuration ✅/❌
- [ ] Supabase keys updated
- [ ] Backend connects to database
- [ ] Frontend can call backend APIs
- [ ] Authentication flow works
- [ ] Error handling functional

### User Authentication ✅/❌
- [ ] Organization creation works
- [ ] User signup completes
- [ ] Login/logout functional
- [ ] Protected routes work
- [ ] Role-based access enforced

### Multi-Tenant Isolation ✅/❌
- [ ] Users see only their org data
- [ ] RLS policies prevent cross-org access
- [ ] Signup codes work correctly
- [ ] Organization settings isolated
- [ ] Admin controls work properly

---

## 🐛 Common Issues & Solutions

### Database Connection Issues
```bash
# Check Supabase URL and keys in .env files
# Verify RLS policies don't block service role
# Check Supabase project status
```

### Authentication Failures
```bash
# Verify JWT tokens are being sent
# Check Supabase auth settings
# Ensure user profiles are created
```

### API Errors
```bash
# Check backend server logs
# Verify CORS settings
# Test API endpoints directly
```

### Frontend Build Issues
```bash
# Clear node_modules and reinstall
# Check for import/export errors
# Verify environment variables loaded
```

---

## 📋 Next Steps After Week 1

Once all immediate tasks are complete:

1. **Core MVP Features (Week 2-3)**
   - Events management system
   - Communication tools
   - Budget tracking
   - Teacher request workflow

2. **Advanced Features (Week 4-5)**
   - AI integration
   - Stripe payment processing
   - Document management
   - Analytics dashboard

3. **Production Deployment**
   - Environment configuration
   - Security hardening
   - Performance optimization
   - Monitoring setup

---

**🎯 Goal**: Complete all Week 1 tasks to have a fully functional multi-tenant PTO management platform ready for feature development.
