# 🔒 Phase 2 Week 2 Day 7-10: Security & Performance Enhancement

**PTO Connect API Security Framework & Performance Optimization - Implementation Plan**

---

## 📋 PHASE OVERVIEW

Building upon our comprehensive API documentation and standardization, we now implement enterprise-grade security features and performance optimizations that will make PTO Connect the most secure and performant platform in the education technology space.

---

## 🎯 OBJECTIVES

### **Day 7-8: API Security Framework**
1. **API Key Management System**
   - Third-party integration key generation and management
   - Role-based API key permissions and scoping
   - API key rotation and revocation capabilities
   - Secure key storage and encryption

2. **Advanced Rate Limiting**
   - Role-based rate limiting with different tiers
   - Endpoint-specific rate limits for resource protection
   - Intelligent rate limiting with burst allowances
   - Rate limit monitoring and alerting

### **Day 9-10: Performance Optimization**
1. **API Response Caching**
   - Permission-aware cache keys for multi-tenant security
   - Redis integration for high-performance caching
   - Cache invalidation strategies for data consistency
   - Cache performance monitoring and metrics

2. **Performance Monitoring & Analytics**
   - Real-time API performance metrics and dashboards
   - Request/response time tracking and alerting
   - API usage analytics and reporting
   - Load testing framework for scalability validation

---

## 🔧 TECHNICAL IMPLEMENTATION PLAN

### **1. API Key Management System**

#### **Database Schema Enhancement**
```sql
-- API Keys table for third-party integrations
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_id VARCHAR(32) UNIQUE NOT NULL,
  key_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID REFERENCES profiles(id),
  permissions JSONB DEFAULT '{}',
  rate_limit_tier VARCHAR(20) DEFAULT 'standard',
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API Key usage tracking
CREATE TABLE api_key_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID REFERENCES api_keys(id) ON DELETE CASCADE,
  endpoint VARCHAR(255) NOT NULL,
  method VARCHAR(10) NOT NULL,
  status_code INTEGER NOT NULL,
  response_time_ms INTEGER NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_api_keys_key_id ON api_keys(key_id);
CREATE INDEX idx_api_keys_org_id ON api_keys(org_id);
CREATE INDEX idx_api_key_usage_api_key_id ON api_key_usage(api_key_id);
CREATE INDEX idx_api_key_usage_created_at ON api_key_usage(created_at);
```

#### **API Key Middleware**
```javascript
// pto-connect-backend/routes/middleware/apiKeyAuth.js
import crypto from 'crypto';
import { supabase } from '../util/verifySupabaseToken.js';

export const authenticateApiKey = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({
      success: false,
      data: null,
      meta: {
        timestamp: new Date().toISOString(),
        request_id: req.requestId,
        version: 'v1',
        endpoint: req.originalUrl,
        method: req.method
      },
      errors: [{
        code: 'API_KEY_REQUIRED',
        message: 'API key is required for this endpoint',
        field: 'x-api-key',
        details: 'Include API key in x-api-key header'
      }]
    });
  }

  try {
    // Extract key ID and hash from API key
    const [keyId, keySecret] = apiKey.split('.');
    const keyHash = crypto.createHash('sha256').update(keySecret).digest('hex');

    // Verify API key
    const { data: apiKeyData, error } = await supabase
      .from('api_keys')
      .select('*, organizations(id, name)')
      .eq('key_id', keyId)
      .eq('key_hash', keyHash)
      .eq('is_active', true)
      .single();

    if (error || !apiKeyData) {
      return res.status(401).json({
        success: false,
        data: null,
        meta: {
          timestamp: new Date().toISOString(),
          request_id: req.requestId,
          version: 'v1',
          endpoint: req.originalUrl,
          method: req.method
        },
        errors: [{
          code: 'INVALID_API_KEY',
          message: 'Invalid or expired API key',
          field: 'x-api-key',
          details: null
        }]
      });
    }

    // Check expiration
    if (apiKeyData.expires_at && new Date(apiKeyData.expires_at) < new Date()) {
      return res.status(401).json({
        success: false,
        data: null,
        meta: {
          timestamp: new Date().toISOString(),
          request_id: req.requestId,
          version: 'v1',
          endpoint: req.originalUrl,
          method: req.method
        },
        errors: [{
          code: 'API_KEY_EXPIRED',
          message: 'API key has expired',
          field: 'x-api-key',
          details: `Key expired on ${apiKeyData.expires_at}`
        }]
      });
    }

    // Add API key context to request
    req.apiKey = apiKeyData;
    req.orgId = apiKeyData.org_id;
    req.organization = apiKeyData.organizations;

    // Update last used timestamp
    await supabase
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', apiKeyData.id);

    next();
  } catch (err) {
    console.error('❌ API Key authentication error:', err.message);
    res.status(500).json({
      success: false,
      data: null,
      meta: {
        timestamp: new Date().toISOString(),
        request_id: req.requestId,
        version: 'v1',
        endpoint: req.originalUrl,
        method: req.method
      },
      errors: [{
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Authentication service error',
        field: null,
        details: null
      }]
    });
  }
};
```

### **2. Advanced Rate Limiting System**

#### **Rate Limiting Middleware**
```javascript
// pto-connect-backend/routes/middleware/rateLimiting.js
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';

// Redis client for rate limiting
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Rate limit tiers
const RATE_LIMIT_TIERS = {
  free: { requests: 100, window: 15 * 60 * 1000 }, // 100 requests per 15 minutes
  standard: { requests: 1000, window: 15 * 60 * 1000 }, // 1000 requests per 15 minutes
  premium: { requests: 5000, window: 15 * 60 * 1000 }, // 5000 requests per 15 minutes
  enterprise: { requests: 10000, window: 15 * 60 * 1000 } // 10000 requests per 15 minutes
};

// Create rate limiter based on tier
export const createRateLimiter = (tier = 'standard') => {
  const config = RATE_LIMIT_TIERS[tier] || RATE_LIMIT_TIERS.standard;
  
  return rateLimit({
    store: new RedisStore({
      sendCommand: (...args) => redis.call(...args),
    }),
    windowMs: config.window,
    max: config.requests,
    message: {
      success: false,
      data: null,
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1'
      },
      errors: [{
        code: 'RATE_LIMIT_EXCEEDED',
        message: `Rate limit exceeded. Maximum ${config.requests} requests per ${config.window / 60000} minutes.`,
        field: null,
        details: `Tier: ${tier}`
      }]
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      // Use API key or user ID for rate limiting
      if (req.apiKey) {
        return `api_key:${req.apiKey.key_id}`;
      }
      if (req.user) {
        return `user:${req.user.id}`;
      }
      return req.ip;
    }
  });
};

// Endpoint-specific rate limiters
export const authRateLimit = createRateLimiter('free');
export const apiRateLimit = createRateLimiter('standard');
export const premiumRateLimit = createRateLimiter('premium');
export const enterpriseRateLimit = createRateLimiter('enterprise');
```

### **3. API Response Caching System**

#### **Permission-Aware Caching Middleware**
```javascript
// pto-connect-backend/routes/middleware/apiCaching.js
import Redis from 'ioredis';
import crypto from 'crypto';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Cache configuration
const CACHE_CONFIG = {
  defaultTTL: 300, // 5 minutes
  endpoints: {
    '/api/event': { ttl: 600, permissions: ['events.read'] },
    '/api/budget': { ttl: 300, permissions: ['budget.read'] },
    '/api/profile': { ttl: 900, permissions: ['profile.read'] },
    '/api/admin/permissions': { ttl: 1800, permissions: ['admin.read'] }
  }
};

export const apiCache = (options = {}) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const endpoint = req.route?.path || req.path;
    const config = CACHE_CONFIG.endpoints[endpoint] || { ttl: CACHE_CONFIG.defaultTTL };

    // Create permission-aware cache key
    const cacheKey = generateCacheKey(req, endpoint);

    try {
      // Check cache
      const cachedResponse = await redis.get(cacheKey);
      
      if (cachedResponse) {
        const data = JSON.parse(cachedResponse);
        
        // Add cache hit metadata
        data.meta = {
          ...data.meta,
          cache_hit: true,
          cache_key: cacheKey.substring(0, 16) + '...'
        };

        console.log(`✅ Cache HIT for ${endpoint} - Key: ${cacheKey.substring(0, 16)}...`);
        return res.json(data);
      }

      // Cache miss - continue to route handler
      const originalJson = res.json;
      res.json = function(data) {
        // Only cache successful responses
        if (data.success) {
          // Add cache metadata
          data.meta = {
            ...data.meta,
            cache_hit: false,
            cache_ttl: config.ttl
          };

          // Cache the response
          redis.setex(cacheKey, config.ttl, JSON.stringify(data))
            .then(() => {
              console.log(`✅ Cache SET for ${endpoint} - TTL: ${config.ttl}s - Key: ${cacheKey.substring(0, 16)}...`);
            })
            .catch(err => {
              console.error('❌ Cache SET error:', err.message);
            });
        }

        return originalJson.call(this, data);
      };

      next();
    } catch (err) {
      console.error('❌ Cache middleware error:', err.message);
      next(); // Continue without caching on error
    }
  };
};

// Generate permission-aware cache key
function generateCacheKey(req, endpoint) {
  const components = [
    'api_cache',
    endpoint,
    req.orgId || 'no_org',
    req.user?.id || req.apiKey?.key_id || 'anonymous',
    req.user?.role || req.apiKey?.rate_limit_tier || 'guest'
  ];

  // Add query parameters to cache key
  if (Object.keys(req.query).length > 0) {
    const sortedQuery = Object.keys(req.query)
      .sort()
      .map(key => `${key}=${req.query[key]}`)
      .join('&');
    components.push(crypto.createHash('md5').update(sortedQuery).digest('hex'));
  }

  return components.join(':');
}

// Cache invalidation utilities
export const invalidateCache = async (pattern) => {
  try {
    const keys = await redis.keys(`api_cache:${pattern}*`);
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`✅ Cache invalidated: ${keys.length} keys matching ${pattern}`);
    }
  } catch (err) {
    console.error('❌ Cache invalidation error:', err.message);
  }
};

export const invalidateOrgCache = (orgId) => invalidateCache(`*:${orgId}:*`);
export const invalidateUserCache = (userId) => invalidateCache(`*:*:${userId}:*`);
export const invalidateEndpointCache = (endpoint) => invalidateCache(`${endpoint}:*`);
```

### **4. Performance Monitoring System**

#### **Performance Metrics Middleware**
```javascript
// pto-connect-backend/routes/middleware/performanceMonitoring.js
import { performance } from 'perf_hooks';

// Performance metrics storage
const metrics = {
  requests: new Map(),
  endpoints: new Map(),
  errors: new Map()
};

export const performanceMonitoring = (req, res, next) => {
  const startTime = performance.now();
  const timestamp = new Date();

  // Track request start
  req.startTime = startTime;
  req.timestamp = timestamp;

  // Override res.json to capture response metrics
  const originalJson = res.json;
  res.json = function(data) {
    const endTime = performance.now();
    const responseTime = Math.round(endTime - startTime);

    // Record metrics
    recordMetrics(req, res, responseTime, data);

    return originalJson.call(this, data);
  };

  next();
};

function recordMetrics(req, res, responseTime, responseData) {
  const endpoint = req.route?.path || req.path;
  const method = req.method;
  const statusCode = res.statusCode;
  const success = responseData?.success || statusCode < 400;

  // Update request metrics
  const requestKey = `${method}:${endpoint}`;
  if (!metrics.requests.has(requestKey)) {
    metrics.requests.set(requestKey, {
      count: 0,
      totalTime: 0,
      minTime: Infinity,
      maxTime: 0,
      errors: 0,
      lastRequest: null
    });
  }

  const requestMetrics = metrics.requests.get(requestKey);
  requestMetrics.count++;
  requestMetrics.totalTime += responseTime;
  requestMetrics.minTime = Math.min(requestMetrics.minTime, responseTime);
  requestMetrics.maxTime = Math.max(requestMetrics.maxTime, responseTime);
  requestMetrics.lastRequest = new Date();

  if (!success) {
    requestMetrics.errors++;
  }

  // Log slow requests
  if (responseTime > 1000) {
    console.warn(`🐌 Slow request: ${method} ${endpoint} - ${responseTime}ms`);
  }

  // Log errors
  if (!success) {
    console.error(`❌ Request error: ${method} ${endpoint} - Status: ${statusCode} - Time: ${responseTime}ms`);
  }

  // Success log for monitoring
  if (success && responseTime < 100) {
    console.log(`✅ Fast request: ${method} ${endpoint} - ${responseTime}ms`);
  }
}

// Get performance metrics
export const getPerformanceMetrics = () => {
  const summary = {
    totalRequests: 0,
    totalErrors: 0,
    averageResponseTime: 0,
    endpoints: []
  };

  let totalTime = 0;

  for (const [endpoint, metrics] of metrics.requests.entries()) {
    summary.totalRequests += metrics.count;
    summary.totalErrors += metrics.errors;
    totalTime += metrics.totalTime;

    summary.endpoints.push({
      endpoint,
      requests: metrics.count,
      errors: metrics.errors,
      errorRate: ((metrics.errors / metrics.count) * 100).toFixed(2) + '%',
      avgResponseTime: Math.round(metrics.totalTime / metrics.count),
      minResponseTime: metrics.minTime === Infinity ? 0 : metrics.minTime,
      maxResponseTime: metrics.maxTime,
      lastRequest: metrics.lastRequest
    });
  }

  summary.averageResponseTime = summary.totalRequests > 0 
    ? Math.round(totalTime / summary.totalRequests) 
    : 0;

  summary.errorRate = summary.totalRequests > 0 
    ? ((summary.totalErrors / summary.totalRequests) * 100).toFixed(2) + '%' 
    : '0%';

  return summary;
};

// Reset metrics
export const resetMetrics = () => {
  metrics.requests.clear();
  metrics.endpoints.clear();
  metrics.errors.clear();
  console.log('📊 Performance metrics reset');
};
```

---

## 🎯 SUCCESS METRICS

### **Security Framework**
- [ ] API key generation and management system operational
- [ ] Role-based API key permissions implemented
- [ ] Advanced rate limiting with tier-based controls active
- [ ] API key usage tracking and analytics functional
- [ ] Secure key storage and encryption verified

### **Performance Optimization**
- [ ] Permission-aware API response caching implemented
- [ ] Redis integration for high-performance caching active
- [ ] Cache invalidation strategies operational
- [ ] Real-time performance monitoring dashboard functional
- [ ] API response times under 100ms for cached requests

### **Monitoring & Analytics**
- [ ] Performance metrics collection and reporting active
- [ ] Request/response time tracking operational
- [ ] API usage analytics and dashboards functional
- [ ] Load testing framework implemented and validated
- [ ] Alerting system for performance degradation active

---

## 🚀 EXPECTED OUTCOMES

### **Enterprise Security**
- **API Key Management**: Secure third-party integration capabilities
- **Advanced Rate Limiting**: Protection against abuse and overuse
- **Usage Tracking**: Comprehensive audit trail for enterprise compliance
- **Permission-Based Access**: Granular control over API access and capabilities

### **Performance Excellence**
- **Sub-100ms Response Times**: Cached responses for optimal user experience
- **Scalable Architecture**: Redis-backed caching for enterprise-level performance
- **Intelligent Caching**: Permission-aware cache keys for security and efficiency
- **Real-time Monitoring**: Proactive performance issue detection and resolution

### **Business Value**
- **Enterprise Appeal**: Professional security and performance features attract large contracts
- **Developer Ecosystem**: Secure API keys enable rich third-party integrations
- **Competitive Advantage**: Industry-leading performance and security standards
- **Operational Excellence**: Comprehensive monitoring and analytics for continuous improvement

---

**Ready to implement the most secure and performant API platform in the education technology space!**

---

*Phase 2 Week 2 Day 7-10: Security & Performance Enhancement - Implementation Plan*
*PTO Connect API v1.3.0 - Enterprise Security & Performance Framework*
