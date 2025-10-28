import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
import { ICONS, URLS } from 'helpers/config';
import { displayUrlName, resolvePrimaryDomain, urlify } from 'helpers/utils';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';

export default function PageList() {
	const navigate = useNavigate();

	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const defaultOrder = ['home', 'feed', 'post', 'user'];

	const mainPages: any = Object.fromEntries(
		Object.entries(portalProvider?.current?.pages || {})
			.filter(([key, page]: any) => defaultOrder.includes(key) || page.type !== 'static')
			.sort(([a], [b]) => {
				const aIndex = defaultOrder.indexOf(a);
				const bIndex = defaultOrder.indexOf(b);
				if (aIndex === -1 && bIndex === -1) return 0;
				if (aIndex === -1) return 1;
				if (bIndex === -1) return -1;
				return aIndex - bIndex;
			})
	);

	const staticPages: any = Object.fromEntries(
		Object.entries(portalProvider?.current?.pages || {})
			.filter(([key, page]: any) => page.type === 'static' && !defaultOrder.includes(key))
			.sort(([a, b]: any) => a.localeCompare(b))
	);

	const unauthorized = !portalProvider.permissions?.updatePortalMeta;

	function renderPageList(pages: any) {
		if (Object.entries(pages).length === 0) {
			return (
				<S.WrapperEmpty className={'border-wrapper-alt2'}>
					<p>{language?.noPagesFound}</p>
				</S.WrapperEmpty>
			);
		}

		return (
			<S.PagesWrapper className={'border-wrapper-alt2'}>
				{Object.entries(pages).map(([key], index) => {
					const redirectBase = pages[key].type === 'static' ? URLS.pageEditInfo : URLS.pageEditMain;
					const redirectId = pages[key].type === 'static' ? pages[key].id : key;

					return (
						<Link
							key={index}
							to={`${resolvePrimaryDomain(portalProvider.current?.domains, portalProvider.current?.id)}/#/${urlify(
								key
							)}`}
							target={'_blank'}
						>
							<S.PageWrapper className={'fade-in'}>
								<S.PageHeader>
									<p>{displayUrlName(key)}</p>
								</S.PageHeader>
								<S.PageDetail>
									<S.PageActions>
										<Button
											type={'alt3'}
											label={language?.edit}
											handlePress={(e: any) => {
												e.preventDefault();
												e.stopPropagation();
												navigate(`${redirectBase(portalProvider.current.id)}/${redirectId}`);
											}}
										/>
									</S.PageActions>
								</S.PageDetail>
							</S.PageWrapper>
						</Link>
					);
				})}
			</S.PagesWrapper>
		);
	}

	const pages = React.useMemo(() => {
		if (!portalProvider.current?.pages) {
			return (
				<S.LoadingWrapper className={'border-wrapper-alt2'}>
					<p>{`${language?.gettingPages}...`}</p>
				</S.LoadingWrapper>
			);
		} else if (portalProvider.current?.pages.length === 0) {
			return (
				<S.WrapperEmpty className={'border-wrapper-alt2'}>
					<p>{language?.noPagesFound}</p>
				</S.WrapperEmpty>
			);
		}

		return portalProvider.current?.id ? (
			<S.Wrapper>
				{renderPageList(mainPages)}
				<S.InfoPagesWrapper>
					<S.InfoPagesHeader>
						<h6>{language.infoPages}</h6>
						<Button
							type={'alt3'}
							label={language?.createPageInfo}
							handlePress={() => navigate(URLS.pageCreateInfo(portalProvider.current.id))}
							disabled={unauthorized || !portalProvider.current}
							icon={ICONS.add}
							iconLeftAlign
						/>
					</S.InfoPagesHeader>
					{renderPageList(staticPages)}
				</S.InfoPagesWrapper>
			</S.Wrapper>
		) : null;
	}, [portalProvider.current?.id, portalProvider.current?.pages, languageProvider.current]);

	return pages;
}
