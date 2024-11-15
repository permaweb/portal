import { useNavigate } from 'react-router-dom';

import { Button } from 'components/atoms/Button';
import { ViewHeader } from 'components/atoms/ViewHeader';
import { PostList } from 'components/organisms/PostList';
import { ASSETS, URLS } from 'helpers/config';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePortalProvider } from 'providers/PortalProvider';

import * as S from './styles';

// TODO: Topics config
export default function Posts() {
	const navigate = useNavigate();

	const portalProvider = usePortalProvider();

	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	return (
		<S.Wrapper className={'fade-in'}>
			<ViewHeader
				header={language.posts}
				actions={[
					<Button
						type={'alt1'}
						label={language.createPost}
						handlePress={() => navigate(URLS.postCreateArticle(portalProvider.current.id))}
						disabled={!portalProvider.current}
						icon={ASSETS.add}
						iconLeftAlign
					/>,
				]}
			/>
			<S.BodyWrapper className={'border-wrapper-primary'}>
				<PostList />
			</S.BodyWrapper>
		</S.Wrapper>
	);
}
