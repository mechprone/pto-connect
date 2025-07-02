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
      if (!supabaseSession?.user?.id) {
        console.log('❌ [UserProvider] No user ID in session');
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

      if (profileError) {
        console.error('❌ [UserProvider] Profile fetch error:', profileError);
        setError(profileError.message);
        setProfile(null);
        setOrganization(null);
        setLoading(false);
        return;
      }

      console.log('✅ [UserProvider] Profile loaded:', profileData);
      setProfile(profileData);

      // Fetch organization if profile has org_id
      if (profileData?.org_id) {
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', profileData.org_id)
          .single();

        if (orgError) {
          console.error('❌ [UserProvider] Organization fetch error:', orgError);
          setError(orgError.message);
          setOrganization(null);
        } else {
          console.log('✅ [UserProvider] Organization loaded:', orgData);
          setOrganization(orgData);
        }
      } else {
        setOrganization(null);
      }
    } catch (err) {
      console.error('❌ [UserProvider] Unexpected error:', err);
      setError(err.message);
      setProfile(null);
      setOrganization(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    console.log('🔄 [UserProvider] Mounting...');
    logSessionDebug('UserProvider:mount');

    // Get initial session
    const getInitialSession = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      setSession(initialSession);
      
      if (initialSession) {
        await fetchProfileAndOrg(initialSession);
      } else {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 [UserProvider] Auth state change:', event);
        logSessionDebug(`UserProvider:auth-change:${event}`);
        
        setSession(session);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          await fetchProfileAndOrg(session);
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
          setOrganization(null);
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfileAndOrg]);

  // Computed values
  const isAuthenticated = !!profile;
  
  const isSubscriptionActive = useCallback(() => {
    if (!organization) return false;
    
    // Check if subscription is active or in trial
    const subscriptionStatus = organization.subscription_status;
    const trialEnd = organization.trial_end;
    const currentPeriodEnd = organization.current_period_end;
    
    // Active subscription
    if (subscriptionStatus === 'active') return true;
    
    // Trial period
    if (subscriptionStatus === 'trialing' && trialEnd) {
      return new Date(trialEnd) > new Date();
    }
    
    // Past due but within grace period (7 days)
    if (subscriptionStatus === 'past_due' && currentPeriodEnd) {
      const gracePeriod = new Date(currentPeriodEnd);
      gracePeriod.setDate(gracePeriod.getDate() + 7);
      return new Date() < gracePeriod;
    }
    
    return false;
  }, [organization]);

  const showRenewalBanner = useCallback(() => {
    if (!organization) return false;
    
    const currentPeriodEnd = organization.current_period_end;
    if (!currentPeriodEnd) return false;
    
    // Show banner 30 days before expiration
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    return new Date(currentPeriodEnd) <= thirtyDaysFromNow;
  }, [organization]);

  const value = {
    session,
    profile,
    organization,
    loading,
    error,
    isAuthenticated,
    isSubscriptionActive,
    showRenewalBanner,
    refreshProfile: () => fetchProfileAndOrg(session)
  };

  console.log('🔄 [UserProvider] Rendering with value:', {
    loading: value.loading,
    isAuthenticated: value.isAuthenticated,
    profile: !!value.profile,
    organization: !!value.organization
  });

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
} 