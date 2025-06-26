import { Link } from 'react-router-dom';
import { ReactSVG } from 'react-svg';

import { usePortalProvider } from 'viewer/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
import { ASSETS, URLS } from 'helpers/config';
import { getTxEndpoint } from 'helpers/endpoints';
import { PortalCategoryType, PortalLinkType } from 'helpers/types';
import { checkValidAddress } from 'helpers/utils';

import * as S from './styles';

export default function Footer() {
	const portalProvider = usePortalProvider();

	function getLogo() {
		const logo = portalProvider.current?.logo;
		if (logo && checkValidAddress(logo)) {
			return <img src={getTxEndpoint(logo)} />;
		}
		return <ReactSVG src={ASSETS.portal} />;
	}
	return (
		<S.Wrapper>
			<S.Content className={'max-view-wrapper'}>
				<S.Header>
					<S.LogoWrapper className={'fade-in'}>
						<Link to={URLS.base}>{getLogo()}</Link>
					</S.LogoWrapper>
					<Button type={'alt1'} label={'Log in'} handlePress={() => {}} />
				</S.Header>
				{portalProvider.current?.categories && (
					<S.CategoriesWrapper>
						{portalProvider.current.categories.map((category: PortalCategoryType) => {
							return <Link key={category.id} to={category.id}>{category.name}</Link>;
						})}
					</S.CategoriesWrapper>
				)}
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
