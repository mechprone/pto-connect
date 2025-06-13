# 🚀 Phase 1 Implementation Plan: Authentication & User Management (v1.1.0)

**Strategic Foundation Development - 6 Week Implementation**

## 📋 SPRINT BREAKDOWN

### Sprint 1 (Weeks 1-2): Core Authentication Infrastructure

#### Backend Development
**Database Schema Extensions:**
```sql
-- Extended user profiles table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  phone VARCHAR(20),
  address JSONB,
  emergency_contact JSONB,
  children JSONB[], -- Array of child information
  volunteer_interests TEXT[],
  communication_preferences JSONB,
  privacy_settings JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User roles and permissions
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role_type VARCHAR(20) NOT NULL CHECK (role_type IN ('admin', 'parent', 'teacher', 'volunteer', 'board_member')),
  organization_id UUID, -- For multi-PTO support
  permissions JSONB,
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true
);

-- Audit trail for security
CREATE TABLE user_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action VARCHAR(50) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**API Endpoints to Implement:**
```javascript
// Authentication routes
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
POST /api/auth/forgot-password
POST /api/auth/reset-password
POST /api/auth/verify-email

// Profile management routes
GET /api/users/profile
PUT /api/users/profile
GET /api/users/profile/:userId (admin only)
PUT /api/users/roles/:userId (admin only)
GET /api/users/activity-log (admin only)
```

#### Frontend Development
**Components to Create:**
1. **AuthProvider Context**
   - Global authentication state management
   - User session persistence
   - Role-based access control hooks

2. **Authentication Forms**
   - Login form with validation
   - Registration form with PTO-specific fields
   - Password reset flow
   - Email verification handling

3. **Profile Management**
   - User profile editing interface
   - Family/children management
   - Communication preferences
   - Privacy settings dashboard

**File Structure:**
```
src/
├── contexts/
│   ├── AuthContext.jsx
│   └── UserContext.jsx
├── components/
│   ├── auth/
│   │   ├── LoginForm.jsx
│   │   ├── RegisterForm.jsx
│   │   ├── ForgotPasswordForm.jsx
│   │   └── ProtectedRoute.jsx
│   ├── profile/
│   │   ├── ProfileEditor.jsx
│   │   ├── FamilyManager.jsx
│   │   └── PreferencesPanel.jsx
├── hooks/
│   ├── useAuth.js
│   ├── useProfile.js
│   └── usePermissions.js
└── utils/
    ├── auth.js
    └── validation.js
```

#### Sprint 1 Deliverables:
- [ ] Supabase Auth integration complete
- [ ] User registration and login functional
- [ ] Basic profile management working
- [ ] Password reset flow implemented
- [ ] Email verification system active

### Sprint 2 (Weeks 3-4): Role-Based Access Control & Permissions

#### Backend Development
**Permission System Implementation:**
```javascript
// Permission middleware
const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    const { user } = req;
    const userRoles = await getUserRoles(user.id);
    
    const hasPermission = userRoles.some(role => 
      role.permissions.includes(requiredPermission) || 
      role.permissions.includes('admin:all')
    );
    
    if (!hasPermission) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
};

// Role management API
const roleController = {
  async assignRole(req, res) {
    const { userId, roleType, permissions } = req.body;
    // Implementation for role assignment
  },
  
  async revokeRole(req, res) {
    const { userId, roleId } = req.params;
    // Implementation for role revocation
  },
  
  async getUserPermissions(req, res) {
    const { userId } = req.params;
    // Return aggregated permissions for user
  }
};
```

**Permission Definitions:**
```javascript
const PERMISSIONS = {
  // User management
  'users:read': 'View user profiles',
  'users:write': 'Edit user profiles',
  'users:delete': 'Delete users',
  
  // Event management
  'events:create': 'Create events',
  'events:edit': 'Edit events',
  'events:delete': 'Delete events',
  'events:manage': 'Full event management',
  
  // Financial management
  'budget:read': 'View budget information',
  'budget:write': 'Edit budget',
  'budget:approve': 'Approve expenses',
  
  // Communication
  'communication:send': 'Send messages',
  'communication:broadcast': 'Send broadcast messages',
  
  // Administration
  'admin:all': 'Full administrative access'
};
```

#### Frontend Development
**Role Management Interface:**
```jsx
// RoleManager.jsx
const RoleManager = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const { hasPermission } = usePermissions();
  
  if (!hasPermission('users:write')) {
    return <AccessDenied />;
  }
  
  return (
    <div className="role-manager">
      <UserList users={users} onSelectUser={setSelectedUser} />
      {selectedUser && (
        <RoleEditor 
          user={selectedUser} 
          onRoleUpdate={handleRoleUpdate}
        />
      )}
    </div>
  );
};
```

**Protected Route System:**
```jsx
// ProtectedRoute.jsx
const ProtectedRoute = ({ children, requiredPermission, fallback }) => {
  const { user, loading } = useAuth();
  const { hasPermission } = usePermissions();
  
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" />;
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return fallback || <AccessDenied />;
  }
  
  return children;
};
```

#### Sprint 2 Deliverables:
- [ ] Role-based access control system functional
- [ ] Permission middleware protecting all API endpoints
- [ ] Admin interface for role management
- [ ] Protected routes working throughout application
- [ ] Audit logging for all permission changes

### Sprint 3 (Weeks 5-6): Advanced Features & Integration

#### Backend Development
**Advanced Authentication Features:**
```javascript
// Multi-factor authentication setup
const mfaController = {
  async setupMFA(req, res) {
    const { user } = req;
    const secret = speakeasy.generateSecret({
      name: `PTO Connect (${user.email})`,
      issuer: 'PTO Connect'
    });
    
    // Store secret securely
    await updateUserMFA(user.id, secret.base32);
    
    res.json({
      qrCode: qrcode.toDataURL(secret.otpauth_url),
      backupCodes: generateBackupCodes()
    });
  },
  
  async verifyMFA(req, res) {
    const { token } = req.body;
    const { user } = req;
    
    const verified = speakeasy.totp.verify({
      secret: user.mfa_secret,
      encoding: 'base32',
      token,
      window: 2
    });
    
    if (verified) {
      req.session.mfaVerified = true;
      res.json({ success: true });
    } else {
      res.status(400).json({ error: 'Invalid token' });
    }
  }
};
```

**Session Management:**
```javascript
// Advanced session handling
const sessionManager = {
  async createSession(userId, deviceInfo) {
    const session = {
      id: generateSessionId(),
      userId,
      deviceInfo,
      ipAddress: req.ip,
      createdAt: new Date(),
      lastActivity: new Date(),
      isActive: true
    };
    
    await storeSession(session);
    return session;
  },
  
  async validateSession(sessionId) {
    const session = await getSession(sessionId);
    
    if (!session || !session.isActive) {
      throw new Error('Invalid session');
    }
    
    // Update last activity
    await updateSessionActivity(sessionId);
    return session;
  },
  
  async revokeSession(sessionId) {
    await updateSession(sessionId, { isActive: false });
  }
};
```

#### Frontend Development
**Advanced Profile Features:**
```jsx
// FamilyManager.jsx
const FamilyManager = () => {
  const [children, setChildren] = useState([]);
  const [households, setHouseholds] = useState([]);
  
  const addChild = async (childData) => {
    const response = await api.post('/api/users/children', childData);
    setChildren([...children, response.data]);
  };
  
  const linkHousehold = async (householdId) => {
    await api.post('/api/users/households/link', { householdId });
    // Refresh household data
  };
  
  return (
    <div className="family-manager">
      <ChildrenList children={children} onAddChild={addChild} />
      <HouseholdLinks households={households} onLink={linkHousehold} />
    </div>
  );
};
```

**Security Dashboard:**
```jsx
// SecurityDashboard.jsx
const SecurityDashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  
  const revokeSession = async (sessionId) => {
    await api.delete(`/api/auth/sessions/${sessionId}`);
    setSessions(sessions.filter(s => s.id !== sessionId));
  };
  
  return (
    <div className="security-dashboard">
      <MFASetup enabled={mfaEnabled} onToggle={setMfaEnabled} />
      <ActiveSessions sessions={sessions} onRevoke={revokeSession} />
      <ActivityLog activities={activityLog} />
    </div>
  );
};
```

#### Sprint 3 Deliverables:
- [ ] Multi-factor authentication optional setup
- [ ] Advanced session management with device tracking
- [ ] Family/household linking system
- [ ] Security dashboard for users
- [ ] Comprehensive audit logging
- [ ] Performance optimization and caching

## 🔧 TECHNICAL IMPLEMENTATION DETAILS

### Database Optimization
```sql
-- Indexes for performance
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_active ON user_roles(user_id, is_active) WHERE is_active = true;
CREATE INDEX idx_activity_log_user_id ON user_activity_log(user_id);
CREATE INDEX idx_activity_log_created_at ON user_activity_log(created_at);

-- Row Level Security policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);
```

### API Security Middleware
```javascript
// Rate limiting
const rateLimit = require('express-rate-limit');
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts'
});

// Input validation
const { body, validationResult } = require('express-validator');
const validateRegistration = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  body('firstName').trim().isLength({ min: 1, max: 50 }),
  body('lastName').trim().isLength({ min: 1, max: 50 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];
```

### Frontend State Management
```javascript
// AuthContext.jsx
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState([]);
  
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const session = await supabase.auth.getSession();
        if (session?.data?.session) {
          const userData = await fetchUserProfile(session.data.session.user.id);
          setUser(userData);
          setPermissions(userData.permissions);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    initializeAuth();
  }, []);
  
  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    const userData = await fetchUserProfile(data.user.id);
    setUser(userData);
    setPermissions(userData.permissions);
    
    return userData;
  };
  
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setPermissions([]);
  };
  
  return (
    <AuthContext.Provider value={{
      user,
      loading,
      permissions,
      login,
      logout,
      hasPermission: (permission) => permissions.includes(permission)
    }}>
      {children}
    </AuthContext.Provider>
  );
};
```

## 🧪 TESTING STRATEGY

### Unit Tests
```javascript
// auth.test.js
describe('Authentication System', () => {
  test('should register new user with valid data', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'SecurePass123',
      firstName: 'John',
      lastName: 'Doe'
    };
    
    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(201);
    
    expect(response.body.user.email).toBe(userData.email);
    expect(response.body.user.password).toBeUndefined();
  });
  
  test('should reject weak passwords', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'weak',
      firstName: 'John',
      lastName: 'Doe'
    };
    
    await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(400);
  });
});
```

### Integration Tests
```javascript
// permissions.test.js
describe('Permission System', () => {
  test('should allow admin to access user management', async () => {
    const adminToken = await getAdminToken();
    
    const response = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    
    expect(Array.isArray(response.body.users)).toBe(true);
  });
  
  test('should deny regular user access to admin endpoints', async () => {
    const userToken = await getUserToken();
    
    await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);
  });
});
```

## 📊 SUCCESS METRICS & MONITORING

### Key Performance Indicators
- **Authentication Success Rate**: >99%
- **Login Response Time**: <500ms
- **Profile Update Success Rate**: >99%
- **Permission Check Performance**: <50ms
- **Security Audit Compliance**: 100%

### Monitoring Setup
```javascript
// metrics.js
const prometheus = require('prom-client');

const authMetrics = {
  loginAttempts: new prometheus.Counter({
    name: 'auth_login_attempts_total',
    help: 'Total number of login attempts',
    labelNames: ['status']
  }),
  
  permissionChecks: new prometheus.Histogram({
    name: 'auth_permission_check_duration_seconds',
    help: 'Duration of permission checks',
    buckets: [0.001, 0.005, 0.01, 0.05, 0.1]
  })
};

module.exports = authMetrics;
```

## 🚀 DEPLOYMENT CHECKLIST

### Pre-Deployment
- [ ] All unit tests passing
- [ ] Integration tests passing
- [ ] Security audit completed
- [ ] Performance benchmarks met
- [ ] Database migrations tested
- [ ] Environment variables configured

### Deployment Steps
1. **Database Migration**
   ```bash
   npm run db:migrate
   npm run db:seed:permissions
   ```

2. **Backend Deployment**
   ```bash
   git tag v1.1.0-backend
   git push origin v1.1.0-backend
   # Railway auto-deploys from tag
   ```

3. **Frontend Deployment**
   ```bash
   npm run build
   git tag v1.1.0-frontend
   git push origin v1.1.0-frontend
   ```

4. **Post-Deployment Verification**
   ```bash
   npm run test:e2e:production
   npm run test:security:production
   ```

### Rollback Plan
- Database rollback scripts prepared
- Previous deployment tags available for quick revert
- Feature flags to disable new functionality if needed

This comprehensive implementation plan provides the foundation for all future PTO Connect modules while ensuring security, scalability, and maintainability.
