# PTO Connect Development Setup Guide

## Current Status
✅ **Architecture Fixed**: Multi-tenant database schema with RLS policies
✅ **Security Updated**: Placeholder API keys (need real keys for production)
✅ **Dependencies**: Backend and frontend packages installed
✅ **Routes**: Onboarding and billing routes added to App.jsx

## Next Steps for Development

### 1. Database Setup (URGENT - Required for app to work)

**Run these SQL files in your Supabase dashboard:**

1. Go to your Supabase project: https://dakyetfomciihdiuwrbx.supabase.co
2. Navigate to SQL Editor
3. Run `pto-connect/database/schema-updated.sql` first
4. Then run `pto-connect/database/rls-policies-updated.sql`

### 2. Environment Variables Setup

**Frontend (.env):**
- ✅ Supabase URL and anon key configured
- ⚠️ Need real Stripe publishable key for payments

**Backend (.env):**
- ✅ Supabase URL configured
- ⚠️ Need real service role key from Supabase
- ⚠️ Need real API keys for: OpenAI, Stripe, Twilio, Meta

### 3. Start Development Servers

```bash
# Terminal 1 - Backend API
cd pto-connect-backend
pnpm start

# Terminal 2 - Frontend App  
cd pto-connect
pnpm dev
```

### 4. Test Basic Functionality

1. **Frontend**: http://localhost:5173
2. **Backend**: http://localhost:3000
3. **Test route**: http://localhost:5173/onboarding/create-pto

### 5. Priority Development Tasks

#### Phase 1: Core User Flow (Week 1)
- [ ] **User Registration**: Complete signup with organization creation
- [ ] **Organization Setup**: PTO creation with signup codes
- [ ] **Role Assignment**: Admin invitation system
- [ ] **Subscription Flow**: Stripe integration for trials/payments

#### Phase 2: MVP Features (Week 2-3)
- [ ] **Events Management**: Create, edit, RSVP system
- [ ] **Communication System**: Email/SMS sending
- [ ] **Budget Tracking**: Income/expense management
- [ ] **Teacher Requests**: Request submission and approval

#### Phase 3: Advanced Features (Week 4-5)
- [ ] **AI Integration**: Content generation and assistance
- [ ] **Fundraising**: Donation campaigns with Stripe
- [ ] **Document Management**: File uploads and sharing
- [ ] **Analytics Dashboard**: Usage and engagement metrics

### 6. Key Components Status

#### ✅ Completed Components:
- Database schema with multi-tenancy
- User authentication flow
- Protected routes with role checking
- API structure with centralized error handling
- Admin dashboard with real data integration

#### 🔄 In Progress:
- Onboarding flow (routes added, needs backend integration)
- Billing pages (components exist, need Stripe integration)
- Event management (frontend exists, needs backend connection)

#### ❌ Needs Implementation:
- User signup with organization creation
- Stripe subscription management
- Email/SMS sending functionality
- File upload system
- AI content generation

### 7. Database Schema Overview

**Key Tables:**
- `organizations` - PTO/school organizations
- `profiles` - User profiles with org_id and roles
- `events` - School events with RSVP tracking
- `transactions` - Budget income/expenses
- `fundraisers` - Donation campaigns
- `messages` - Communications (email/SMS)
- `teacher_requests` - Teacher resource requests
- `documents` - File storage references

**Security:**
- Row Level Security (RLS) on all tables
- Organization-based data isolation
- Role-based access control

### 8. API Endpoints Structure

```
/api/auth/* - Authentication
/api/profiles/* - User management
/api/event/* - Events management
/api/fundraiser/* - Fundraising
/api/budget/* - Budget tracking
/api/messages/* - Communications
/api/teacher-requests/* - Teacher requests
/api/documents/* - File management
/api/stripe/* - Payment processing
/api/ai/* - AI features
```

### 9. Frontend Architecture

**Routing:**
- Public routes: /, /login, /signup, /onboarding/*
- Protected routes: /dashboard/*, /events/*, /communications/*
- Role-based access control via ProtectedRoute component

**State Management:**
- React hooks for local state
- useUserProfile hook for user/org context
- Centralized API calls via utils/api.js

### 10. Development Workflow

1. **Start with database setup** (critical for any functionality)
2. **Test user authentication flow**
3. **Implement organization creation**
4. **Build core MVP features incrementally**
5. **Add AI and advanced features**

### 11. Production Deployment Checklist

- [ ] Rotate all API keys to production values
- [ ] Set up proper environment variables in hosting
- [ ] Configure Stripe webhooks
- [ ] Set up email/SMS service credentials
- [ ] Configure file storage (Supabase Storage)
- [ ] Set up monitoring and error tracking
- [ ] Test subscription billing flow
- [ ] Verify multi-tenant data isolation

---

**Ready to continue development!** 
Start with database setup, then test the basic application flow.
