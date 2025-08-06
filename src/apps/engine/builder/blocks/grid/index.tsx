import Title from 'engine/components/title';
import * as S from './styles';

export default function Grid(props: any) {  
  const { getContent, content, title, layout, preview  } = props;

  return (
    <S.Grid $layout={layout} id="Grid">
    {title && <Title><h2>{title}</h2></Title>}
      {content.map((element: any, index: number) => {
        return getContent(element, preview, index)
      })}
    </S.Grid>
  );
    
};