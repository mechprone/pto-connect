# 📊 API Route Audit & Implementation Inventory

**Audit Date:** June 8, 2025  
**Sprint:** Phase 1C Sprint 2  
**Purpose:** Complete inventory of all API routes and their current middleware implementation status

---

## 🎯 AUDIT SUMMARY

### **Total Routes Audited:** 15 route files
### **Implementation Categories:**
- **✅ Category A (Properly Implemented):** 2 route files
- **🔄 Category B (Legacy Auth Pattern):** 9 route files  
- **⚠️ Category C (Critical Issues):** 4 route files

---

## 📋 DETAILED ROUTE INVENTORY

### **✅ CATEGORY A: PROPERLY IMPLEMENTED**
*Routes using standard middleware with organizational context and role-based access*

#### **1. `/api/profiles/*` (profile.js)**
- **Status:** ✅ COMPLETE
- **Middleware:** `getUserOrgContext`, `canManageUsers`, `requireAdmin`
- **Org Context:** ✅ Uses `req.orgId`
- **Role Control:** ✅ Admin-only access
- **Security:** ✅ Cross-org validation implemented
- **Actions:** GET, PATCH (approve), PATCH (role), DELETE

#### **2. `/api/auth/profile` (auth.js)**
- **Status:** ✅ COMPLETE  
- **Middleware:** `getUserOrgContext`
- **Org Context:** ✅ Uses `req.orgId`
- **Role Control:** ✅ Self-profile access only
- **Security:** ✅ Organizational context enforced
- **Actions:** GET, PATCH (self-update)

---

### **🔄 CATEGORY B: LEGACY AUTH PATTERN**
*Routes using legacy authentication patterns that need standardization*

#### **3. `/api/event/*` (event.js)**
- **Status:** 🔄 NEEDS UPDATE
- **Current Auth:** Custom `withAuth` middleware
- **Org Context:** ⚠️ Uses `user_metadata.org_id` (legacy)
- **Role Control:** ❌ No role-based access
- **Required Updates:**
  - Replace `withAuth` with `getUserOrgContext`
  - Add `canManageEvents` for POST/DELETE
  - Add `addUserOrgToBody` for POST operations
- **Actions:** GET, POST, DELETE

#### **4. `/api/budget/*` (budget.js)**
- **Status:** 🔄 NEEDS UPDATE
- **Current Auth:** Inline auth with token verification
- **Org Context:** ⚠️ Uses `user_metadata.org_id` (legacy)
- **Role Control:** ❌ No role-based access
- **Required Updates:**
  - Replace inline auth with `getUserOrgContext`
  - Add `canManageBudget` for modifications
  - Add proper role hierarchy (committee_lead+ for modifications)
- **Actions:** GET

#### **5. `/api/messages/*` (message.js)**
- **Status:** 🔄 NEEDS UPDATE
- **Current Auth:** Inline auth with token verification
- **Org Context:** ⚠️ Uses `user_metadata.org_id` (legacy)
- **Role Control:** ❌ No role-based access
- **Required Updates:**
  - Replace inline auth with `getUserOrgContext`
  - Add `canManageCommunications` for POST
  - Add `addUserOrgToBody` for POST operations
- **Actions:** GET, POST

#### **6. `/api/fundraiser/*` (fundraiser.js)**
- **Status:** 🔄 NEEDS UPDATE
- **Current Auth:** Inline auth with token verification
- **Org Context:** ⚠️ Uses `user_metadata.org_id` (legacy)
- **Role Control:** ❌ No role-based access
- **Required Updates:**
  - Replace inline auth with `getUserOrgContext`
  - Add `canManageEvents` for POST (fundraisers are event-like)
  - Add `addUserOrgToBody` for POST operations
- **Actions:** GET, POST

#### **7. `/api/communications/email-drafts/*` (emailDraft.js)**
- **Status:** 🔄 NEEDS UPDATE
- **Current Auth:** Inline auth with profile lookup
- **Org Context:** ⚠️ Manual profile lookup for `org_id`
- **Role Control:** ❌ No role-based access (ownership-based only)
- **Required Updates:**
  - Replace inline auth with `getUserOrgContext`
  - Add `canManageCommunications` for POST
  - Keep ownership validation for PUT/DELETE
  - Add `addUserOrgToBody` for POST operations
- **Actions:** GET, POST, PUT, DELETE

#### **8. `/api/teacher-requests/*` (teacherRequest.js)**
- **Status:** 🔄 NEEDS UPDATE
- **Current Auth:** Inline auth with token verification
- **Org Context:** ⚠️ Uses `user_metadata.org_id` (legacy)
- **Role Control:** ❌ No role-based access
- **Required Updates:**
  - Replace inline auth with `getUserOrgContext`
  - Add `requireVolunteer` for GET/POST (teachers and volunteers can access)
  - Add `addUserOrgToBody` for POST operations
- **Actions:** GET, POST

#### **9. `/api/documents/*` (document.js)**
- **Status:** 🔄 NEEDS UPDATE
- **Current Auth:** Inline auth with token verification
- **Org Context:** ⚠️ Uses `user_metadata.org_id` (legacy)
- **Role Control:** ❌ No role-based access
- **Required Updates:**
  - Replace inline auth with `getUserOrgContext`
  - Add `requireVolunteer` for GET/POST
  - Add `addUserOrgToBody` for POST operations
  - Implement file access controls
- **Actions:** GET, POST (file upload)

#### **10. `/api/shared-library/*` (template.js)**
- **Status:** 🔄 NEEDS UPDATE
- **Current Auth:** Basic token verification only
- **Org Context:** ❌ No organizational filtering (intentional for shared content)
- **Role Control:** ❌ No role-based access
- **Required Updates:**
  - Add `getUserOrgContext` for user validation
  - Add `requireVolunteer` for access
  - Keep cross-organizational access for shared templates
- **Actions:** GET

#### **11. `/api/notifications/*` (notification.js)**
- **Status:** 🔄 NEEDS UPDATE
- **Current Auth:** Custom `withAuth` middleware
- **Org Context:** ⚠️ Uses `user_metadata.org_id` (legacy)
- **Role Control:** ❌ No role-based access
- **Required Updates:**
  - Replace `withAuth` with `getUserOrgContext`
  - Add `requireVolunteer` for access
  - Fix organizational filtering logic
- **Actions:** GET, PATCH, DELETE

---

### **⚠️ CATEGORY C: CRITICAL ISSUES**
*Routes with significant problems requiring immediate attention*

#### **12. `/api/admin-users/*` (adminUser.js)**
- **Status:** ⚠️ CRITICAL ISSUE
- **Problem:** Uses legacy `pto_id` instead of `org_id`
- **Current Auth:** Inline auth with token verification
- **Org Context:** ❌ BROKEN - queries `pto_id` field
- **Role Control:** ❌ No role-based access (should be admin-only)
- **Required Updates:**
  - Fix database query to use `org_id` instead of `pto_id`
  - Replace inline auth with `getUserOrgContext`
  - Add `requireAdmin` for access
  - Update field selection (uses `full_name` instead of `first_name, last_name`)
- **Actions:** GET
- **Priority:** 🚨 HIGH - Route is broken

#### **13. `/api/ai/*` (ai.js)**
- **Status:** ⚠️ NEEDS SECURITY
- **Current Auth:** Inline auth with token verification
- **Org Context:** ❌ No organizational context (AI generation is org-agnostic)
- **Role Control:** ❌ No role-based access
- **Required Updates:**
  - Add `getUserOrgContext` for user validation
  - Add `requireVolunteer` for access (AI features should be restricted)
  - Consider rate limiting per organization
- **Actions:** POST (AI generation)

#### **14. `/api/stripe/*` (stripe.js)**
- **Status:** ⚠️ NEEDS STANDARDIZATION
- **Current Auth:** Inline auth with token verification
- **Org Context:** ⚠️ Uses `user_metadata.org_id` (legacy)
- **Role Control:** ❌ No role-based access
- **Required Updates:**
  - Replace inline auth with `getUserOrgContext`
  - Add `requireAdmin` for billing operations
  - Ensure subscription management is admin-only
- **Actions:** GET (test), POST (checkout)

#### **15. `/api/stripe/webhook` (webhook.js)**
- **Status:** ⚠️ SPECIAL CASE
- **Current Auth:** Stripe signature verification
- **Org Context:** N/A (webhook from Stripe)
- **Role Control:** N/A (system endpoint)
- **Required Updates:**
  - No middleware changes needed (external webhook)
  - Ensure proper Stripe signature validation
- **Actions:** POST (webhook handler)

---

## 🎯 IMPLEMENTATION PRIORITY MATRIX

### **🚨 CRITICAL PRIORITY (Week 1, Days 1-2)**
1. **`/api/admin-users/*`** - BROKEN: Fix `pto_id` → `org_id`
2. **`/api/stripe/*`** - SECURITY: Add admin-only access for billing

### **🔥 HIGH PRIORITY (Week 1, Days 3-4)**
3. **`/api/event/*`** - HIGH USAGE: Standardize event management
4. **`/api/budget/*`** - HIGH USAGE: Standardize budget access
5. **`/api/messages/*`** - HIGH USAGE: Standardize communications

### **⚡ MEDIUM PRIORITY (Week 1, Days 5-6)**
6. **`/api/fundraiser/*`** - Standardize fundraiser management
7. **`/api/communications/email-drafts/*`** - Standardize email drafts
8. **`/api/teacher-requests/*`** - Standardize teacher requests

### **📋 STANDARD PRIORITY (Week 1, Day 7)**
9. **`/api/documents/*`** - Standardize document management
10. **`/api/notifications/*`** - Standardize notifications
11. **`/api/shared-library/*`** - Standardize shared templates
12. **`/api/ai/*`** - Add security to AI features

---

## 🔧 STANDARD MIDDLEWARE IMPLEMENTATION PATTERN

### **For Most Routes:**
```javascript
import { getUserOrgContext, addUserOrgToBody } from '../middleware/organizationalContext.js';
import { requireMinRole, canManageEvents } from '../middleware/roleBasedAccess.js';

// GET endpoint (read operations)
router.get('/', getUserOrgContext, requireMinRole('volunteer'), async (req, res) => {
  const { data, error } = await supabase
    .from('table_name')
    .select('*')
    .eq('org_id', req.orgId);
});

// POST endpoint (create operations)
router.post('/', getUserOrgContext, addUserOrgToBody, canManageEvents, async (req, res) => {
  const { data, error } = await supabase
    .from('table_name')
    .insert([req.body]); // org_id automatically added by middleware
});
```

### **Role Requirements by Route Category:**
- **User Management:** `requireAdmin`
- **Events/Fundraisers:** `canManageEvents` (committee_lead+)
- **Budget:** `canManageBudget` (committee_lead+)
- **Communications:** `canManageCommunications` (committee_lead+)
- **Documents/General:** `requireVolunteer` (volunteer+)
- **Billing/Stripe:** `requireAdmin`
- **AI Features:** `requireVolunteer` (volunteer+)

---

## 📊 IMPLEMENTATION TRACKING

### **Week 1 Progress Checklist:**
- [ ] **Day 1:** Fix critical issues (admin-users, stripe security)
- [ ] **Day 2:** Update high-priority routes (events, budget, messages)
- [ ] **Day 3:** Update medium-priority routes (fundraiser, email-drafts, teacher-requests)
- [ ] **Day 4:** Update standard-priority routes (documents, notifications, shared-library, ai)
- [ ] **Day 5:** Comprehensive testing of all updated routes
- [ ] **Day 6:** Performance testing and optimization
- [ ] **Day 7:** Documentation updates and final validation

### **Success Metrics:**
- [ ] 100% of routes use standard middleware patterns
- [ ] All routes respect organizational boundaries
- [ ] Role-based access controls implemented across all routes
- [ ] Zero cross-organizational data leaks in testing
- [ ] All legacy `user_metadata.org_id` patterns replaced
- [ ] All broken `pto_id` references fixed

This inventory provides a complete roadmap for standardizing all API endpoints with proper organizational context and role-based access controls during Week 1 of Sprint 2.
