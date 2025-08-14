import { useNavigate } from 'react-router-dom';

import { ViewHeader } from 'editor/components/atoms/ViewHeader';
import { DomainList } from 'editor/components/organisms/DomainList';
import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
import { ASSETS, URLS } from 'helpers/config';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';

export default function Domains() {
	const navigate = useNavigate();

	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	return (
		<S.Wrapper className={'fade-in'}>
			<ViewHeader
				header={language?.domains}
				actions={[
					<Button
						type={'alt1'}
						label={language.registerDomain}
						handlePress={() => navigate(URLS.portalDomainsRegister(portalProvider.current?.id))}
						icon={ASSETS.domains}
						iconLeftAlign
					/>,
				]}
			/>
			<S.BodyWrapper className={'border-wrapper-alt1'}>
				<DomainList />
			</S.BodyWrapper>
		</S.Wrapper>
	);
}
