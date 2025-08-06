import { useQuery } from '@tanstack/react-query';
import { usePermawebProvider } from 'providers/PermawebProvider';

const fetchProfile = async (profileId: string, libs: any) => {  
  try {
    const profile = await libs.getProfileById(profileId);
    return profile;
  } catch (e) {
    console.error('Error: ', e);
  }
};

export const useProfile = (profileId: string) => {
  const { libs } = usePermawebProvider();
  
  const { data, isLoading, error } = useQuery({
    queryKey: [`profile-${profileId}`],
    queryFn: () =>
      new Promise((resolve) =>
        setTimeout(() => resolve(fetchProfile(profileId, libs)), 500)
      ), 
    enabled: !!libs && !!profileId
  });

  return { 
    profile: data,
    isLoading: !Boolean(profileId) || isLoading,
    error
  };
};
