# 🚀 Phase 1 Sprint Kickoff Prompt

**Use this prompt to start Phase 1 implementation in a new AI chat session**

---

## INITIAL PROMPT FOR NEW CHAT SESSION

```
I need you to act as a senior-level, forward-thinking web application engineer and designer to help implement Phase 1 of PTO Connect's multi-tenant authentication and user management system. 

**IMPORTANT**: Please read and reference the attached PTO_CONNECT_SYSTEM_KNOWLEDGE_BASE.md file which contains comprehensive background information about the platform, technical architecture, business model, and development approach. This knowledge base should inform all your responses and recommendations.

## IMMEDIATE TASK: Phase 1 Pre-Implementation Analysis & Sprint Planning

Before beginning Phase 1 implementation (Authentication & User Management Core v1.1.0), I need you to:

### 1. SYSTEM AUDIT & CLEANUP
Perform a comprehensive analysis of our current system to ensure it's clean and ready for Phase 1:

**Database Schema Analysis:**
- Examine all existing database tables, columns, and relationships
- Identify any legacy `pto_id` references that should be `org_id` (we standardized on org_id)
- Check for migration artifacts from our recent Vercel/Render → Railway migration
- Validate Row Level Security (RLS) policies are properly implemented
- Assess current schema against the planned multi-tenant architecture

**Codebase Consistency Review:**
- Scan frontend (pto-connect) for inconsistent references
- Scan backend (pto-connect-backend) for inconsistent references  
- Scan public site (pto-connect-public) for any relevant references
- Identify any hardcoded values that need to be configurable
- Check for proper error handling and validation patterns

**API Endpoint Audit:**
- Review existing API endpoints for consistency
- Identify endpoints that need organizational context
- Check authentication and authorization implementations
- Validate request/response patterns

### 2. PHASE 1 SPRINT PLANNING
Based on the system audit, create a detailed implementation plan for Phase 1:

**Sprint 1-2: Core Multi-Tenant Foundation (Weeks 1-4)**
- Database schema implementation for multi-tenant architecture
- Authentication system with organizational context
- Basic user profile management with organizational scope
- Row Level Security policy implementation

**Sprint 3-4: Role-Based Access Control (Weeks 5-8)**  
- Granular permission system across organizational boundaries
- Role management interface for administrators
- Protected routes and API middleware
- Cross-organization family relationship handling

**Sprint 5-6: Advanced Features & Polish (Weeks 9-12)**
- Template sharing system with organizational scope
- Organization switcher for multi-PTO users
- Advanced user management features
- Testing, optimization, and deployment

### 3. TECHNICAL SPECIFICATIONS
For each sprint, provide:
- Detailed database schema changes (SQL)
- API endpoint specifications
- Frontend component architecture
- Security implementation details
- Testing strategy
- Step-by-step implementation instructions

### 4. MIGRATION STRATEGY
Create a plan for:
- Migrating existing single-tenant data to multi-tenant structure
- Handling existing users and their data
- Ensuring zero downtime during migration
- Rollback procedures if needed

## DEVELOPMENT CONTEXT

**Working Directory:** C:\Dev
**Current System Status:** Production stable on Railway, recently migrated from Vercel/Render
**Development Environment:** VS Code with Cline (Claude Sonnet 3.5)
**My Experience Level:** Non-technical founder - provide step-by-step instructions for all tasks

**Key Requirements:**
- Maintain production stability throughout implementation
- Ensure complete data isolation between organizations (PTOs)
- Design for scalability from single PTO to enterprise district level
- Follow industry best practices for security and performance
- Create user-friendly interfaces for varying technical comfort levels

**Critical Success Factors:**
- Clean, consistent codebase before starting new development
- Comprehensive testing at each step
- Proper documentation for all changes
- Seamless user experience during transition
- Enterprise-ready architecture for future district sales

Please begin with the system audit and provide a comprehensive analysis of our current state, followed by detailed Phase 1 implementation planning.
```

---

## FOLLOW-UP PROMPTS (Use as needed during Phase 1)

### For Database Work:
```
Based on your analysis, please provide the exact SQL commands I need to run in Supabase to implement [specific database changes]. Include:
1. Step-by-step instructions for accessing Supabase SQL editor
2. The complete SQL commands with explanations
3. Verification queries to confirm changes worked
4. Rollback commands in case something goes wrong
```

### For Frontend Development:
```
Please implement [specific frontend feature] with:
1. Complete React component code with TypeScript if applicable
2. Tailwind CSS styling that matches our design system
3. Proper error handling and loading states
4. Integration with our authentication context
5. Step-by-step instructions for where to place files in the pto-connect directory
```

### For Backend Development:
```
Please implement [specific backend feature] with:
1. Complete Express.js route handlers
2. Proper authentication and authorization middleware
3. Input validation and error handling
4. Database integration with proper RLS policies
5. Step-by-step instructions for where to place files in the pto-connect-backend directory
```

### For Testing:
```
Please create comprehensive tests for [specific feature] including:
1. Unit tests for individual functions
2. Integration tests for API endpoints
3. Frontend component tests
4. End-to-end user flow tests
5. Instructions for running tests and interpreting results
```

### For Deployment:
```
Please provide step-by-step deployment instructions for [specific changes] including:
1. Pre-deployment checklist
2. Database migration steps
3. Environment variable updates needed
4. Railway deployment process
5. Post-deployment verification steps
6. Rollback procedures if needed
```

---

## IMPORTANT REMINDERS FOR AI ASSISTANT

- **Always reference the PTO_CONNECT_SYSTEM_KNOWLEDGE_BASE.md** for context and background
- **Provide step-by-step instructions** - assume zero coding experience
- **Explain technical decisions** and why specific approaches are recommended
- **Consider scalability** from single PTO to enterprise district level
- **Prioritize security** and data isolation in all implementations
- **Design for accessibility** and varying technical comfort levels
- **Include comprehensive testing** for all new features
- **Document everything** clearly for future reference

---

## SUCCESS METRICS FOR PHASE 1

By the end of Phase 1, we should have:
- [ ] Clean, consistent multi-tenant database schema
- [ ] Secure authentication system with organizational context
- [ ] Role-based access control across organizational boundaries
- [ ] Template sharing system with proper scope controls
- [ ] Organization switcher for multi-PTO users
- [ ] Comprehensive testing coverage
- [ ] Complete documentation for all new systems
- [ ] Zero production downtime during implementation
- [ ] Foundation ready for Phase 2 (Data Architecture & API Foundation)

Use this prompt to ensure consistent, high-quality development assistance across different AI chat sessions.
