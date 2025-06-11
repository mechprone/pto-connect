# 🔐 PTO Connect Test Credentials

**For Development and Testing Purposes Only**

## Test User Accounts

All test accounts use the **Sunset Elementary PTO** organization (`@sunsetpto.com` domain).

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| **Admin** | admin@sunsetpto.com | TestPass123! | Full system access, all modules |
| **Teacher** | teacher@sunsetpto.com | TestPass123! | Teacher requests, events, communications |
| **Parent** | parent@sunsetpto.com | TestPass123! | Events, volunteer opportunities, basic access |
| **Volunteer** | volunteer@sunsetpto.com | TestPass123! | Volunteer coordination, events |
| **Committee Lead** | committee@sunsetpto.com | TestPass123! | Committee management, communications |
| **Board Member** | board@sunsetpto.com | TestPass123! | Board-level access, financial oversight |

## Organization Details

- **Organization Name**: Sunset Elementary PTO
- **Domain**: sunsetpto.com
- **School**: Sunset Elementary School
- **Test Environment**: Production database with test data

## Usage Guidelines

1. **Always use these credentials** for testing and debugging
2. **Never use fake credentials** like admin@ptoconnect.com
3. **Test different role permissions** using the appropriate accounts
4. **Reset test data** if needed after extensive testing

## Module Access by Role

### Admin (admin@sunsetpto.com)
- ✅ Dashboard
- ✅ Events Management
- ✅ Budget & Financial Management
- ✅ Communications
- ✅ Fundraising
- ✅ Teacher Requests
- ✅ User Management
- ✅ System Settings

### Teacher (teacher@sunsetpto.com)
- ✅ Events (view/RSVP)
- ✅ Teacher Requests (create/manage)
- ✅ Communications (receive)
- ❌ Budget Management
- ❌ User Management

### Parent (parent@sunsetpto.com)
- ✅ Events (view/RSVP)
- ✅ Volunteer Opportunities
- ✅ Communications (receive)
- ❌ Budget Management
- ❌ Administrative functions

### Committee Lead (committee@sunsetpto.com)
- ✅ Events Management
- ✅ Communications (send/receive)
- ✅ Volunteer Coordination
- ✅ Committee-specific budget view
- ❌ Full financial management

### Board Member (board@sunsetpto.com)
- ✅ Events Management
- ✅ Budget & Financial Management
- ✅ Communications
- ✅ Fundraising
- ✅ Board-level reporting
- ❌ User management (admin only)

## Testing Scenarios

### Communication Module Testing
- **Admin**: Test all communication features, template creation, campaign management
- **Committee**: Test sending communications to members
- **Parent/Teacher**: Test receiving and responding to communications

### Event Management Testing
- **Admin**: Create and manage events
- **Committee**: Coordinate volunteers for events
- **Parent**: RSVP and volunteer for events

### Budget Management Testing
- **Admin**: Full budget creation and management
- **Board**: Budget oversight and approval
- **Committee**: View committee-specific budgets

---

**Last Updated**: June 10, 2025  
**Version**: v1.7.0 (Phase 4 Communication Module)
