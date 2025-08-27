import React from 'react';
import { dryrun } from '@permaweb/aoconnect';

const getSettings = async () => {
  return {
    portal: 'ima',
    theme: 'dark',
  };
};

const updateSettings = async (newSettings: any) => {
  return newSettings;
};

// tmp
const switchTheme = (theme: string) => {
  const colorHeaderBorder = theme === 'dark' ? '255,255,255' : '0,0,0'
  const colorNavigationBorder = theme === 'dark' ? '255,255,255' : '0,0,0'  
  document.documentElement.style.setProperty('--color-header-border', colorHeaderBorder);  
  document.documentElement.style.setProperty('--color-navigation-border', colorNavigationBorder);
}
// switchTheme(settingsQuery.data.theme)

export const initSettings = async () => {
  try {
    const response = await dryrun({
      process: 'W0p1zs887WZvlqCgRDW1Fp2jF9lXck17gZK0rvjysaM',
      tags: [{ name: 'Action', value: 'Info' }]
    });
    if (response.Messages && response.Messages.length) {
      if (response.Messages[0].Data) {
        // console.log('response: ', JSON.parse(response.Messages[0].Data));        
      }
    }    
  } catch (error) {
    console.error('Error: ', error);
  }
};
initSettings();

export const useSettings = (preview: boolean = false) => {
  if(preview) return { settings: { theme: 'dark' }, updateSetting: () => {} };

  const [settings, setSettings] = React.useState({ portal: 'ima', theme: 'dark' });
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    getSettings()
      .then((fetchedSettings) => {
        setSettings(fetchedSettings);
      })
      .catch((error) => {
        console.error('Error loading settings:', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const updateSetting = (key: string, value: any) => {
    if(key === 'theme') switchTheme(value);
    const newSettings = { ...settings, [key]: value };
    
    updateSettings(newSettings)
      .then(() => {
        setSettings(newSettings);
      })
      .catch((error) => {
        console.error('Error updating settings:', error);
      });
  };

  return {
    settings,
    isLoading,
    updateSetting,
  };
};
