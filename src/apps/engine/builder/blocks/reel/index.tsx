import GridItem from '../gridItem';
// import PostPreview from '../postPreview';
// import * as S from './styles';

export default function Reel(props: any) {  
  const { width, title } = props;

  return (
    <GridItem title={title} width={width}>        
    {/*
      <PostPreview post={
        { 
          thumbnail: "https://stratpol.com/wp-content/uploads/2024/08/Biden-Netanyahu-800x445.webp",
          title: "Une présidence Trump aurait-elle pu prévenir la guerre en Ukraine ?",
          tags: ["abcabc", "defdefdef", "ghi", "jkljkl"]
        }
      }></PostPreview>
      */}
    </GridItem>
  
  );
    
};