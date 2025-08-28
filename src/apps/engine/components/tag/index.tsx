import { useNavigate } from 'react-router-dom';

import * as S from './styles';

export default function Tag(props: any) {
	const navigate = useNavigate();
	const { tag } = props;

	return <S.Tag onClick={() => navigate(`/feed/tag/${tag}`)}>#{tag}</S.Tag>;
}
