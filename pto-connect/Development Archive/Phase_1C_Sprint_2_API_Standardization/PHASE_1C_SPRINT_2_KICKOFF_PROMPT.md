# 🚀 Phase 1C Sprint 2: Role-Based Access Control & API Enhancement - Kickoff Prompt

**Use this prompt to seamlessly begin Phase 1C Sprint 2 development in a new chat session**

---

## 📋 CONTEXT SUMMARY

I need you to act as a senior-level, forward-thinking web application engineer and designer to implement Phase 1C Sprint 2 of PTO Connect's multi-tenant authentication and user management system.

**IMPORTANT**: Please read and reference the attached PTO_CONNECT_SYSTEM_KNOWLEDGE_BASE.md file which contains comprehensive background information about the platform, technical architecture, business model, and development approach.

## 🎯 CURRENT PROJECT STATUS

### ✅ **PHASE 1A, 1B & 1C SPRINT 1 COMPLETED SUCCESSFULLY**

**Phase 1A: Database Migration (COMPLETE)**
- ✅ Migrated single PTO (Sunset Elementary PTO) to organizations table
- ✅ Linked all 8 user profiles to organization (f31c6ca8-c199-4fe5-a7bb-81840982d4d3)
- ✅ Synced all emails from auth.users to profiles table
- ✅ Updated foreign key constraints (profiles.org_id → organizations.id)
- ✅ Complete data integrity verification passed

**Phase 1B: RLS Policy Standardization (COMPLETE)**
- ✅ Removed 8 legacy/duplicate RLS policies across organizations and events tables
- ✅ Standardized all policies to use `get_user_org_id()` function
- ✅ Implemented role-based access control with `user_has_min_role()`
- ✅ Optimized performance (replaced complex subqueries with function calls)
- ✅ Final audit: Clean policy structure across all tables

**Phase 1C Sprint 1: Authentication System Enhancement (COMPLETE)**
- ✅ **Fixed Broken Authentication**: Updated frontend to use correct `profiles` table
- ✅ **Implemented Multi-Tenant Architecture**: Added organizational context to all authentication flows
- ✅ **Built Role-Based Access Control**: Created comprehensive permission system with hierarchical roles
- ✅ **Frontend Enhancements**: Fixed `useUserProfile` hook, created `useRoleAccess` hook, built `OrganizationInfo` component
- ✅ **Backend Enhancements**: Created organizational context middleware, role-based access middleware, enhanced authentication routes
- ✅ **Development Environment**: Implemented automated cleanup and archival system

### 📊 **CURRENT DATABASE STATE**
- **Organizations**: 1 (Sunset Elementary PTO with signup code SUNSET2024)
- **Profiles**: 8 users (all linked to organization with synced emails)
- **RLS Policies**: Clean, standardized, performance-optimized
- **Security**: Complete organizational data isolation implemented
- **Functions**: `get_user_org_id()` and `user_has_min_role()` properly defined and production-ready

---

## 🎯 IMMEDIATE TASK: Phase 1C Sprint 2 Implementation

### **PHASE 1C SPRINT 2 OBJECTIVES**
Enhance the API endpoints and build role-based management interfaces to complete the multi-tenant authentication system.

### **PHASE 1C SPRINT 2 DELIVERABLES**

#### **Week 1: API Endpoint Enhancement**
1. **Backend API Updates**
   - Update all existing API endpoints to use organizational context
   - Implement role-based API access controls using `user_has_min_role()`
   - Add organization validation middleware to all protected routes
   - Enhance error handling for organizational context violations

2. **API Security Hardening**
   - Ensure all endpoints respect organizational boundaries
   - Implement comprehensive role validation
   - Add audit logging for administrative actions
   - Test cross-organizational data access prevention

#### **Week 2: Role Management Dashboard**
1. **Admin Interface Development**
   - Create role management dashboard for organization administrators
   - Build user role assignment interface
   - Implement role hierarchy visualization
   - Add bulk user management capabilities

2. **Enhanced User Experience**
   - Develop organization switcher interface (foundation for future multi-org users)
   - Enhance user onboarding with organization-aware flows
   - Implement invitation system improvements
   - Create organization settings management interface

---

## 🔧 TECHNICAL REQUIREMENTS

### **Backend Updates Needed (pto-connect-backend)**
- **API Endpoints**: Update all endpoints to use `get_user_org_id()` and organizational context
- **Middleware Enhancement**: Expand organizational context validation across all routes
- **Role Validation**: Implement `user_has_min_role()` checks on administrative endpoints
- **Error Handling**: Enhanced error responses for organizational context violations
- **Audit Logging**: Comprehensive logging for role changes and administrative actions

### **Frontend Updates Needed (pto-connect)**
- **Admin Dashboard**: Role management interface for administrators
- **Organization Management**: Settings and configuration interface
- **User Management**: Enhanced user listing with role-based filtering
- **Organization Switcher**: Interface foundation for future multi-org support
- **Enhanced Onboarding**: Organization-aware signup and invitation flows

### **Database Functions to Leverage**
- **`get_user_org_id()`**: Returns user's organization ID (already implemented)
- **`user_has_min_role(role)`**: Validates user role permissions (already implemented)
- **RLS Policies**: Automatically enforce organizational data isolation (already implemented)

---

## 📁 CURRENT SYSTEM ARCHITECTURE

### **Repository Structure**
```
C:\Dev\
├── pto-connect/                 # Frontend (React 18, Vite 5, Tailwind CSS)
├── pto-connect-backend/         # Backend (Node.js 20, Express.js)
├── pto-connect-public/          # Public site
├── Development Archive/         # Archived legacy files and documentation
└── *.md files                   # Current phase documentation only
```

### **Deployment Status**
- **Frontend**: https://app.ptoconnect.com (Railway - Production Stable)
- **Backend**: https://api.ptoconnect.com (Railway - Production Stable)
- **Database**: Supabase PostgreSQL with clean RLS policies
- **Version**: v1.1.0 (Phase 1C Sprint 1 Complete, ready for Sprint 2)

---

## 🎯 IMMEDIATE NEXT STEPS

### **Step 1: Backend API Audit**
Analyze all existing API endpoints in the pto-connect-backend to identify which ones need organizational context validation and role-based access controls.

### **Step 2: Middleware Implementation**
Enhance the existing organizational context middleware to cover all API routes and implement comprehensive role validation.

### **Step 3: Admin Dashboard Development**
Create the role management dashboard interface for organization administrators to manage user roles and permissions.

### **Step 4: Enhanced User Experience**
Implement organization switcher interface and enhanced onboarding flows for better user experience.

---

## 🔒 CRITICAL SUCCESS FACTORS

- **Maintain Production Stability**: All changes must be backward compatible
- **Zero Data Loss**: Preserve all existing user data and functionality
- **Security First**: Ensure organizational data isolation in all new features
- **User Experience**: Seamless transition for existing users with enhanced capabilities
- **Performance**: Maintain fast loading times and responsive interface
- **Testing**: Comprehensive testing of all new API endpoints and interfaces

---

## 📋 DEVELOPMENT CONTEXT

**Working Directory:** C:\Dev
**My Experience Level:** Non-technical founder - provide step-by-step instructions
**Development Environment:** VS Code with Cline (Claude Sonnet 3.5)
**Current System Status:** Production stable, authentication system enhanced, ready for Sprint 2

---

## 🎯 SUCCESS METRICS FOR PHASE 1C SPRINT 2

By the end of Sprint 2, we should have:
- [ ] All API endpoints using organizational context and role validation
- [ ] Comprehensive role management dashboard for administrators
- [ ] Enhanced user management interface with role-based features
- [ ] Organization switcher interface (foundation for multi-org users)
- [ ] Improved user onboarding with organizational awareness
- [ ] Audit logging for all administrative actions
- [ ] Comprehensive testing of enhanced API security
- [ ] Zero production downtime during implementation

---

## 📝 COMMUNICATION GUIDELINES

- **Assume Zero Coding Experience**: Provide step-by-step instructions for all tasks
- **Explain Technical Decisions**: Justify architectural and implementation choices
- **Reference Knowledge Base**: Always consider the PTO_CONNECT_SYSTEM_KNOWLEDGE_BASE.md context
- **Maintain Security Focus**: Prioritize organizational data isolation in all implementations
- **Design for Scalability**: Consider growth from single PTO to enterprise district level
- **Document Everything**: Provide clear documentation for all changes
- **Cleanup Protocol**: After Sprint 2 completion, perform automated cleanup and archival

---

## 🚀 READY TO BEGIN

**Phase 1C Sprint 1 has created a solid authentication foundation with organizational context and role-based permissions. Sprint 2 will enhance the API layer and build the management interfaces that leverage this foundation.**

Please begin by analyzing the current backend API structure to create a detailed implementation plan for adding organizational context and role validation to all endpoints. Focus on maintaining production stability while enhancing security and user management capabilities.

**Let's build powerful role-based management features on our solid authentication foundation!**
