import React from 'react';
import { ReactSVG } from 'react-svg';

import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
import { Loader } from 'components/atoms/Loader';
import { ICONS, LAYOUT } from 'helpers/config';
import { THEME_DEFAULT, THEME_DOCUMENTATION_PATCH } from 'helpers/config/themes';
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

const LAYOUT_THEME_PATCHES: Record<string, any> = {
	documentation: THEME_DOCUMENTATION_PATCH,
};

function getNestedValue(obj: any, path: string[]): any {
	return path.reduce((acc, key) => acc?.[key], obj);
}

function setNestedValue(obj: any, path: string[], value: any): any {
	if (path.length === 0) return value;
	const [first, ...rest] = path;
	return {
		...obj,
		[first]: rest.length === 0 ? value : setNestedValue(obj?.[first] || {}, rest, value),
	};
}

function getPatchPaths(patch: any, prefix: string[] = []): string[][] {
	const paths: string[][] = [];
	for (const key of Object.keys(patch)) {
		const currentPath = [...prefix, key];
		if (patch[key] && typeof patch[key] === 'object' && !Array.isArray(patch[key])) {
			paths.push(...getPatchPaths(patch[key], currentPath));
		} else {
			paths.push(currentPath);
		}
	}
	return paths;
}

function applyLayoutPatch(theme: any, layoutName: string): any {
	const patch = LAYOUT_THEME_PATCHES[layoutName];
	if (!patch) return theme;

	const paths = getPatchPaths(patch);
	const original: any = {};
	for (const path of paths) {
		const currentValue = getNestedValue(theme, path);
		if (currentValue !== undefined) {
			original[path.join('.')] = currentValue;
		}
	}

	const patched = deepMerge(theme, patch);
	patched._layoutPatch = { layout: layoutName, original };
	return patched;
}

function hasLegacyPatchColors(theme: any): string | null {
	for (const [layoutName, patch] of Object.entries(LAYOUT_THEME_PATCHES)) {
		const paths = getPatchPaths(patch);
		for (const path of paths) {
			const themeValue = getNestedValue(theme, path);
			const patchValue = getNestedValue(patch, path);
			if (themeValue === patchValue) {
				return layoutName;
			}
		}
	}
	return null;
}

function resetLayoutPatch(theme: any): any {
	if (theme._layoutPatch) {
		const { original } = theme._layoutPatch;
		let result = { ...theme };

		for (const [pathStr, value] of Object.entries(original)) {
			const path = pathStr.split('.');
			result = setNestedValue(result, path, value);
		}

		delete result._layoutPatch;
		return result;
	}

	const legacyLayout = hasLegacyPatchColors(theme);
	if (legacyLayout) {
		const patch = LAYOUT_THEME_PATCHES[legacyLayout];
		const paths = getPatchPaths(patch);
		let result = { ...theme };

		for (const path of paths) {
			const defaultValue = getNestedValue(THEME_DEFAULT, path);
			if (defaultValue !== undefined) {
				result = setNestedValue(result, path, defaultValue);
			}
		}

		return result;
	}

	return theme;
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
	const [originalLayout, setOriginalLayout] = React.useState(portalProvider.current?.layout);
	const originalLayoutSet = React.useRef(false);
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
	const hasUserSelected = React.useRef(false);

	// Check if there are changes
	const hasChanges = React.useMemo(() => {
		const layoutChanged = JSON.stringify(originalLayout) !== JSON.stringify(layout);
		const pagesChanged = JSON.stringify(originalPages) !== JSON.stringify(pages);
		const themesChanged = JSON.stringify(originalThemes) !== JSON.stringify(themes);
		return layoutChanged || pagesChanged || themesChanged;
	}, [originalLayout, layout, originalPages, pages, originalThemes, themes]);

	// Update local state when portal data changes (only if user hasn't made a selection)
	React.useEffect(() => {
		if (portalProvider.current?.layout && !originalLayoutSet.current) {
			setOriginalLayout(portalProvider.current.layout);
			originalLayoutSet.current = true;
		}
		if (hasUserSelected.current) return;
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
		if (portalProvider.current && !hasUserSelected.current) {
			const currentLayout = portalProvider.current?.layout as any;
			const navPosition = currentLayout?.navigation?.layout?.position;
			const headerHeight = currentLayout?.header?.layout?.height;

			if (navPosition === 'left' || navPosition === 'right') {
				setActiveName('documentation');
			} else if (headerHeight === '120px') {
				setActiveName('blog');
			} else if (headerHeight === '100px') {
				setActiveName('journal');
			} else {
				setActiveName('journal');
			}
		}
	}, [portalProvider.current]);

	function handleLayoutOptionChange(optionName: string) {
		hasUserSelected.current = true;
		if (themes && Array.isArray(themes)) {
			const updatedThemes = themes.map((theme: any) => {
				if (!theme.active) return theme;
				let updated = resetLayoutPatch(theme);
				if (LAYOUT_THEME_PATCHES[optionName]) {
					updated = applyLayoutPatch(updated, optionName);
				}
				return updated;
			});
			setThemes(updatedThemes);
		}

		if (optionName === 'blog') {
			setLayout(LAYOUT.BLOG);
		} else if (optionName === 'journal') {
			setLayout(LAYOUT.JOURNAL);
		} else if (optionName === 'documentation') {
			setLayout(LAYOUT.DOCUMENTATION);
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
