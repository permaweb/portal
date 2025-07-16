import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ReactSVG } from 'react-svg';

import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
import { ASSETS, URLS } from 'helpers/config';
import { getTxEndpoint } from 'helpers/endpoints';
import { PortalPageType } from 'helpers/types';
import { urlify } from 'helpers/utils';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';

export default function PageList() {
	const navigate = useNavigate();

	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

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
				{portalProvider.current.pages.map((page: PortalPageType) => {
					return (
						<S.PageWrapper key={page.id} className={'fade-in'}>
							<S.PageHeader>
								<Link to={`${getTxEndpoint(portalProvider.current.id)}/#/${urlify(page.name)}`} target={'_blank'}>
									<p>{page.name}</p>
									<ReactSVG src={ASSETS.newTab} />
								</Link>
							</S.PageHeader>
							<S.PageDetail>
								<S.PageActions>
									<Button
										type={'alt3'}
										label={language?.edit}
										handlePress={() => navigate(`${URLS.pageEdit(portalProvider.current.id)}${page.id}`)}
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
