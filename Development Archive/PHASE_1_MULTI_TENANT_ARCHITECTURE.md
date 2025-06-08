# 🏗️ Phase 1: Multi-Tenant Authentication & Organizational Architecture (v1.1.0)

**Strategic Foundation with Organizational Hierarchy & Enterprise Features**

## 🎯 ORGANIZATIONAL HIERARCHY MODEL

### Core Structure
```
PTO Connect Platform
├── Districts (Enterprise Level - Optional)
│   ├── Schools
│   │   ├── PTOs (Primary Sandbox Level)
│   │   │   ├── Users (Parents, Teachers, Volunteers)
│   │   │   ├── Events, Budget, Documents (Sandboxed)
│   │   │   └── Templates (Local + Shared Access)
│   │   └── Multiple PTOs per School (if applicable)
│   └── District Office (Enterprise Management)
└── Standalone PTOs (Default Setup)
    ├── Direct PTO Registration
    └── Full Feature Access
```

### Sandboxing & Data Isolation
- **PTO Level**: Complete data isolation for events, budgets, communications, documents
- **School Level**: PTOs can share certain templates and coordinate if desired
- **District Level**: Enterprise oversight and standardized workflows (optional)
- **Platform Level**: Global template library and best practices sharing

## 📊 DATABASE SCHEMA DESIGN

### Core Organizational Tables
```sql
-- Districts (Enterprise Feature)
CREATE TABLE districts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL, -- e.g., "AUSTIN_ISD"
  address JSONB,
  contact_info JSONB,
  settings JSONB, -- District-wide policies and preferences
  subscription_tier VARCHAR(20) DEFAULT 'enterprise', -- enterprise, premium, basic
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Schools
CREATE TABLE schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  district_id UUID REFERENCES districts(id) ON DELETE SET NULL, -- NULL for standalone
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) NOT NULL, -- e.g., "LINCOLN_ELEM"
  address JSONB,
  contact_info JSONB,
  grade_levels TEXT[], -- ['K', '1', '2', '3', '4', '5']
  settings JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(district_id, code) -- Unique within district
);

-- PTOs (Primary Sandbox Level)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL, -- "Lincoln Elementary PTO"
  type VARCHAR(20) DEFAULT 'pto', -- pto, pta, parent_council
  subdomain VARCHAR(50) UNIQUE, -- lincoln-pto.ptoconnect.com
  settings JSONB,
  branding JSONB, -- Colors, logos, custom styling
  subscription_tier VARCHAR(20) DEFAULT 'basic', -- enterprise, premium, basic
  billing_info JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced User Profiles with Organizational Context
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  phone VARCHAR(20),
  address JSONB,
  emergency_contact JSONB,
  children JSONB[], -- Array of child information with grade levels
  volunteer_interests TEXT[],
  communication_preferences JSONB,
  privacy_settings JSONB,
  is_primary_contact BOOLEAN DEFAULT false, -- One per family
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, organization_id) -- User can belong to multiple PTOs
);

-- Enhanced Role System with Organizational Scope
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  district_id UUID REFERENCES districts(id) ON DELETE CASCADE, -- For district-level roles
  role_type VARCHAR(30) NOT NULL CHECK (role_type IN (
    'pto_admin', 'pto_board_member', 'pto_volunteer', 'parent', 'teacher',
    'school_admin', 'district_admin', 'platform_admin'
  )),
  permissions JSONB,
  scope VARCHAR(20) DEFAULT 'organization', -- organization, school, district, platform
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true
);

-- Template Sharing System
CREATE TABLE template_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by_user_id UUID REFERENCES auth.users(id),
  created_by_organization_id UUID REFERENCES organizations(id),
  template_type VARCHAR(50) NOT NULL, -- email, document, event, budget
  name VARCHAR(100) NOT NULL,
  description TEXT,
  content JSONB,
  tags TEXT[],
  sharing_level VARCHAR(20) DEFAULT 'organization', -- organization, school, district, platform
  usage_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0.0,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cross-Organization Relationships (for families with multiple schools)
CREATE TABLE family_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  primary_user_id UUID REFERENCES auth.users(id),
  related_user_id UUID REFERENCES auth.users(id),
  relationship_type VARCHAR(20), -- spouse, guardian, emergency_contact
  organization_id UUID REFERENCES organizations(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Row Level Security (RLS) Policies
```sql
-- Ensure users only see data from their organization(s)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access profiles in their organizations" ON user_profiles
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Organization-scoped data access
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their organizations" ON organizations
  FOR ALL USING (
    id IN (
      SELECT organization_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Template sharing with proper scope
ALTER TABLE template_library ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Template access based on sharing level" ON template_library
  FOR SELECT USING (
    CASE sharing_level
      WHEN 'organization' THEN created_by_organization_id IN (
        SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
      )
      WHEN 'school' THEN created_by_organization_id IN (
        SELECT o.id FROM organizations o
        JOIN user_profiles up ON up.organization_id = o.id
        WHERE up.user_id = auth.uid()
        AND o.school_id = (
          SELECT school_id FROM organizations 
          WHERE id = created_by_organization_id
        )
      )
      WHEN 'district' THEN created_by_organization_id IN (
        SELECT o.id FROM organizations o
        JOIN schools s ON s.id = o.school_id
        JOIN user_profiles up ON up.organization_id = o.id
        WHERE up.user_id = auth.uid()
        AND s.district_id = (
          SELECT s2.district_id FROM organizations o2
          JOIN schools s2 ON s2.id = o2.school_id
          WHERE o2.id = created_by_organization_id
        )
      )
      WHEN 'platform' THEN true
      ELSE false
    END
  );
```

## 🚀 API ARCHITECTURE

### Multi-Tenant API Design
```javascript
// Middleware for organization context
const organizationContext = async (req, res, next) => {
  const { user } = req;
  const orgId = req.headers['x-organization-id'] || req.query.orgId;
  
  if (!orgId) {
    return res.status(400).json({ error: 'Organization context required' });
  }
  
  // Verify user has access to this organization
  const userOrg = await getUserOrganization(user.id, orgId);
  if (!userOrg) {
    return res.status(403).json({ error: 'Access denied to organization' });
  }
  
  req.organization = userOrg;
  next();
};

// Organization-scoped routes
app.use('/api/org/:orgId', organizationContext);

// API Endpoints with organizational scope
const routes = {
  // Organization management
  'GET /api/organizations': 'List user\'s organizations',
  'POST /api/organizations': 'Create new organization (with school)',
  'GET /api/org/:orgId/profile': 'Get organization profile',
  'PUT /api/org/:orgId/profile': 'Update organization profile',
  
  // User management within organization
  'GET /api/org/:orgId/users': 'List organization users',
  'POST /api/org/:orgId/users/invite': 'Invite user to organization',
  'PUT /api/org/:orgId/users/:userId/role': 'Update user role in organization',
  
  // Template library with sharing
  'GET /api/org/:orgId/templates': 'Get available templates (org + shared)',
  'POST /api/org/:orgId/templates': 'Create new template',
  'PUT /api/org/:orgId/templates/:templateId/share': 'Update sharing level',
  'GET /api/templates/library': 'Browse public template library',
  
  // Enterprise district features
  'GET /api/district/:districtId/schools': 'List district schools',
  'GET /api/district/:districtId/analytics': 'District-wide analytics',
  'POST /api/district/:districtId/policies': 'Set district policies'
};
```

### Organization Registration Flow
```javascript
// Multi-step organization setup
const organizationSetup = {
  async step1_detectOrganization(req, res) {
    const { schoolName, district, zipCode } = req.body;
    
    // Check if school/district already exists
    const existingSchool = await findSchoolByName(schoolName, district);
    
    if (existingSchool) {
      // Check if PTO already exists for this school
      const existingPTO = await findPTOBySchool(existingSchool.id);
      
      if (existingPTO) {
        return res.json({
          step: 'join_existing',
          school: existingSchool,
          pto: existingPTO,
          message: 'A PTO already exists for this school. Would you like to join?'
        });
      } else {
        return res.json({
          step: 'create_pto',
          school: existingSchool,
          message: 'School found. Create PTO for this school?'
        });
      }
    } else {
      return res.json({
        step: 'create_school_and_pto',
        message: 'New school detected. Create school and PTO?'
      });
    }
  },
  
  async step2_createOrganization(req, res) {
    const { schoolData, ptoData, userRole } = req.body;
    const { user } = req;
    
    let school, pto;
    
    if (schoolData.isNew) {
      // Create new school (and district if needed)
      school = await createSchool(schoolData);
    } else {
      school = await getSchool(schoolData.id);
    }
    
    // Create PTO
    pto = await createPTO({
      ...ptoData,
      school_id: school.id,
      created_by: user.id
    });
    
    // Add user as admin
    await assignUserRole(user.id, pto.id, 'pto_admin');
    
    res.json({
      success: true,
      organization: pto,
      school: school,
      nextSteps: ['invite_board_members', 'customize_branding', 'import_data']
    });
  }
};
```

## 🎨 FRONTEND ARCHITECTURE

### Organization Context Provider
```jsx
// OrganizationContext.jsx
const OrganizationContext = createContext();

export const OrganizationProvider = ({ children }) => {
  const [currentOrg, setCurrentOrg] = useState(null);
  const [userOrganizations, setUserOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  useEffect(() => {
    if (user) {
      loadUserOrganizations();
    }
  }, [user]);
  
  const loadUserOrganizations = async () => {
    try {
      const orgs = await api.get('/api/organizations');
      setUserOrganizations(orgs.data);
      
      // Set current org from localStorage or first org
      const savedOrgId = localStorage.getItem('currentOrgId');
      const defaultOrg = orgs.data.find(o => o.id === savedOrgId) || orgs.data[0];
      setCurrentOrg(defaultOrg);
    } catch (error) {
      console.error('Failed to load organizations:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const switchOrganization = (orgId) => {
    const org = userOrganizations.find(o => o.id === orgId);
    setCurrentOrg(org);
    localStorage.setItem('currentOrgId', orgId);
    
    // Update API default headers
    api.defaults.headers['X-Organization-Id'] = orgId;
  };
  
  return (
    <OrganizationContext.Provider value={{
      currentOrg,
      userOrganizations,
      loading,
      switchOrganization,
      hasMultipleOrgs: userOrganizations.length > 1
    }}>
      {children}
    </OrganizationContext.Provider>
  );
};
```

### Organization Switcher Component
```jsx
// OrganizationSwitcher.jsx
const OrganizationSwitcher = () => {
  const { currentOrg, userOrganizations, switchOrganization, hasMultipleOrgs } = useOrganization();
  const [isOpen, setIsOpen] = useState(false);
  
  if (!hasMultipleOrgs) return null;
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-white border rounded-lg shadow-sm hover:bg-gray-50"
      >
        <div className="flex-1 text-left">
          <div className="text-sm font-medium text-gray-900">
            {currentOrg?.name}
          </div>
          <div className="text-xs text-gray-500">
            {currentOrg?.school?.name}
          </div>
        </div>
        <ChevronDownIcon className="w-4 h-4 text-gray-400" />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white border rounded-lg shadow-lg z-50">
          {userOrganizations.map((org) => (
            <button
              key={org.id}
              onClick={() => {
                switchOrganization(org.id);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-3 text-left hover:bg-gray-50 ${
                currentOrg?.id === org.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
              }`}
            >
              <div className="text-sm font-medium text-gray-900">{org.name}</div>
              <div className="text-xs text-gray-500">{org.school?.name}</div>
              {org.school?.district && (
                <div className="text-xs text-gray-400">{org.school.district.name}</div>
              )}
            </button>
          ))}
          
          <div className="border-t">
            <button
              onClick={() => {/* Navigate to create new org */}}
              className="w-full px-4 py-3 text-left text-sm text-blue-600 hover:bg-blue-50"
            >
              + Create New PTO
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
```

### Template Library with Sharing
```jsx
// TemplateLibrary.jsx
const TemplateLibrary = () => {
  const [templates, setTemplates] = useState([]);
  const [filter, setFilter] = useState('all'); // all, organization, shared, public
  const { currentOrg } = useOrganization();
  const { hasPermission } = usePermissions();
  
  const shareTemplate = async (templateId, sharingLevel) => {
    if (!hasPermission('templates:share')) {
      toast.error('You don\'t have permission to share templates');
      return;
    }
    
    try {
      await api.put(`/api/org/${currentOrg.id}/templates/${templateId}/share`, {
        sharing_level: sharingLevel
      });
      
      toast.success(`Template shared at ${sharingLevel} level`);
      loadTemplates();
    } catch (error) {
      toast.error('Failed to share template');
    }
  };
  
  return (
    <div className="template-library">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Template Library</h2>
        <div className="flex space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            <option value="all">All Templates</option>
            <option value="organization">My PTO</option>
            <option value="school">School Level</option>
            <option value="district">District Level</option>
            <option value="platform">Public Library</option>
          </select>
          {hasPermission('templates:create') && (
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
              Create Template
            </button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onShare={shareTemplate}
            canShare={hasPermission('templates:share')}
          />
        ))}
      </div>
    </div>
  );
};
```

## 🏢 ENTERPRISE FEATURES

### District-Level Administration
```jsx
// DistrictDashboard.jsx
const DistrictDashboard = () => {
  const [schools, setSchools] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const { hasPermission } = usePermissions();
  
  if (!hasPermission('district:admin')) {
    return <AccessDenied />;
  }
  
  return (
    <div className="district-dashboard">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Schools"
          value={analytics.totalSchools}
          icon={<SchoolIcon />}
        />
        <StatCard
          title="Active PTOs"
          value={analytics.activePTOs}
          icon={<GroupIcon />}
        />
        <StatCard
          title="Total Fundraising"
          value={`$${analytics.totalFundraising?.toLocaleString()}`}
          icon={<DollarIcon />}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SchoolPerformanceChart data={analytics.schoolPerformance} />
        <PTOEngagementMetrics data={analytics.engagement} />
      </div>
      
      <SchoolManagementTable
        schools={schools}
        onUpdateSchool={handleUpdateSchool}
        onCreatePTO={handleCreatePTO}
      />
    </div>
  );
};
```

### Revenue Opportunities
```javascript
// Subscription tiers and enterprise features
const SUBSCRIPTION_TIERS = {
  basic: {
    name: 'Basic',
    price: 0,
    features: [
      'Single PTO management',
      'Basic event planning',
      'Email communications',
      'Document storage (1GB)',
      'Community support'
    ]
  },
  premium: {
    name: 'Premium',
    price: 29.99, // per month
    features: [
      'All Basic features',
      'Advanced analytics',
      'Custom branding',
      'SMS notifications',
      'Document storage (10GB)',
      'Priority support',
      'Template sharing'
    ]
  },
  enterprise: {
    name: 'Enterprise',
    price: 'Custom', // District-wide pricing
    features: [
      'All Premium features',
      'District-wide management',
      'Multi-school coordination',
      'Advanced reporting',
      'Custom integrations',
      'Dedicated support',
      'Training and onboarding',
      'Unlimited storage'
    ]
  }
};
```

## 🔄 MIGRATION STRATEGY

### Existing Data Migration
```javascript
// Migration script for existing single-tenant data
const migrateToMultiTenant = async () => {
  console.log('Starting multi-tenant migration...');
  
  // 1. Create default organization for existing users
  const defaultOrg = await createOrganization({
    name: 'Default PTO',
    type: 'pto',
    subdomain: 'default',
    settings: { migrated: true }
  });
  
  // 2. Migrate existing users to default organization
  const existingUsers = await getAllUsers();
  for (const user of existingUsers) {
    await createUserProfile({
      user_id: user.id,
      organization_id: defaultOrg.id,
      first_name: user.first_name || 'User',
      last_name: user.last_name || 'Name',
      // ... other fields
    });
  }
  
  // 3. Migrate existing data to be organization-scoped
  await migrateEvents(defaultOrg.id);
  await migrateBudgets(defaultOrg.id);
  await migrateDocuments(defaultOrg.id);
  
  console.log('Migration completed successfully');
};
```

This comprehensive multi-tenant architecture provides the foundation for both individual PTO success and enterprise district opportunities while maintaining proper data isolation and sharing capabilities.
