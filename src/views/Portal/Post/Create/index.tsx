import React from 'react';
import { Link } from 'react-router-dom';
import { ReactSVG } from 'react-svg';

import { Loader } from 'components/atoms/Loader';
import { ASSETS, URLS } from 'helpers/config';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePortalProvider } from 'providers/PortalProvider';

import * as S from './styles';

export default function Create() {
	const portalProvider = usePortalProvider();

	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const options = React.useMemo(() => {
		if (portalProvider.current?.id) {
			return [
				{ url: URLS.postCreateArticle(portalProvider.current.id), label: language.article, icon: ASSETS.article },
				{ url: URLS.postCreateVideo(portalProvider.current.id), label: language.video, icon: ASSETS.video },
				{ url: URLS.postCreateImage(portalProvider.current.id), label: language.image, icon: ASSETS.image },
			];
		}
		return null;
	}, [portalProvider.current?.id]);

	return (
		<S.Wrapper className={'fade-in'}>
			<S.HeaderWrapper>
				<h4>{language.postCreateHeader}</h4>
			</S.HeaderWrapper>
			<S.BodyWrapper>
				<S.Description>
					<S.Icon>
						<ReactSVG src={ASSETS.post} />
					</S.Icon>
					<p>{language.postCreateSubheader}</p>
					<span>{language.postCreateDescription}</span>
				</S.Description>
				<S.PostOptions>
					{options && options.length > 0 ? (
						<>
							{options.map((option: any, index: number) => {
								return (
									<Link key={index} to={option.url}>
										<ReactSVG src={option.icon} />
										{option.label}
									</Link>
								);
							})}
						</>
					) : (
						<Loader sm relative />
					)}
				</S.PostOptions>
			</S.BodyWrapper>
		</S.Wrapper>
	);
}
