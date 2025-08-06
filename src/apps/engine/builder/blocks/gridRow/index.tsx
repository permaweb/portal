import * as S from './styles';

export default function GridRow(props: any) {    
  const { getContent, content, layout, preview } = props;  
  
  return (
    <S.GridRow $layout={layout}>
      <S.GridRowWrapper $layout={layout}>
      {content.map((element: any, index: number) => {
        return getContent(element, preview, index)
      })}
      </S.GridRowWrapper>
    </S.GridRow>
  );
    
};