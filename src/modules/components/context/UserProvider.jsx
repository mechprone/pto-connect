import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { logSessionDebug } from '@/utils/debugSession';

const UserContext = createContext();

export function UserProvider({ children }) {
  console.log('🔄 [UserProvider] Initializing...');
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper: fetch profile and org
  const fetchProfileAndOrg = useCallback(async (supabaseSession) => {
    console.log('🔄 [UserProvider] Fetching profile and org...');
    setLoading(true);
    setError(null);
    try {
      if (!supabaseSession) {
        setProfile(null);
        setOrganization(null);
        setLoading(false);
        return;
      }
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseSession.user.id)
        .single();
      if (profileError) throw profileError;
      console.log('✅ [UserProvider] Profile loaded:', profileData);
      setProfile(profileData);
      // Fetch organization (if org_id present)
      if (profileData?.org_id) {
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', profileData.org_id)
          .single();
        if (orgError) throw orgError;
        console.log('✅ [UserProvider] Organization loaded:', orgData);
        setOrganization(orgData);
      } else {
        setOrganization(null);
      }
    } catch (err) {
      console.error('❌ [UserProvider] Error:', err);
      setError(err.message || 'Failed to fetch user profile or organization');
      setProfile(null);
      setOrganization(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // On mount: get session and fetch profile/org
  useEffect(() => {
    console.log('🔄 [UserProvider] Mounting...');
    logSessionDebug('UserProvider:mount');
    let mounted = true;
    supabase.auth.getSession().then(({ data: { session: supaSession } }) => {
      if (!mounted) return;
      setSession(supaSession);
      fetchProfileAndOrg(supaSession);
    });
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, supaSession) => {
      console.log('🔄 [UserProvider] Auth state change:', event);
      logSessionDebug(`UserProvider:auth-change:${event}`);
      setSession(supaSession);
      fetchProfileAndOrg(supaSession);
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfileAndOrg]);

  // Derived helpers
  const isAuthenticated = !!profile;
  const hasRole = useCallback((requiredRole) => profile?.role === requiredRole, [profile]);
  const hasAnyRole = useCallback((roles) => roles.includes(profile?.role), [profile]);
  const isSubscriptionActive = useCallback(() => {
    if (!organization) return false;
    const { subscription_status, trial_ends_at } = organization;
    return (
      subscription_status === 'active' ||
      (subscription_status === 'trial' && trial_ends_at && new Date(trial_ends_at) > new Date())
    );
  }, [organization]);
  const showRenewalBanner = useCallback(() => {
    if (!organization) return false;
    const { plan_type, subscription_status, cancel_at_period_end, current_period_end } = organization;
    if (
      plan_type === 'annual' &&
      subscription_status === 'active' &&
      cancel_at_period_end &&
      current_period_end &&
      (new Date(current_period_end) - new Date() < 15 * 24 * 60 * 60 * 1000)
    ) {
      return true;
    }
    return false;
  }, [organization]);

  // Expose context value
  const value = {
    session,
    profile,
    organization,
    loading,
    error,
    isAuthenticated,
    hasRole,
    hasAnyRole,
    isSubscriptionActive,
    showRenewalBanner,
    // Optionally expose updateProfile, etc.
  };

  console.log('🔄 [UserProvider] Rendering with value:', { loading, isAuthenticated, profile: !!profile, organization: !!organization });

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
} 