import React from 'react';
import { ReactSVG } from 'react-svg';
import { NavLink } from 'react-router-dom';
import { getRedirect } from 'helpers/utils';
import { ICONS_UI } from 'helpers/config';
import { usePortalProvider } from 'engine/providers/portalProvider';
import { initThemes } from 'engine/helpers/themes';
import { defaultThemes } from 'engine/defaults/theme.defaults';
import { defaultLayout } from 'engine/defaults/layout.defaults';
import { GlobalStyles } from '../../../global-styles';

import Search from './search';
import * as S from './styles';

export default function Navigation(props: any) {
	const { preview, layout, content } = props;
	const { portal } = usePortalProvider();
	const Layout = preview ? defaultLayout : portal?.Layout;
	const Themes = preview ? defaultThemes : portal?.Themes;

	React.useEffect(() => {
		if (preview) {
			initThemes(Themes, Layout);
			document.getElementById('preview')?.setAttribute('data-theme', 'dark');
		}
	}, [preview]);

	const NavigationEntry = ({ index, entry }: any) => {
		const [showMenu, setShowMenu] = React.useState(false);

		return (
			<>
				{preview && <GlobalStyles />}
				<S.NavigationEntry
					id="entry"
					onPointerEnter={() => (entry.children && entry.children.length > 0 ? setShowMenu(true) : {})}
					onPointerLeave={() => setShowMenu(false)}
				>
					<NavLink to={getRedirect(`feed/category/${entry.id}`)}>
						{entry.icon && (
							<S.Icon>
								<ReactSVG src={`/img/icons/${entry.Icon}.svg`} />
							</S.Icon>
						)}
						{entry.name}
						{entry.children && entry.children.length > 0 && (
							<S.Arrow>
								<ReactSVG src={ICONS_UI.ARROW} />
							</S.Arrow>
						)}
					</NavLink>
					{showMenu && (
						<S.NavigationEntryMenu $layout={layout}>
							{entry.children.map((entry: any, key: any) => {
								return (
									<NavLink to={getRedirect(`feed/category/${entry.id}`)} key={key}>
										<S.NavigationSubEntry>{entry.name}</S.NavigationSubEntry>
									</NavLink>
								);
							})}
						</S.NavigationEntryMenu>
					)}
				</S.NavigationEntry>
			</>
		);
	};

	return (
		layout && (
			<S.Navigation $layout={layout} maxWidth={Layout?.basics?.maxWidth} id="Navigation">
				<S.NavigationEntries $layout={layout} maxWidth={Layout?.basics?.maxWidth}>
					{content &&
						Object.entries(content).map(([key, entry]) => <NavigationEntry key={key} index={key} entry={entry} />)}
					<Search />
				</S.NavigationEntries>
			</S.Navigation>
		)
	);
}
