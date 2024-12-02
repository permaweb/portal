import { Button } from 'components/atoms/Button';
import { ViewHeader } from 'components/atoms/ViewHeader';
import { PortalSetup } from 'components/organisms/PortalSetup';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';

// TODO: Setup docs
export default function Setup() {
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	return (
		<S.Wrapper className={'fade-in'}>
			<ViewHeader
				header={language.setup}
				actions={[<Button type={'primary'} label={language.learn} handlePress={() => {}} disabled={false} />]}
			/>
			<S.BodyWrapper>
				<PortalSetup type={'detail'} />
			</S.BodyWrapper>
		</S.Wrapper>
	);
}
