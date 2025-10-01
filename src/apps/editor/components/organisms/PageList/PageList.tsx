import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ReactSVG } from 'react-svg';

import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
import { ICONS, URLS } from 'helpers/config';
import { getTxEndpoint } from 'helpers/endpoints';
import { urlify } from 'helpers/utils';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';

export default function PageList() {
	const navigate = useNavigate();

	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const order = ['home', 'post', 'feed'];
	const sortedPages = Object.fromEntries([
		...order.map((k) => [k, portalProvider?.current?.pages[k]]).filter(([_, v]) => v !== undefined),
		...Object.entries(portalProvider?.current?.pages || {}).filter(([k]) => !order.includes(k)),
	]);

	const pages = React.useMemo(() => {
		if (!portalProvider.current?.pages) {
			return (
				<S.LoadingWrapper>
					<p>{`${language?.gettingPages}...`}</p>
				</S.LoadingWrapper>
			);
		} else if (portalProvider.current?.pages.length === 0) {
			return (
				<S.WrapperEmpty>
					<p>{language?.noPagesFound}</p>
				</S.WrapperEmpty>
			);
		}

		return portalProvider.current?.id ? (
			<S.Wrapper>
				{Object.entries(sortedPages).map(([key], index) => {
					return (
						<S.PageWrapper key={index} className={'fade-in'}>
							<S.PageHeader>
								<Link to={`${getTxEndpoint(portalProvider.current.id)}/#/${urlify(key)}`} target={'_blank'}>
									<p>{key.charAt(0).toUpperCase() + key.slice(1)}</p>
									<ReactSVG src={ICONS.newTab} />
								</Link>
							</S.PageHeader>
							<S.PageDetail>
								<S.PageActions>
									<Button
										type={'alt3'}
										label={language?.edit}
										handlePress={() => navigate(`${URLS.pageEdit(portalProvider.current.id)}${key}`)}
									/>
								</S.PageActions>
							</S.PageDetail>
						</S.PageWrapper>
					);
				})}
			</S.Wrapper>
		) : null;
	}, [portalProvider, portalProvider.current?.id, portalProvider.current?.domains, languageProvider.current]);

	return pages;
}
