import React from 'react';
import { usePermawebProvider } from 'providers/PermawebProvider';
import { cacheProfile, getCachedProfile } from 'helpers/utils';
import Placeholder from 'engine/components/placeholder';

export const useProfile = (profileId: string) => {
  const { libs } = usePermawebProvider();
  const [profile, setProfile] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  
  React.useEffect(() => {
    if (!profileId || !libs) {
      setProfile(null);
      return;
    }
    
    // Check cache first
    const cached = getCachedProfile(profileId);
    if (cached) {
      setProfile(cached);
      return;
    }
    
    // Fetch from API
    setIsLoading(true);
    setError(null);
    
    libs.getProfileById(profileId)
      .then((fetchedProfile: any) => {
        if (fetchedProfile) {
          cacheProfile(profileId, fetchedProfile);
          setProfile(fetchedProfile);
        }
      })
      .catch((err: any) => {
        console.error('Error fetching profile:', err);
        setError(err);
        // Try to return cached data on error
        const cachedFallback = getCachedProfile(profileId);
        if (cachedFallback) {
          setProfile(cachedFallback);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [profileId, libs]);

  // Return placeholder components when loading or no data
  if (!profileId || isLoading || !profile) {
    return {
      profile: {
        displayName: <Placeholder width="100" />,
        thumbnail: '', // Empty for img src
        id: profileId || ''
      },
      isLoading: !Boolean(profileId) || isLoading,
      error
    };
  }
  
  return { 
    profile,
    isLoading: false,
    error
  };
};
