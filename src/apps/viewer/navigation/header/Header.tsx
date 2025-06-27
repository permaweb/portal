import React from 'react';
import { Link } from 'react-router-dom';
import { ReactSVG } from 'react-svg';

import { usePortalProvider } from 'viewer/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
import { ASSETS, URLS } from 'helpers/config';
import { getTxEndpoint } from 'helpers/endpoints';
import { PortalCategoryType } from 'helpers/types';
import { checkValidAddress } from 'helpers/utils';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { CloseHandler } from 'wrappers/CloseHandler';

import * as S from './styles';

function Category(props: { category: PortalCategoryType }) {
	const hasChildren = props.category.children?.length > 0;

	return (
		<S.CategoryWrapper>
			<S.CategoryLink>
				<Link to={'#'}>
					{props.category.name} {hasChildren && <ReactSVG src={ASSETS.arrow} />}
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
		return <ReactSVG src={ASSETS.portal} />;
	}

	function getCategories() {
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
					{initCategories.map((category: PortalCategoryType) => {
						return <Category key={category.id} category={category} />;
					})}
					{hasOverflow && (
						<S.OverflowWrapper>
							<CloseHandler active={true} disabled={false} callback={() => setShowOverflowCategories(false)}>
								<Button
									type={'alt3'}
									label={'More'}
									handlePress={() => setShowOverflowCategories((prev) => !prev)}
									icon={ASSETS.arrow}
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
				</S.NavigationContent>
			</S.NavigationWrapper>
		);
	}

	return (
		<S.Wrapper>
			<S.WrapperContent className={'max-view-wrapper'} height={85}>
				<S.ContentStart>
					{portalProvider.updating && (
						<S.PortalUpdateWrapper>
							<span>{`${language.updating}...`}</span>
						</S.PortalUpdateWrapper>
					)}
				</S.ContentStart>
				<S.LogoWrapper className={'fade-in'}>
					<Link to={URLS.base}>{getLogo()}</Link>
				</S.LogoWrapper>
				<S.ContentEnd>

				</S.ContentEnd>
			</S.WrapperContent>
			{portalProvider.current?.categories && getCategories()}
		</S.Wrapper>
	);
}
