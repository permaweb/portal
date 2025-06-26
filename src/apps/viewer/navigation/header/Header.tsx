import { Link } from 'react-router-dom';
import { ReactSVG } from 'react-svg';

import { usePortalProvider } from 'viewer/providers/PortalProvider';

import { ASSETS, URLS } from 'helpers/config';
import { getTxEndpoint } from 'helpers/endpoints';
import { PortalCategoryType } from 'helpers/types';
import { checkValidAddress } from 'helpers/utils';

import * as S from './styles';

function Category(props: { category: PortalCategoryType }) {
	const hasChildren = props.category.children?.length > 0;

	return (
		<S.CategoryWrapper>
			<S.CategoryLink>
				<Link to={'#'}>{props.category.name} {hasChildren && <ReactSVG src={ASSETS.arrow} />}</Link>
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

	console.log(portalProvider.current);

	function getLogo() {
		const logo = portalProvider.current?.logo;
		if (logo && checkValidAddress(logo)) {
			return <img src={getTxEndpoint(logo)} />;
		}
		return <ReactSVG src={ASSETS.portal} />;
	}

	return (
		<S.Wrapper>
			<S.WrapperContent className={'max-view-wrapper'} height={85}>
				<S.LogoWrapper className={'fade-in'}>
					<Link to={URLS.base}>{getLogo()}</Link>
				</S.LogoWrapper>
			</S.WrapperContent>
			{portalProvider.current?.categories && (
				<S.NavigationWrapper>
				<S.NavigationContent className={'max-view-wrapper'}>
					{portalProvider.current.categories.map((category: PortalCategoryType) => {
						return <Category key={category.id} category={category} />;
					})}
				</S.NavigationContent>
				</S.NavigationWrapper>
			)}
		</S.Wrapper>
	);
}
