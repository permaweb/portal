import { useUI } from '../hooks/portal';
import Grid from './blocks/grid';
import GridRow from './blocks/gridRow';
import Post from './blocks/post';
import PostSpotlight from './blocks/postSpotlight';
import Reel from './blocks/reel';
import Image from './blocks/image';
import Iframe from './blocks/iframe';
import Feed from './blocks/feed';
import Sidebar from './blocks/sidebar';
import CategorySpotlight from './blocks/categorySpotlight';
import MediaSpotlight from './blocks/mediaSpotlight';
// import StaticPage from './static';
import Link from './blocks/link';

export default function Builder(props: any) {    
  const { preview } = props;
  const { Layout } = useUI(preview);
  const { layout } = props;

  const getContent = (element: any, preview: boolean, index: number) => {
    switch (element?.type) {

      // Blocks
      case 'grid':        
        return <Grid id="grid" key={index} getContent={getContent} content={element.content} title={element.title} layout={element.layout} preview={preview} />;
      case 'row':
        return <GridRow key={index} getContent={getContent} content={element.content} layout={element.layout} preview={preview} />;
      case 'reel':
        return <Reel key={index} uri={element.uri} width={element.width} title={element.title} preview={preview} />;
      case 'post':
        return <Post key={index} txId={element.txId} title={element.title} gap={element.gap}  preview={preview} />;
      case 'feed':
        return <Feed key={index} preview={preview} />;
      case 'sidebar':
        return <Sidebar key={index} layout={Layout.Base} content={element.content} gap={element.gap} preview={preview} />;
      case 'postSpotlight':
        return <PostSpotlight key={index} txId={element.txId} preview={preview} />;
      case 'categorySpotlight':
        return <CategorySpotlight key={index} layout={Layout.Base} category={element.category} tag={element.tag} gap={element.gap} preview={preview} />;
      case 'mediaSpotlight':
        return <MediaSpotlight key={index} preview={preview} category={element.category} />
      
      // Post
      case 'iframe':
        return <Iframe key={index} uri={element.uri} width={element.width} height={element.height} title={element.title} />;
      case 'image':
        return <Image key={index} title={element.title} uri={element.uri} />;      

      // Other
      case 'static':
        return <StaticPage content={element.content} />
      case 'authors':
        return <StaticPage content={element.content} />
      case 'podcasts':
        return <StaticPage content={element.content} background={false}/>
      case 'link':
        return <Link key={index} target={element.target} to={element.uri} label={element.text} />;
      case 'label':
        return element.text;
      default:
        return null;
    }
  };

  return getContent(layout, preview, 0);
    
};

