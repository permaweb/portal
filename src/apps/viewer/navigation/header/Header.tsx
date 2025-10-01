import React from 'react';
import { Link } from 'react-router-dom';
import { ReactSVG } from 'react-svg';

import { usePortalProvider } from 'viewer/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
import { ICONS, STYLING, URLS } from 'helpers/config';
import { getTxEndpoint } from 'helpers/endpoints';
import { PortalCategoryType, PortalLinkType } from 'helpers/types';
import { checkValidAddress, getRedirect } from 'helpers/utils';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { WalletConnect } from 'wallet/WalletConnect';
import { CloseHandler } from 'wrappers/CloseHandler';

import * as S from './styles';

function Category(props: { category: PortalCategoryType }) {
	const hasChildren = props.category.children?.length > 0;

	return (
		<S.CategoryWrapper>
			<S.CategoryLink>
				<Link to={getRedirect(URLS.category(props.category.id))}>
					{props.category.name} {hasChildren && <ReactSVG src={ICONS.arrow} />}
				</Link>
			</S.CategoryLink>
			{props.category.children?.length > 0 && (
				<S.SubMenu className={'border-wrapper-alt3 fade-in'}>
					{props.category.children.map((child) => (
						<Category key={child.id} category={child} />
					))}
				</S.SubMenu>
			)}
		</S.CategoryWrapper>
	);
}

export default function Header() {
	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [showOverflowCategories, setShowOverflowCategories] = React.useState<boolean>(false);

	function getLogo() {
		const logo = portalProvider.current?.logo;
		if (logo && checkValidAddress(logo)) {
			return <img src={getTxEndpoint(logo)} />;
		}
		return <h4>{portalProvider.current?.name ?? '-'}</h4>;
	}

	function getNavigation() {
		const overflowCount = 7;

		const hasOverflow = portalProvider.current.categories.length > overflowCount;

		const initCategories = hasOverflow
			? [...portalProvider.current.categories.slice(0, overflowCount)]
			: [...portalProvider.current.categories];

		let overflowCategories: PortalCategoryType[] | null = null;
		if (hasOverflow) overflowCategories = [...portalProvider.current.categories.slice(overflowCount)];

		return (
			<S.NavigationWrapper>
				<S.NavigationContent className={'max-view-wrapper'}>
					<S.NavigationLinks
						direction={portalProvider.current?.layout?.header?.subheader?.categories?.direction ?? 'left'}
					>
						{initCategories.map((category: PortalCategoryType) => {
							return <Category key={category.id} category={category} />;
						})}
						{hasOverflow && (
							<S.OverflowWrapper>
								<CloseHandler active={true} disabled={false} callback={() => setShowOverflowCategories(false)}>
									<Button
										type={'alt3'}
										label={language?.more}
										handlePress={() => setShowOverflowCategories((prev) => !prev)}
										icon={ICONS.arrow}
										height={30}
									/>
									{showOverflowCategories && overflowCategories && (
										<S.OverflowContent className={'border-wrapper-alt3 fade-in'}>
											{overflowCategories.map((category: PortalCategoryType) => {
												return <Category key={category.id} category={category} />;
											})}
										</S.OverflowContent>
									)}
								</CloseHandler>
							</S.OverflowWrapper>
						)}
					</S.NavigationLinks>
					{/* <S.IconWrapper>{getIcon()}</S.IconWrapper> */}
				</S.NavigationContent>
			</S.NavigationWrapper>
		);
	}

	function getLinks() {
		return (
			<S.LinksWrapper>
				{portalProvider.current.links.map((link: PortalLinkType, index: number) => {
					return (
						<S.LinkWrapper key={index}>
							<Link to={link.url} target={'_href'}>
								<ReactSVG src={link.icon ? getTxEndpoint(link.icon) : ICONS.link} />
								<S.LinkTooltip className={'info'}>
									<span>{link.title}</span>
								</S.LinkTooltip>
							</Link>
						</S.LinkWrapper>
					);
				})}
			</S.LinksWrapper>
		);
	}

	return (
		<>
			<S.Wrapper>
				<S.WrapperContent
					className={'max-view-wrapper'}
					height={portalProvider.current?.layout?.header?.height ?? STYLING.dimensions.nav.height}
				>
					{/* <S.ContentStart>
					{portalProvider.updating && (
						<S.PortalUpdateWrapper>
							<span>{`${language?.updating}...`}</span>
						</S.PortalUpdateWrapper>
					)}
				</S.ContentStart> */}
					<S.LogoWrapper
						className={'fade-in'}
						direction={portalProvider.current?.layout?.header?.logo?.direction ?? 'left'}
					>
						<Link to={getRedirect()}>{getLogo()}</Link>
					</S.LogoWrapper>
					<S.ContentEnd linkDirection={portalProvider.current?.layout?.header?.socials?.direction ?? 'left'}>
						<WalletConnect app={'viewer'} />
						{portalProvider.current?.links?.length > 0 && portalProvider.current?.layout?.header?.socials && getLinks()}
					</S.ContentEnd>
				</S.WrapperContent>
			</S.Wrapper>
			{portalProvider.current?.categories?.length > 0 && getNavigation()}
		</>
	);
}
