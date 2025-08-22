import { useContext, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { usePermawebProvider } from 'providers/PermawebProvider';
import { PortalContext } from 'engine/providers/portalProvider';
import { defaultThemes } from 'engine/defaults/theme.defaults';
import { defaultLayout } from 'engine/defaults/layout.defaults';
import { defaultPages } from 'engine/defaults/pages.defaults';
import WebFont from 'webfontloader';

const persister = createAsyncStoragePersister({
  storage: window.localStorage,
  key: 'portal-cache',
});

let hasPersisted = false;

export const useUI = (preview: boolean = false) => {
  if (preview) return { Themes: defaultThemes, Data: defaultLayout };
  const { libs } = usePermawebProvider();
  const { portalId } = useContext<any>(PortalContext);  
  const defaultPortal = { themes: defaultThemes, layout: defaultLayout, pages: defaultPages };
  const queryClient = useQueryClient();

  if (!hasPersisted) {
    persistQueryClient({
      queryClient,
      persister,
      maxAge: Infinity,
    });
    hasPersisted = true;
  }

  const updateZone = () => {}

  const { data: portal, isLoading, error } = useQuery({
    queryKey: [`portal-${portalId}`],
    queryFn: async () => {      
      if (!libs || !portalId) return null;
      const portalData = await libs.getZone(portalId);
      console.log('portalData: ', portalData)
      const Store = portalData.store;
      const posts = Store.index && Store.index.reverse();
      return {        
        ...Store,
        ...defaultPortal,
        posts
      };
    },
    enabled: !!libs && !!portalId,
    initialData: () => {
      const cached = queryClient.getQueryData([`portal-${portalId}`]);
      // console.log('cached: ', cached)
      if (portalId && cached) return {
        ...defaultPortal,
        ...cached,
        layout: { ...defaultLayout, ...(cached.layout || {}) },
        pages: { ...defaultPages, ...(cached.pages || {}) },
      };
      return defaultPortal;
    }
  });

  if(portal?.fonts) {
    const fonts = portal?.fonts;
		const families = [];

    if (fonts.headers) families.push(fonts.headers);
    if (fonts.body) families.push(fonts.body);

    if (families.length > 0) {
      WebFont.load({
        google: { families: families },
        active: () => {
          const [bodyFont, bodyWeight] = fonts.body.trim().split(":");
          const bodyWeights = bodyWeight.split(",");
          document.documentElement.style.setProperty('--font-body', bodyFont);
          document.documentElement.style.setProperty('--font-body-weight', bodyWeights[0]);
          document.documentElement.style.setProperty('--font-body-weight-bold', bodyWeights[1]);
          
          const [headerFont, headerWeight] = fonts.headers.trim().split(":");
          const headerWeights = headerWeight.split(",");
          document.documentElement.style.setProperty('--font-header', headerFont);
          document.documentElement.style.setProperty('--font-header-weight', headerWeights[0]);
          document.documentElement.style.setProperty('--font-header-weight-bold', headerWeights[1]);
          
        }
      });
    }
  }

  const Name = portal?.name;
  const Categories = portal?.categories;
  const Layout = portal?.layout;
  const Pages = portal?.pages;
  const Posts = portal?.posts;
  const Themes = portal?.themes;
  const Logo = portal?.logo;

  return { Name, Categories, Layout, Pages, Themes, Posts, Logo, updateZone, isLoading, error };
};
