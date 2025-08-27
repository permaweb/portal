import React from 'react';
import { usePermawebProvider } from 'providers/PermawebProvider';

export const useComments = (rootId: any, root: boolean = false) => {
  const { libs } = usePermawebProvider();
  const [comments, setComments] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  
  React.useEffect(() => {
    if (!rootId || !libs) {
      setComments([]);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    libs.getComments({ rootId })
      .then((fetchedComments: any) => {
        const filteredComments = !root 
          ? fetchedComments || [] 
          : (fetchedComments || []).filter((comment: any) => comment.rootSource === comment.dataSource);
        setComments(filteredComments);
      })
      .catch((err: any) => {
        console.error('Error fetching comments:', err);
        setError(err);
        setComments([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [rootId, libs, root]);

  return { comments, isLoading, error };
};