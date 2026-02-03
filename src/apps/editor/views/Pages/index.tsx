import { useNavigate } from 'react-router-dom';

import { ViewHeader } from 'editor/components/atoms/ViewHeader';
import { PageList } from 'editor/components/organisms/PageList';
import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
import { ICONS, URLS } from 'helpers/config';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';

export default function Pages() {
	const navigate = useNavigate();

	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const unauthorized = !portalProvider.permissions?.updatePortalMeta;

	return (
		<S.Wrapper>
			<ViewHeader
				header={language?.pages}
				actions={[
					<Button
						type={'alt2'}
						label={language?.tips}
						handlePress={() => navigate(URLS.portalTips(portalProvider.current.id))}
						disabled={unauthorized || !portalProvider.current}
					/>,
					<Button
						type={'alt1'}
						label={language?.createPage}
						handlePress={() => navigate(URLS.pageCreateMain(portalProvider.current.id))}
						disabled={unauthorized || !portalProvider.current}
						icon={ICONS.add}
						iconLeftAlign
					/>,
				]}
			/>
			<S.BodyWrapper>
				<PageList />
			</S.BodyWrapper>
		</S.Wrapper>
	);
}
