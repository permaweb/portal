import React from 'react';
import { ReactSVG } from 'react-svg';

import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
import { Loader } from 'components/atoms/Loader';
import { ICONS, LAYOUT, PAGES } from 'helpers/config';
import { PortalPatchMapEnum } from 'helpers/types';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { useNotifications } from 'providers/NotificationProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';

import * as S from './styles';

export default function Layout() {
	const arProvider = useArweaveProvider();
	const permawebProvider = usePermawebProvider();
	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];
	const { addNotification } = useNotifications();

	const [layout, setLayout] = React.useState(portalProvider.current?.layout || LAYOUT.JOURNAL);
	const [pages, setPages] = React.useState<any>(portalProvider.current?.pages || PAGES.JOURNAL);
	const [originalLayout] = React.useState(portalProvider.current?.layout || LAYOUT.JOURNAL);
	const [originalPages] = React.useState(portalProvider.current?.pages || PAGES.JOURNAL);
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
		return layoutChanged || pagesChanged;
	}, [originalLayout, layout, originalPages, pages]);

	// Update local state when portal data changes
	React.useEffect(() => {
		if (portalProvider.current?.layout) {
			setLayout(portalProvider.current.layout);
		}
		if (portalProvider.current?.pages) {
			setPages(portalProvider.current.pages);
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
			setPages(PAGES.BLOG);
		} else if (optionName === 'journal') {
			setLayout(LAYOUT.JOURNAL);
			setPages(PAGES.JOURNAL);
		} else if (optionName === 'documentation') {
			setLayout(LAYOUT.DOCUMENTATION);
			setPages(PAGES.BLOG);
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

			// Only update Layout and Pages - exclude Themes and Fonts
			if (JSON.stringify(originalLayout) !== JSON.stringify(layout)) {
				updateData.Layout = permawebProvider.libs.mapToProcessCase(layout);
			}
			if (JSON.stringify(originalPages) !== JSON.stringify(pages)) {
				updateData.Pages = permawebProvider.libs.mapToProcessCase(pages);
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

			console.log(`Layout/Pages update: ${layoutUpdateId}`);
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
