import { Link } from 'react-router-dom';
import { ReactSVG } from 'react-svg';

import { usePortalProvider } from 'viewer/providers/PortalProvider';

import { ASSETS, URLS } from 'helpers/config';
import { getTxEndpoint } from 'helpers/endpoints';
import { PortalCategoryType, PortalLinkType, PortalPageType } from 'helpers/types';
import { checkValidAddress, getRedirect, urlify } from 'helpers/utils';

import * as S from './styles';

export default function Footer() {
	const portalProvider = usePortalProvider();

	function getLogo() {
		const logo = portalProvider.current?.logo;
		if (logo && checkValidAddress(logo)) {
			return <img src={getTxEndpoint(logo)} />;
		}
		return <h4>{portalProvider.current?.name ?? '-'}</h4>;
	}

	return (
		<S.Wrapper>
			<S.Content className={'max-view-wrapper'}>
				<S.Header>
					<S.LogoWrapper className={'fade-in'}>
						<Link to={getRedirect()}>{getLogo()}</Link>
					</S.LogoWrapper>
					{portalProvider.current?.links?.length > 0 && (
						<S.LinksWrapper>
							{portalProvider.current.links.map((link: PortalLinkType, index: number) => {
								return (
									<S.LinkWrapper key={index}>
										<Link to={link.url} target={'_href'}>
											<ReactSVG src={link.icon ? getTxEndpoint(link.icon) : ASSETS.link} />
											<S.LinkTooltip className={'info'}>
												<span>{link.title}</span>
											</S.LinkTooltip>
										</Link>
									</S.LinkWrapper>
								);
							})}
						</S.LinksWrapper>
					)}
				</S.Header>
				{(portalProvider.current?.categories?.length > 0 || portalProvider.current?.pages?.length > 0) && (
					<S.NavigationWrapper>
						{portalProvider.current?.categories?.length > 0 && (
							<S.CategoriesWrapper>
								{portalProvider.current.categories.map((category: PortalCategoryType) => {
									return (
										<Link key={category.id} to={getRedirect(URLS.category(category.id))}>
											{category.name}
										</Link>
									);
								})}
							</S.CategoriesWrapper>
						)}
						{portalProvider.current?.pages?.length > 0 && (
							<S.PageLinksWrapper>
								{portalProvider.current.pages.map((page: PortalPageType) => {
									return (
										<Link key={page.id} to={getRedirect(urlify(page.name))}>
											{page.name}
										</Link>
									);
								})}
							</S.PageLinksWrapper>
						)}
					</S.NavigationWrapper>
				)}
				<S.FooterEndWrapper>
					<S.NameWrapper>
						<p>
							{portalProvider.current.name ?? '-'} {new Date().getFullYear()}
						</p>
					</S.NameWrapper>
				</S.FooterEndWrapper>
			</S.Content>
		</S.Wrapper>
	);
}
