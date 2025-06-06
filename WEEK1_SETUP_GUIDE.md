# PTO Connect - Week 1 Setup Guide

## 🎯 Immediate Tasks Checklist

### ✅ Task 1: Database Migration

**Status**: Ready to execute
**File**: `database-setup-complete.sql`

**Steps to complete:**
1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Navigate to your project: https://dakyetfomciihdiuwrbx.supabase.co
3. Go to SQL Editor
4. Copy and paste the entire contents of `database-setup-complete.sql`
5. Click "Run" to execute the script
6. Verify success message: "Database setup completed successfully!"

**What this does:**
- Creates all tables with proper multi-tenant structure
- Sets up Row Level Security (RLS) policies
- Creates helper functions for role checking
- Adds performance indexes
- Enables organization-based data isolation

---

### ⚠️ Task 2: API Keys Configuration

**Status**: Needs real credentials for production

**Current State:**
- ✅ Frontend environment variables configured
- ✅ Backend environment variables configured  
- ⚠️ Using placeholder values for security

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

### 🔧 Task 3: Development Environment Configuration

**Status**: ✅ Servers running successfully

**Current Setup:**
- Backend API: http://localhost:3000 ✅
- Frontend App: http://localhost:3001 ✅

**To start development servers:**
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

**Status**: Ready to test after database migration

**Test Scenarios:**

#### 4.1 Organization Creation Flow
1. Navigate to: http://localhost:3001/onboarding/create-pto
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
