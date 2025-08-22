import { useUI } from 'engine/hooks/portal';
import * as S from './styles';

export default function GridRow(props: any) {
  const { Layout } = useUI(false);
  const { getContent, content, layout, preview } = props;  
  
  return (
    <S.GridRow $layout={layout}>
      <S.GridRowWrapper $layout={layout} maxWidth={Layout?.basics?.maxWidth}>
      {content.map((element: any, index: number) => {
        return (
          <>
          {getContent(element, preview, index)}
          {layout?.separation && index < content.length - 1 && <S.Separation />}
          </>
        )
      })}
      </S.GridRowWrapper>
    </S.GridRow>
  );
    
};