import { useNavigate } from 'react-router-dom';
// import { usePodcasts } from '../../../mock/podcasts/hook';
import * as S from './styles';
import SidebarUser from './blocks/user';
import SidebarArchive from './blocks/archive';
import SidebarAuthors from './blocks/authors';

export default function Sidebar(props: any) {
  const { content } = props;
  const navigate = useNavigate();  
  // const { podcasts } = usePodcasts();

  return (
    <S.Sidebar id="Sidebar">
      
      {Array.isArray(content) && content.includes('date') && (
        <SidebarArchive />
      )}      

      {Array.isArray(content) && content.includes('authors') && (
        <SidebarAuthors />
      )}

      {/* Array.isArray(content) && content.includes('sources') && (
        <S.SidebarCategory>
          <h2>Sources</h2>
          <S.FNCategory>
            <S.FNEntry $level={0} onClick={() => navigate(`/feed/network/The Conscious Resistance Network`)}>The Conscious Resistance Network (4)</S.FNEntry>
            <S.FNEntry $level={0} onClick={() => navigate(`/feed/network/Unlimited Hangout`)}>Unlimited Hangout (3)</S.FNEntry>
            <S.FNEntry $level={0} onClick={() => navigate(`/feed/network/The Last American Vagabond`)}>The Last American Vagabond (3)</S.FNEntry>
          </S.FNCategory>
        </S.SidebarCategory>
      ) */}
      
      {Array.isArray(content) && content.includes('podcasts') && (
        <S.SidebarCategory>
          <h2>Podcasts</h2>
          {/* podcasts && podcasts.slice(0, 3).map((podcast, index) => {
            return (
              <S.Podcast key={index}>
                <S.PodcastThumbnail>
                  <img src={podcast.thumbnail} />
                </S.PodcastThumbnail>
                <h3>{podcast.title}</h3>
              </S.Podcast>       
            )
          }) */}
        </S.SidebarCategory>
      )}        

      {Array.isArray(content) && content.includes('user') && (
        <SidebarUser />
      )}
    </S.Sidebar>
  )
}
