import { ViewHeader } from 'editor/components/atoms/ViewHeader';
import { PortalSetup } from 'editor/components/organisms/PortalSetup';

import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';

export default function Setup() {
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	return (
		<S.Wrapper className={'fade-in'}>
			<ViewHeader header={language?.setup} />
			<S.BodyWrapper>
				<PortalSetup type={'detail'} />
			</S.BodyWrapper>
		</S.Wrapper>
	);
}
