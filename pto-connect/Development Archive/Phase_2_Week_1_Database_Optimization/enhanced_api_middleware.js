// 🚀 Phase 2: Enhanced API Middleware & Standardization Framework
// Week 2, Sprint 2.2A: REST API Standardization with Permission Context

import { supabase } from '../routes/util/verifySupabaseToken.js';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';

// Initialize Redis connection for caching
const redis = process.env.REDIS_URL ? new Redis(process.env.REDIS_URL) : null;

// ============================================================================
// STANDARDIZED API RESPONSE FORMATTER
// ============================================================================

/**
 * Standardized API Response Format
 * Ensures consistent response structure across all endpoints
 */
export const formatApiResponse = (data, options = {}) => {
  const {
    success = true,
    error = null,
    meta = {},
    statusCode = 200
  } = options;

  const response = {
    success,
    data: success ? data : null,
    timestamp: new Date().toISOString(),
    requestId: meta.requestId || null
  };

  // Add error information if present
  if (error) {
    response.error = {
      code: error.code || 'UNKNOWN_ERROR',
      message: error.message || 'An unknown error occurred',
      details: error.details || null
    };
  }

  // Add metadata if present
  if (Object.keys(meta).length > 0) {
    response.meta = {
      ...meta,
      timestamp: response.timestamp
    };
  }

  return response;
};

/**
 * Response formatting middleware
 * Automatically formats all API responses
 */
export const responseFormatter = (req, res, next) => {
  // Store original json method
  const originalJson = res.json;
  
  // Override json method to format responses
  res.json = function(data) {
    // If data is already formatted (has success property), send as-is
    if (data && typeof data === 'object' && 'success' in data) {
      return originalJson.call(this, data);
    }
    
    // Format the response
    const formattedResponse = formatApiResponse(data, {
      meta: {
        requestId: req.requestId,
        responseTime: req.responseTime,
        permissions: req.userPermissions ? Object.keys(req.userPermissions).length : 0
      }
    });
    
    return originalJson.call(this, formattedResponse);
  };
  
  // Store original status method
  const originalStatus = res.status;
  
  // Override status method to capture status code
  res.status = function(code) {
    res.statusCode = code;
    return originalStatus.call(this, code);
  };
  
  next();
};

// ============================================================================
// ENHANCED ORGANIZATIONAL CONTEXT MIDDLEWARE
// ============================================================================

/**
 * Enhanced organizational context middleware with permission caching
 * Provides comprehensive user, organization, and permission context
 */
export const getEnhancedOrgContext = async (req, res, next) => {
  try {
    const startTime = Date.now();
    
    // Generate unique request ID
    req.requestId = uuidv4();
    req.startTime = startTime;
    
    // Extract authorization token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json(formatApiResponse(null, {
        success: false,
        error: {
          code: 'MISSING_AUTH_TOKEN',
          message: 'Missing or malformed auth token'
        }
      }));
    }
    
    const token = authHeader.substring(7);
    
    // Verify token with Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json(formatApiResponse(null, {
        success: false,
        error: {
          code: 'INVALID_AUTH_TOKEN',
          message: 'Invalid or expired auth token'
        }
      }));
    }
    
    // Get user profile with organization information
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        id,
        user_id,
        org_id,
        role,
        first_name,
        last_name,
        email,
        organizations!inner (
          id,
          name,
          type,
          subdomain,
          district_id,
          school_id,
          districts (
            id,
            name,
            subscription_tier,
            settings
          ),
          schools (
            id,
            name,
            district_id
          )
        )
      `)
      .eq('user_id', user.id)
      .single();
    
    if (profileError || !profile) {
      return res.status(404).json(formatApiResponse(null, {
        success: false,
        error: {
          code: 'USER_PROFILE_NOT_FOUND',
          message: 'User profile not found'
        }
      }));
    }
    
    // Cache user permissions for request duration
    const userPermissions = await getUserPermissionsCache(user.id, profile.org_id);
    
    // Set request context
    req.user = user;
    req.profile = profile;
    req.orgId = profile.org_id;
    req.userRole = profile.role;
    req.userPermissions = userPermissions;
    req.organization = profile.organizations;
    
    // Add district context for enterprise customers
    if (profile.organizations.district_id) {
      req.district = profile.organizations.districts;
      req.school = profile.organizations.schools;
    }
    
    // Set session variables for database triggers
    await supabase.rpc('set_session_variables', {
      user_id: user.id,
      profile_id: profile.id,
      org_id: profile.org_id,
      request_id: req.requestId,
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    });
    
    next();
  } catch (error) {
    console.error('Enhanced org context error:', error);
    res.status(500).json(formatApiResponse(null, {
      success: false,
      error: {
        code: 'CONTEXT_ERROR',
        message: 'Failed to establish organizational context',
        details: process.env.NODE_ENV === 'development' ? error.message : null
      }
    }));
  }
};

// ============================================================================
// PERMISSION CACHING SYSTEM
// ============================================================================

/**
 * Permission caching utility class
 * Provides high-performance permission checking with Redis caching
 */
export class PermissionCache {
  static async getUserPermissions(userId, orgId) {
    const cacheKey = `permissions:${orgId}:${userId}`;
    
    try {
      // Try to get from cache first
      if (redis) {
        const cached = await redis.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      }
      
      // Fetch from database using materialized view
      const { data: permissions, error } = await supabase
        .from('user_permission_matrix')
        .select('permission_key, module_name, user_has_permission')
        .eq('user_id', userId)
        .eq('org_id', orgId)
        .eq('is_enabled', true);
      
      if (error) {
        console.error('Permission fetch error:', error);
        return {};
      }
      
      // Convert to object for fast lookup
      const permissionMap = {};
      permissions.forEach(perm => {
        if (perm.user_has_permission) {
          permissionMap[perm.permission_key] = {
            module: perm.module_name,
            granted: true
          };
        }
      });
      
      // Cache for 5 minutes
      if (redis) {
        await redis.setex(cacheKey, 300, JSON.stringify(permissionMap));
      }
      
      return permissionMap;
    } catch (error) {
      console.error('Permission cache error:', error);
      // Fallback to basic role-based permissions
      return await this.getFallbackPermissions(userId, orgId);
    }
  }
  
  static async getFallbackPermissions(userId, orgId) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', userId)
        .eq('org_id', orgId)
        .single();
      
      // Basic role-based fallback permissions
      const rolePermissions = {
        admin: ['*'], // Admin has all permissions
        board_member: ['can_view_users', 'can_create_events', 'can_manage_budget'],
        committee_lead: ['can_create_events', 'can_view_budget'],
        volunteer: ['can_view_events']
      };
      
      const permissions = rolePermissions[profile?.role] || [];
      const permissionMap = {};
      
      permissions.forEach(perm => {
        permissionMap[perm] = { module: 'fallback', granted: true };
      });
      
      return permissionMap;
    } catch (error) {
      console.error('Fallback permission error:', error);
      return {};
    }
  }
  
  static async invalidateUserPermissions(userId, orgId) {
    if (!redis) return;
    
    const cacheKey = `permissions:${orgId}:${userId}`;
    await redis.del(cacheKey);
  }
  
  static async invalidateOrgPermissions(orgId) {
    if (!redis) return;
    
    const pattern = `permissions:${orgId}:*`;
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
}

// Helper function for middleware
const getUserPermissionsCache = PermissionCache.getUserPermissions.bind(PermissionCache);

// ============================================================================
// ENHANCED PERMISSION VALIDATION MIDDLEWARE
// ============================================================================

/**
 * Enhanced permission validation middleware with caching
 * Provides fast permission checking with comprehensive error handling
 */
export const requirePermission = (permissionKey, options = {}) => {
  const {
    allowAdmin = true,
    requireEnabled = true,
    customErrorMessage = null
  } = options;
  
  return async (req, res, next) => {
    try {
      const { user, orgId, userPermissions, userRole } = req;
      
      if (!user || !orgId) {
        return res.status(401).json(formatApiResponse(null, {
          success: false,
          error: {
            code: 'AUTHENTICATION_REQUIRED',
            message: 'Authentication required for this operation'
          }
        }));
      }
      
      // Admin bypass (if allowed)
      if (allowAdmin && userRole === 'admin') {
        return next();
      }
      
      // Check cached permissions first
      if (userPermissions && userPermissions[permissionKey]) {
        return next();
      }
      
      // Fallback to database check
      const { data: hasPermission, error } = await supabase
        .rpc('user_has_org_permission_enhanced', {
          user_id_param: user.id,
          permission_key_param: permissionKey,
          use_cache: true
        });
      
      if (error) {
        console.error('Permission check error:', error);
        return res.status(500).json(formatApiResponse(null, {
          success: false,
          error: {
            code: 'PERMISSION_CHECK_ERROR',
            message: 'Failed to validate permissions'
          }
        }));
      }
      
      if (!hasPermission) {
        return res.status(403).json(formatApiResponse(null, {
          success: false,
          error: {
            code: 'PERMISSION_DENIED',
            message: customErrorMessage || `Permission '${permissionKey}' required`,
            details: { 
              requiredPermission: permissionKey,
              userRole: userRole,
              orgId: orgId
            }
          }
        }));
      }
      
      next();
    } catch (error) {
      console.error('Permission middleware error:', error);
      res.status(500).json(formatApiResponse(null, {
        success: false,
        error: {
          code: 'PERMISSION_MIDDLEWARE_ERROR',
          message: 'Permission validation failed'
        }
      }));
    }
  };
};

/**
 * Multiple permission validation middleware
 * Requires user to have at least one of the specified permissions
 */
export const requireAnyPermission = (permissionKeys, options = {}) => {
  return async (req, res, next) => {
    const { user, orgId, userPermissions, userRole } = req;
    
    if (!user || !orgId) {
      return res.status(401).json(formatApiResponse(null, {
        success: false,
        error: {
          code: 'AUTHENTICATION_REQUIRED',
          message: 'Authentication required for this operation'
        }
      }));
    }
    
    // Admin bypass
    if (userRole === 'admin') {
      return next();
    }
    
    // Check if user has any of the required permissions
    for (const permissionKey of permissionKeys) {
      if (userPermissions && userPermissions[permissionKey]) {
        return next();
      }
    }
    
    // Fallback to database check
    try {
      for (const permissionKey of permissionKeys) {
        const { data: hasPermission } = await supabase
          .rpc('user_has_org_permission_enhanced', {
            user_id_param: user.id,
            permission_key_param: permissionKey,
            use_cache: true
          });
        
        if (hasPermission) {
          return next();
        }
      }
      
      return res.status(403).json(formatApiResponse(null, {
        success: false,
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: 'One of the following permissions is required',
          details: { 
            requiredPermissions: permissionKeys,
            userRole: userRole
          }
        }
      }));
    } catch (error) {
      console.error('Multiple permission check error:', error);
      res.status(500).json(formatApiResponse(null, {
        success: false,
        error: {
          code: 'PERMISSION_CHECK_ERROR',
          message: 'Failed to validate permissions'
        }
      }));
    }
  };
};

// ============================================================================
// RATE LIMITING WITH ROLE-BASED LIMITS
// ============================================================================

/**
 * Role-based rate limiting middleware
 * Applies different rate limits based on user role
 */
export const rateLimitByRole = (customLimits = {}) => {
  const defaultLimits = {
    admin: { windowMs: 15 * 60 * 1000, max: 1000 },
    board_member: { windowMs: 15 * 60 * 1000, max: 500 },
    committee_lead: { windowMs: 15 * 60 * 1000, max: 300 },
    volunteer: { windowMs: 15 * 60 * 1000, max: 100 }
  };
  
  const limits = { ...defaultLimits, ...customLimits };
  
  return async (req, res, next) => {
    if (!redis) {
      return next(); // Skip rate limiting if Redis not available
    }
    
    try {
      const { user, userRole } = req;
      const userLimit = limits[userRole] || limits.volunteer;
      const key = `rate_limit:${userRole}:${user?.id || req.ip}`;
      
      // Get current count
      const current = await redis.get(key);
      const count = current ? parseInt(current) : 0;
      
      if (count >= userLimit.max) {
        return res.status(429).json(formatApiResponse(null, {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Rate limit exceeded for your role',
            details: {
              limit: userLimit.max,
              windowMs: userLimit.windowMs,
              role: userRole
            }
          }
        }));
      }
      
      // Increment counter
      const multi = redis.multi();
      multi.incr(key);
      if (count === 0) {
        multi.expire(key, Math.ceil(userLimit.windowMs / 1000));
      }
      await multi.exec();
      
      // Add rate limit headers
      res.set({
        'X-RateLimit-Limit': userLimit.max,
        'X-RateLimit-Remaining': Math.max(0, userLimit.max - count - 1),
        'X-RateLimit-Reset': new Date(Date.now() + userLimit.windowMs).toISOString()
      });
      
      next();
    } catch (error) {
      console.error('Rate limiting error:', error);
      next(); // Continue on rate limiting errors
    }
  };
};

// ============================================================================
// REQUEST VALIDATION MIDDLEWARE
// ============================================================================

/**
 * Request validation middleware with permission context
 * Validates request data and adds organizational context
 */
export const validateRequest = (schema, options = {}) => {
  const {
    validateBody = true,
    validateQuery = false,
    validateParams = false,
    requirePermission = null
  } = options;
  
  return async (req, res, next) => {
    try {
      // Validate request data based on schema
      const validationErrors = [];
      
      if (validateBody && req.body) {
        const bodyValidation = validateSchema(req.body, schema.body);
        if (!bodyValidation.valid) {
          validationErrors.push(...bodyValidation.errors.map(err => ({ field: `body.${err.field}`, message: err.message })));
        }
      }
      
      if (validateQuery && req.query) {
        const queryValidation = validateSchema(req.query, schema.query);
        if (!queryValidation.valid) {
          validationErrors.push(...queryValidation.errors.map(err => ({ field: `query.${err.field}`, message: err.message })));
        }
      }
      
      if (validateParams && req.params) {
        const paramsValidation = validateSchema(req.params, schema.params);
        if (!paramsValidation.valid) {
          validationErrors.push(...paramsValidation.errors.map(err => ({ field: `params.${err.field}`, message: err.message })));
        }
      }
      
      if (validationErrors.length > 0) {
        return res.status(400).json(formatApiResponse(null, {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Request validation failed',
            details: { validationErrors }
          }
        }));
      }
      
      // Check permission if required
      if (requirePermission) {
        return requirePermission(requirePermission)(req, res, next);
      }
      
      next();
    } catch (error) {
      console.error('Request validation error:', error);
      res.status(500).json(formatApiResponse(null, {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed'
        }
      }));
    }
  };
};

// Simple schema validation function
const validateSchema = (data, schema) => {
  const errors = [];
  
  if (!schema) return { valid: true, errors };
  
  // Basic validation - extend as needed
  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];
    
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push({ field, message: `${field} is required` });
      continue;
    }
    
    if (value !== undefined && rules.type && typeof value !== rules.type) {
      errors.push({ field, message: `${field} must be of type ${rules.type}` });
    }
    
    if (value !== undefined && rules.minLength && value.length < rules.minLength) {
      errors.push({ field, message: `${field} must be at least ${rules.minLength} characters` });
    }
    
    if (value !== undefined && rules.maxLength && value.length > rules.maxLength) {
      errors.push({ field, message: `${field} must be no more than ${rules.maxLength} characters` });
    }
    
    if (value !== undefined && rules.pattern && !rules.pattern.test(value)) {
      errors.push({ field, message: `${field} format is invalid` });
    }
  }
  
  return { valid: errors.length === 0, errors };
};

// ============================================================================
// PERFORMANCE MONITORING MIDDLEWARE
// ============================================================================

/**
 * Performance monitoring middleware
 * Tracks API performance and permission system metrics
 */
export const performanceMonitoring = (req, res, next) => {
  const startTime = Date.now();
  
  // Override res.json to capture response time
  const originalJson = res.json;
  res.json = function(data) {
    const responseTime = Date.now() - startTime;
    req.responseTime = responseTime;
    
    // Log performance metrics
    console.log(`[PERF] ${req.method} ${req.path} - ${responseTime}ms - ${res.statusCode}`);
    
    // Log slow queries
    if (responseTime > 1000) {
      console.warn(`[SLOW_QUERY] ${req.method} ${req.path} - ${responseTime}ms - User: ${req.user?.id} - Org: ${req.orgId}`);
    }
    
    // Add performance headers
    res.set({
      'X-Response-Time': `${responseTime}ms`,
      'X-Request-ID': req.requestId,
      'X-Permission-Count': req.userPermissions ? Object.keys(req.userPermissions).length : 0
    });
    
    return originalJson.call(this, data);
  };
  
  next();
};

/**
 * Permission system specific performance monitoring
 */
export const permissionPerformanceMonitoring = (req, res, next) => {
  if (req.path.includes('permission') || req.path.includes('admin')) {
    req.permissionCheckStart = Date.now();
    
    const originalNext = next;
    next = function() {
      const permissionCheckTime = Date.now() - req.permissionCheckStart;
      console.log(`[PERMISSION_PERF] ${req.path} - ${permissionCheckTime}ms`);
      
      if (permissionCheckTime > 100) {
        console.warn(`[SLOW_PERMISSION] ${req.path} - ${permissionCheckTime}ms - User: ${req.user?.id}`);
      }
      
      return originalNext();
    };
  }
  
  next();
};

// ============================================================================
// ERROR HANDLING MIDDLEWARE
// ============================================================================

/**
 * Global error handling middleware
 * Provides consistent error responses with permission context
 */
export const globalErrorHandler = (error, req, res, next) => {
  console.error('Global error handler:', error);
  
  // Database errors
  if (error.code === '23505') { // Unique constraint violation
    return res.status(409).json(formatApiResponse(null, {
      success: false,
      error: {
        code: 'DUPLICATE_RESOURCE',
        message: 'Resource already exists',
        details: process.env.NODE_ENV === 'development' ? error.detail : null
      }
    }));
  }
  
  // Permission errors
  if (error.message?.includes('permission')) {
    return res.status(403).json(formatApiResponse(null, {
      success: false,
      error: {
        code: 'PERMISSION_ERROR',
        message: 'Permission denied',
        details: {
          userRole: req.userRole,
          orgId: req.orgId
        }
      }
    }));
  }
  
  // Default error response
  res.status(500).json(formatApiResponse(null, {
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An internal server error occurred',
      details: process.env.NODE_ENV === 'development' ? error.message : null
    }
  }));
};

// ============================================================================
// EXPORT ALL MIDDLEWARE
// ============================================================================

export default {
  formatApiResponse,
  responseFormatter,
  getEnhancedOrgContext,
  requirePermission,
  requireAnyPermission,
  rateLimitByRole,
  validateRequest,
  performanceMonitoring,
  permissionPerformanceMonitoring,
  globalErrorHandler,
  PermissionCache
};
