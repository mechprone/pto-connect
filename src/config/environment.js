// Frontend Environment Configuration
const ENV = import.meta.env.MODE || 'development';
const IS_PREVIEW = import.meta.env.VITE_IS_PREVIEW === 'true' || ENV === 'preview';

// Environment-specific configurations
const ENV_CONFIG = {
  development: {
    apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    clientUrl: 'http://localhost:5173',
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    stripePublishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  },
  preview: {
    apiUrl: import.meta.env.VITE_API_URL || 'https://preview-api.ptoconnect.com',
    clientUrl: 'https://preview.ptoconnect.com',
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    stripePublishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  },
  production: {
    apiUrl: import.meta.env.VITE_API_URL || 'https://api.ptoconnect.com',
    clientUrl: 'https://app.ptoconnect.com',
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    stripePublishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  }
};

// Get current environment configuration
const getConfig = () => {
  const config = ENV_CONFIG[ENV] || ENV_CONFIG.development;
  
  return {
    ...config,
    isPreview: IS_PREVIEW,
    isProduction: ENV === 'production',
    isDevelopment: ENV === 'development',
    environment: ENV
  };
};

// API configuration
const getApiConfig = () => {
  const config = getConfig();
  
  return {
    baseURL: config.apiUrl,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    }
  };
};

// Supabase configuration
const getSupabaseConfig = () => {
  const config = getConfig();
  
  return {
    url: config.supabaseUrl,
    anonKey: config.supabaseAnonKey
  };
};

// Feature flags for preview environment
const getFeatureFlags = () => {
  return {
    // Enable experimental features in preview
    experimentalFeatures: IS_PREVIEW,
    
    // Enable debug logging in preview
    debugLogging: IS_PREVIEW,
    
    // Enable performance monitoring
    performanceMonitoring: true,
    
    // Enable error tracking
    errorTracking: true,
    
    // Preview-specific features
    previewFeatures: IS_PREVIEW ? {
      advancedStellaAI: true,
      workflowOrchestration: true,
      meetingAssistant: false, // Not ready yet
      predictiveAnalytics: false // Not ready yet
    } : {
      advancedStellaAI: false,
      workflowOrchestration: false,
      meetingAssistant: false,
      predictiveAnalytics: false
    }
  };
};

// Logging configuration
const getLoggingConfig = () => {
  return {
    level: IS_PREVIEW ? 'debug' : 'info',
    enableConsoleLogs: IS_PREVIEW,
    enableNetworkLogs: IS_PREVIEW,
    enablePerformanceLogs: true
  };
};

// Export configuration
export {
  getConfig,
  getApiConfig,
  getSupabaseConfig,
  getFeatureFlags,
  getLoggingConfig,
  ENV,
  IS_PREVIEW
}; 
