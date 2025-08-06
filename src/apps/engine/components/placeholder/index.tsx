import * as S from './styles';

export default function Placeholder(props: any) {
  const { width = 100 } = props;

  return <S.Placeholder $width={width} />
}