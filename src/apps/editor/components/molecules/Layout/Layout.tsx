import React from 'react';
import { ReactSVG } from 'react-svg';

import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
import { Loader } from 'components/atoms/Loader';
import { ICONS, LAYOUT } from 'helpers/config';
import { THEME_DOCUMENTATION_PATCH } from 'helpers/config/themes';
import { PortalPatchMapEnum } from 'helpers/types';
import { debugLog } from 'helpers/utils';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { useNotifications } from 'providers/NotificationProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';

import * as S from './styles';

function deepMerge(target: any, patch: any): any {
	if (!target) return patch;
	const result = { ...target };
	for (const key of Object.keys(patch)) {
		if (
			patch[key] &&
			typeof patch[key] === 'object' &&
			!Array.isArray(patch[key]) &&
			target[key] &&
			typeof target[key] === 'object'
		) {
			result[key] = deepMerge(target[key], patch[key]);
		} else {
			result[key] = patch[key];
		}
	}
	return result;
}

export default function Layout() {
	const arProvider = useArweaveProvider();
	const permawebProvider = usePermawebProvider();
	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];
	const { addNotification } = useNotifications();

	const [layout, setLayout] = React.useState(portalProvider.current?.layout || LAYOUT.JOURNAL);
	const [pages, setPages] = React.useState<any>(portalProvider.current?.pages);
	const [themes, setThemes] = React.useState<any>(portalProvider.current?.themes);
	const [originalLayout] = React.useState(portalProvider.current?.layout || LAYOUT.JOURNAL);
	const [originalPages] = React.useState(portalProvider.current?.pages);
	const [originalThemes] = React.useState(portalProvider.current?.themes);
	const [loading, setLoading] = React.useState<boolean>(false);

	const unauthorized = !portalProvider.permissions?.updatePortalMeta;

	const options = [
		{ name: 'journal', icon: ICONS.layoutJournal },
		{ name: 'blog', icon: ICONS.layoutBlog },
		{ name: 'documentation', icon: ICONS.layoutDocumentation },
	];

	const [activeName, setActiveName] = React.useState<string>('');

	// Check if there are changes
	const hasChanges = React.useMemo(() => {
		const layoutChanged = JSON.stringify(originalLayout) !== JSON.stringify(layout);
		const pagesChanged = JSON.stringify(originalPages) !== JSON.stringify(pages);
		const themesChanged = JSON.stringify(originalThemes) !== JSON.stringify(themes);
		return layoutChanged || pagesChanged || themesChanged;
	}, [originalLayout, layout, originalPages, pages, originalThemes, themes]);

	// Update local state when portal data changes
	React.useEffect(() => {
		if (portalProvider.current?.layout) {
			setLayout(portalProvider.current.layout);
		}
		if (portalProvider.current?.pages) {
			setPages(portalProvider.current.pages);
		}
		if (portalProvider.current?.themes) {
			setThemes(portalProvider.current.themes);
		}
	}, [portalProvider.current]);

	React.useEffect(() => {
		if (portalProvider.current) {
			const currentLayout = portalProvider.current?.layout as any;
			const currentPages = portalProvider.current?.pages as any;
			const navPosition = currentLayout?.navigation?.layout?.position;

			const hasPostSpotlight = currentPages?.home?.content?.some((row: any) =>
				row.content?.some((item: any) => item.type === 'postSpotlight')
			);
			const hasCategorySpotlight = currentPages?.home?.content?.some((row: any) =>
				row.content?.some((item: any) => item.type === 'categorySpotlight')
			);

			if (navPosition === 'left' || navPosition === 'right') {
				setActiveName('documentation');
			} else if (hasPostSpotlight && hasCategorySpotlight) {
				setActiveName('blog');
			} else if (JSON.stringify(currentLayout) === JSON.stringify(LAYOUT.JOURNAL)) {
				setActiveName('journal');
			} else {
				setActiveName(currentPages?.feed?.content?.[0]?.content?.[0]?.layout || 'journal');
			}
		}
	}, [portalProvider.current]);

	function handleLayoutOptionChange(optionName: string) {
		if (optionName === 'blog') {
			setLayout(LAYOUT.BLOG);
		} else if (optionName === 'journal') {
			setLayout(LAYOUT.JOURNAL);
		} else if (optionName === 'documentation') {
			setLayout(LAYOUT.DOCUMENTATION);
			if (themes && Array.isArray(themes)) {
				const updatedThemes = themes.map((theme: any) =>
					theme.active ? deepMerge(theme, THEME_DOCUMENTATION_PATCH) : theme
				);
				setThemes(updatedThemes);
			}
		} else {
			const layoutValue = optionName.toLowerCase();
			const updatedPages = {
				...pages,
				Feed: {
					...pages.feed,
					content: [
						{
							...pages.feed.content[0],
							content: [
								{
									...pages.feed.content[0].content[0],
									layout: layoutValue,
								},
							],
						},
					],
				},
			};
			setPages(updatedPages);
		}
		setActiveName(optionName);
	}

	async function handleSave() {
		if (!arProvider.wallet || !portalProvider.current?.id || unauthorized) {
			return;
		}

		try {
			setLoading(true);

			const updateData: any = {};

			if (JSON.stringify(originalLayout) !== JSON.stringify(layout)) {
				updateData.Layout = permawebProvider.libs.mapToProcessCase(layout);
			}
			if (JSON.stringify(originalPages) !== JSON.stringify(pages)) {
				updateData.Pages = permawebProvider.libs.mapToProcessCase(pages);
			}
			if (JSON.stringify(originalThemes) !== JSON.stringify(themes)) {
				updateData.Themes = permawebProvider.libs.mapToProcessCase(themes);
			}

			if (Object.keys(updateData).length === 0) {
				addNotification('No changes to save', 'warning');
				return;
			}

			const layoutUpdateId = await permawebProvider.libs.updateZone(
				updateData,
				portalProvider.current.id,
				arProvider.wallet
			);

			portalProvider.refreshCurrentPortal(PortalPatchMapEnum.Presentation);

			debugLog('info', 'Layout', 'Layout/Pages update:', layoutUpdateId);
			addNotification(`${language?.layoutUpdated || 'Layout Updated'}!`, 'success');
		} catch (e: any) {
			addNotification(e.message ?? 'Error updating layout', 'warning');
		} finally {
			setLoading(false);
		}
	}

	return (
		<>
			{loading && <Loader message={`${language.updatingLayout}...`} />}
			<S.Wrapper>
				<S.OptionsWrapper>
					{options.map((option) => {
						const active = option.name === activeName;

						return (
							<S.Option
								key={option.name}
								disabled={unauthorized}
								$active={active}
								onClick={() => (active ? {} : handleLayoutOptionChange(option.name))}
							>
								<S.OptionIcon $active={active}>
									<img src={option.icon} alt={option.name} />
								</S.OptionIcon>
								<S.OptionLabel>{option.name}</S.OptionLabel>
							</S.Option>
						);
					})}
				</S.OptionsWrapper>

				<S.EndActions>
					<Button
						type={'alt1'}
						label={language?.save || 'Save'}
						handlePress={handleSave}
						loading={loading}
						disabled={loading || !hasChanges || unauthorized}
					/>
				</S.EndActions>
			</S.Wrapper>
		</>
	);
}
