import { Link } from 'react-router-dom';
import { ReactSVG } from 'react-svg';

import { ASSETS, REDIRECTS, URLS } from 'helpers/config';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';

export default function Footer() {
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const socialPaths = [
		{ icon: ASSETS.x, href: REDIRECTS.x },
		{ icon: ASSETS.discord, href: REDIRECTS.discord },
		{ icon: ASSETS.github, href: REDIRECTS.github },
	];

	return (
		<S.Wrapper className={'max-view-wrapper'}>
			<S.Container>
				<S.Content>{`${language.app} ${new Date().getFullYear()}`}</S.Content>
				<S.EWrapper>
					{socialPaths.map((path, index) => (
						<a key={index} target={'_blank'} rel={'noreferrer'} href={path.href}>
							<ReactSVG src={path.icon} />
						</a>
					))}
					<Link to={URLS.docs}>
						<ReactSVG src={ASSETS.docs} />
					</Link>
				</S.EWrapper>
			</S.Container>
		</S.Wrapper>
	);
}
