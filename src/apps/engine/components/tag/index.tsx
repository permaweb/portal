import { useNavigate } from 'react-router-dom';

import { getRedirect } from 'helpers/utils';

import * as S from './styles';

export default function Tag(props: any) {
	const navigate = useNavigate();
	const { tag } = props;

	return <S.Tag onClick={() => navigate(getRedirect(`feed/tag/${tag}`))}>#{tag}</S.Tag>;
}
