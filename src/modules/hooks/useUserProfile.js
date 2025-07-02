import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { logSessionDebug } from '@/utils/debugSession';

export function useUserProfile() {
  const [profile, setProfile] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Log session debug at hook start
  useEffect(() => {
    logSessionDebug('useUserProfile.js:hook-start');
  }, []);

  useEffect(() => {
    async function fetchUserProfile() {
      setLoading(true);
      setError(null);
      try {
        // Check current session before making API call
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log('🔍 [useUserProfile] Current session:', !!session, sessionError);
        
        if (!session) {
          console.log('❌ [useUserProfile] No valid session found');
          setLoading(false);
          return;
        }

        console.log('✅ [useUserProfile] Valid session found, making profiles API call');
        const { data, error: fetchError } = await supabase.from('profiles').select('*').single();
        
        if (fetchError) {
          console.error('❌ [useUserProfile] Profiles API error:', fetchError);
          throw fetchError;
        }
        
        console.log('✅ [useUserProfile] Profiles API success:', data);
        setProfile(data);
        setOrganization(data?.org_id || null);
      } catch (err) {
        console.error('❌ [useUserProfile] fetchUserProfile error:', err);
        setError(err.message || 'Failed to fetch user profile');
      } finally {
        setLoading(false);
      }
    }

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔐 [useUserProfile] Auth state change:', event, !!session);
      logSessionDebug(`useUserProfile.js:auth-change:${event}`);
      
      // Only act on significant auth changes, not INITIAL_SESSION
      if (event === 'SIGNED_OUT') {
        console.log('👋 [useUserProfile] User signed out, clearing profile');
        setProfile(null);
        setOrganization(null);
      } else if (event === 'SIGNED_IN' && session) {
        console.log('👤 [useUserProfile] User signed in, fetching profile');
        logSessionDebug('useUserProfile.js:after-login');
        fetchUserProfile();
      }
    });

    // On mount, fetch profile if session exists
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔍 [useUserProfile] Initial session check:', !!session);
      if (session) {
        fetchUserProfile();
      } else {
        setLoading(false);
      }
    });

    return () => {
      console.log('🧹 [useUserProfile] Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  const updateProfile = async (updates) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(prev => ({ ...prev, ...data }));
      return { data, error: null };
    } catch (err) {
      console.error('Error updating profile:', err);
      return { data: null, error: err.message };
    }
  };

  const hasRole = (requiredRole) => {
    return profile?.role === requiredRole;
  };

  const hasAnyRole = (roles) => {
    return roles.includes(profile?.role);
  };

  const isSubscriptionActive = () => {
    if (!organization) return false;
    const { subscription_status, trial_ends_at } = organization;
    return (
      subscription_status === 'active' ||
      (subscription_status === 'trial' && trial_ends_at && new Date(trial_ends_at) > new Date())
    );
  };

  // Show renewal banner for annual plans expiring soon
  const showRenewalBanner = () => {
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
  };

  return {
    profile,
    organization,
    loading,
    error,
    updateProfile,
    hasRole,
    hasAnyRole,
    isSubscriptionActive,
    showRenewalBanner,
    isAuthenticated: !!profile,
  };
}

