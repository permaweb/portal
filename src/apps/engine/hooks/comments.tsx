import { useQuery } from '@tanstack/react-query';
import { usePermawebProvider } from 'providers/PermawebProvider';

const fetchComments = async (libs: any, rootId: string) => {
  try {
    const comments = await libs.getComments({ rootId })    
    return comments;
  } catch(e){
    console.error(e);
  }
}

export const useComments = (rootId: any, root: boolean = false) => {
  const { libs } = usePermawebProvider();

  const { data, isLoading, error } = useQuery({
    queryKey: [`comments-${rootId}`],
    queryFn: () => fetchComments(libs, rootId),
    enabled: !!libs && !!rootId
  });

  const comments = !root ? data || [] : (data || []).filter((comment: any) => comment.rootSource === comment.dataSource);

  return { comments, isLoading, error };
};