import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';

export function useUserProfile() {
  const [profile, setProfile] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) throw userError;
        if (!user) {
          setProfile(null);
          setOrganization(null);
          setLoading(false);
          return;
        }

        // Get user profile with organization data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select(`
            *
          `)
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        setProfile(profileData);
        setOrganization(profileData?.organizations);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setProfile(null);
        setOrganization(null);
      } else if (event === 'SIGNED_IN' && session) {
        fetchUserProfile();
      }
    });

    return () => subscription.unsubscribe();
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
