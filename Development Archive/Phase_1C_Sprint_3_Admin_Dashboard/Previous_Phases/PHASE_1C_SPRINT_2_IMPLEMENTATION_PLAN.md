# 🚀 Phase 1C Sprint 2: API Enhancement & Role Management Implementation Plan

**Sprint Duration:** 2 weeks  
**Sprint Goal:** Standardize all API endpoints with organizational context and role-based access controls, then build role management interfaces.

---

## 📊 CURRENT STATE ANALYSIS

### ✅ **ALREADY IMPLEMENTED (Sprint 1)**
- **Middleware Infrastructure**: Complete organizational context and role-based access middleware
- **Profile Routes**: Fully updated with proper middleware usage
- **Auth Routes**: Enhanced with organizational context
- **Database Functions**: `get_user_org_id()` and `user_has_min_role()` ready for use

### ⚠️ **INCONSISTENT IMPLEMENTATION PATTERNS**
Based on API audit, routes fall into three categories:

#### **Category A: Properly Implemented (✅)**
- `/api/profiles/*` - Uses `getUserOrgContext` + role-based middleware
- `/api/auth/profile` - Uses `getUserOrgContext`

#### **Category B: Legacy Auth Pattern (🔄 NEEDS UPDATE)**
- `/api/event/*` - Uses custom `withAuth` middleware (legacy pattern)
- `/api/budget/*` - Uses inline auth with `user_metadata.org_id` (legacy pattern)
- `/api/messages/*` - Uses inline auth with `user_metadata.org_id` (legacy pattern)

#### **Category C: Unknown Status (🔍 NEEDS AUDIT)**
- `/api/fundraiser/*`
- `/api/communications/email-drafts/*`
- `/api/teacher-requests/*`
- `/api/documents/*`
- `/api/shared-library/*`
- `/api/notifications/*`
- `/api/ai/*`
- `/api/admin-users/*`
- `/api/stripe/*` (may not need org context)

---

## 🎯 SPRINT 2 IMPLEMENTATION STRATEGY

### **WEEK 1: API Standardization**

#### **Day 1-2: Complete API Audit**
1. **Audit Remaining Routes**: Examine all Category C routes
2. **Document Current Patterns**: Create comprehensive route inventory
3. **Identify Role Requirements**: Define role permissions for each endpoint

#### **Day 3-5: Update Legacy Auth Patterns**
1. **Update Event Routes**: Replace custom `withAuth` with standard middleware
2. **Update Budget Routes**: Replace inline auth with standard middleware
3. **Update Communication Routes**: Replace inline auth with standard middleware
4. **Add Role-Based Access**: Implement appropriate role requirements

#### **Day 6-7: Update Remaining Routes**
1. **Standardize All Category C Routes**: Apply consistent middleware patterns
2. **Add Role Validation**: Implement role-based access controls
3. **Test API Consistency**: Verify all endpoints use standard patterns

### **WEEK 2: Role Management Dashboard**

#### **Day 8-10: Backend Admin Endpoints**
1. **Enhanced User Management**: Add bulk operations and advanced filtering
2. **Role Change Audit Logging**: Track all role modifications
3. **Organization Management**: Add organization settings endpoints

#### **Day 11-14: Frontend Role Management**
1. **Admin Dashboard**: Build comprehensive role management interface
2. **User Management Interface**: Enhanced user listing with role controls
3. **Organization Settings**: Build organization configuration interface
4. **Organization Switcher Foundation**: Prepare for future multi-org users

---

## 🔧 TECHNICAL IMPLEMENTATION DETAILS

### **Standard Middleware Pattern**
All protected routes should follow this pattern:
```javascript
import { getUserOrgContext, addUserOrgToBody } from '../middleware/organizationalContext.js';
import { requireMinRole, canManageEvents } from '../middleware/roleBasedAccess.js';

// GET endpoint (read operations)
router.get('/', getUserOrgContext, requireMinRole('volunteer'), async (req, res) => {
  // Use req.orgId for organizational filtering
  // Use req.userRole for additional logic if needed
});

// POST endpoint (create operations)
router.post('/', getUserOrgContext, addUserOrgToBody, canManageEvents, async (req, res) => {
  // req.body.org_id automatically added by middleware
  // Role validation ensures user can create events
});
```

### **Role Permission Matrix**
| Endpoint Category | Read Access | Create Access | Update Access | Delete Access |
|------------------|-------------|---------------|---------------|---------------|
| Events | volunteer+ | committee_lead+ | committee_lead+ | committee_lead+ |
| Budget | volunteer+ | committee_lead+ | board_member+ | board_member+ |
| Communications | volunteer+ | committee_lead+ | committee_lead+ | committee_lead+ |
| Documents | volunteer+ | volunteer+ | owner/committee_lead+ | owner/committee_lead+ |
| User Management | board_member+ | admin | admin | admin |
| Organization Settings | board_member+ | admin | admin | admin |

### **Database Query Patterns**
All database queries should use organizational filtering:
```javascript
// READ operations
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('org_id', req.orgId);

// CREATE operations (org_id added by middleware)
const { data, error } = await supabase
  .from('table_name')
  .insert([req.body]);

// UPDATE/DELETE operations
const { data, error } = await supabase
  .from('table_name')
  .update(updates)
  .eq('id', resourceId)
  .eq('org_id', req.orgId);
```

---

## 📋 DETAILED TASK BREAKDOWN

### **WEEK 1 TASKS**

#### **Task 1.1: Complete API Route Audit**
- [ ] Examine all remaining route files
- [ ] Document current authentication patterns
- [ ] Identify role requirements for each endpoint
- [ ] Create route inventory spreadsheet

#### **Task 1.2: Update Event Routes**
- [ ] Replace custom `withAuth` with `getUserOrgContext`
- [ ] Add appropriate role-based access controls
- [ ] Add `addUserOrgToBody` for POST operations
- [ ] Test all event endpoints

#### **Task 1.3: Update Budget Routes**
- [ ] Replace inline auth with standard middleware
- [ ] Add role-based access (committee_lead+ for modifications)
- [ ] Ensure organizational data isolation
- [ ] Test budget operations

#### **Task 1.4: Update Communication Routes**
- [ ] Replace inline auth with standard middleware
- [ ] Add role-based access (committee_lead+ for sending)
- [ ] Ensure organizational data isolation
- [ ] Test messaging functionality

#### **Task 1.5: Update Remaining Routes**
- [ ] Fundraiser routes standardization
- [ ] Document routes standardization
- [ ] Teacher request routes standardization
- [ ] Notification routes standardization
- [ ] AI routes standardization (if applicable)

#### **Task 1.6: API Testing & Validation**
- [ ] Test all endpoints with different user roles
- [ ] Verify organizational data isolation
- [ ] Test cross-organizational access prevention
- [ ] Performance testing with new middleware

### **WEEK 2 TASKS**

#### **Task 2.1: Enhanced Backend Admin Endpoints**
- [ ] Add bulk user operations (approve multiple, role changes)
- [ ] Add user filtering and search capabilities
- [ ] Add audit logging for administrative actions
- [ ] Add organization settings management endpoints

#### **Task 2.2: Role Management Dashboard (Frontend)**
- [ ] Create admin dashboard layout
- [ ] Build user management table with role controls
- [ ] Add role change confirmation dialogs
- [ ] Implement bulk operations interface

#### **Task 2.3: Organization Settings Interface**
- [ ] Build organization information display
- [ ] Add organization settings form
- [ ] Implement organization branding controls
- [ ] Add subscription status display

#### **Task 2.4: Enhanced User Experience**
- [ ] Create organization switcher component (foundation)
- [ ] Enhance user onboarding with org awareness
- [ ] Improve invitation system
- [ ] Add role-based navigation controls

#### **Task 2.5: Testing & Documentation**
- [ ] Comprehensive testing of all new features
- [ ] Update API documentation
- [ ] Create admin user guide
- [ ] Performance optimization

---

## 🔒 SECURITY CONSIDERATIONS

### **Organizational Data Isolation**
- All endpoints must filter by `req.orgId`
- No cross-organizational data access allowed
- Validate organization membership for all operations

### **Role-Based Access Control**
- Implement minimum role requirements for all operations
- Use hierarchical role checking (`requireMinRole`)
- Add ownership-based access where appropriate

### **Audit Logging**
- Log all administrative actions (role changes, user management)
- Track organization setting modifications
- Monitor cross-organizational access attempts

### **Input Validation**
- Validate all role assignments against valid role list
- Sanitize organization settings inputs
- Prevent privilege escalation attempts

---

## 📊 SUCCESS METRICS

### **Week 1 Success Criteria**
- [ ] 100% of API endpoints use standard middleware patterns
- [ ] All endpoints respect organizational boundaries
- [ ] Role-based access controls implemented across all routes
- [ ] Zero cross-organizational data leaks in testing

### **Week 2 Success Criteria**
- [ ] Functional admin dashboard for role management
- [ ] Organization settings interface operational
- [ ] Enhanced user onboarding experience
- [ ] Comprehensive audit logging implemented

### **Overall Sprint Success**
- [ ] All API endpoints standardized and secure
- [ ] Complete role management system operational
- [ ] Enhanced user experience with organizational awareness
- [ ] Foundation laid for future multi-organization support
- [ ] Zero production downtime during implementation

---

## 🚀 DEPLOYMENT STRATEGY

### **Incremental Deployment**
1. **Phase 1**: Deploy middleware updates (backward compatible)
2. **Phase 2**: Deploy route updates (one module at a time)
3. **Phase 3**: Deploy frontend enhancements
4. **Phase 4**: Enable new admin features

### **Rollback Plan**
- Git tags for each deployment phase
- Database migration rollback scripts if needed
- Feature flags for new admin functionality
- Monitoring for performance regressions

### **Testing Strategy**
- Unit tests for all new middleware
- Integration tests for updated routes
- End-to-end tests for admin dashboard
- Load testing for performance validation

---

## 📝 NEXT STEPS

1. **Begin Week 1 Implementation**: Start with complete API audit
2. **Daily Progress Reviews**: Track implementation against timeline
3. **Continuous Testing**: Test each route update immediately
4. **Documentation Updates**: Keep API docs current with changes
5. **Stakeholder Communication**: Regular updates on progress

This implementation plan ensures a systematic approach to enhancing the API layer while building powerful role management capabilities on the solid authentication foundation established in Sprint 1.
