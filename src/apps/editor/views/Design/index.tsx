import { ViewHeader } from 'editor/components/atoms/ViewHeader';
import { usePortalProvider } from 'editor/providers/PortalProvider';

import { URLTabs } from 'components/atoms/URLTabs';
import { URLS } from 'helpers/config';
import { useLanguageProvider } from 'providers/LanguageProvider';

import DesignTab from './DesignTab';
import LayoutTab from './LayoutTab';
import * as S from './styles';

export default function Design() {
	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const tabs = [
		{
			label: language?.appearance || 'Appearance',
			disabled: false,
			url: (portalId: string) => `${URLS.portalDesign(portalId)}appearance`,
			view: DesignTab,
		},
		{
			label: language?.layout || 'Layout',
			disabled: false,
			url: (portalId: string) => `${URLS.portalDesign(portalId)}layout`,
			view: LayoutTab,
		},
	];

	return (
		<S.Wrapper className={'fade-in'}>
			<ViewHeader header={language?.design} />
			<URLTabs tabs={tabs} activeUrl={`${URLS.portalDesign(portalProvider.current?.id)}appearance`} />
		</S.Wrapper>
	);
}
