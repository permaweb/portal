import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ReactSVG } from 'react-svg';

import PageRow from 'editor/components/molecules/PageRow/PageRow';
import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
import { Loader } from 'components/atoms/Loader';
import { ICONS, PAGES, URLS } from 'helpers/config';
import { PortalPatchMapEnum } from 'helpers/types';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { useNotifications } from 'providers/NotificationProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';

import * as S from './styles';

export default function PageList() {
	const navigate = useNavigate();

	const arProvider = useArweaveProvider();
	const permawebProvider = usePermawebProvider();
	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];
	const { addNotification } = useNotifications();

	const [loading, setLoading] = React.useState<boolean>(false);
	const [collapsedPages, setCollapsedPages] = React.useState<{ [key: string]: boolean }>({
		home: true,
		feed: true,
		post: true,
		user: true,
		search: true,
	});

	const templateConfig = {
		home: {
			options: [
				{ name: 'journal', icon: ICONS.pageHomeJournal, pages: PAGES.JOURNAL },
				{ name: 'blog', icon: ICONS.pageHomeBlog, pages: PAGES.BLOG },
				{ name: 'documentation', icon: ICONS.pageHomeDocumentation, pages: PAGES.DOCUMENTATION },
				{ name: 'custom', icon: null, pages: null },
			],
		},
		feed: {
			options: [
				{ name: 'journal', icon: null, pages: PAGES.JOURNAL },
				{ name: 'blog', icon: null, pages: PAGES.BLOG },
				{ name: 'documentation', icon: null, pages: PAGES.DOCUMENTATION },
				{ name: 'custom', icon: null, pages: null },
			],
		},
		post: {
			options: [
				{ name: 'journal', icon: null, pages: PAGES.JOURNAL },
				{ name: 'blog', icon: null, pages: PAGES.BLOG },
				{ name: 'documentation', icon: null, pages: PAGES.DOCUMENTATION },
				{ name: 'custom', icon: null, pages: null },
			],
		},
		user: {
			options: [
				{ name: 'journal', icon: null, pages: PAGES.JOURNAL },
				{ name: 'blog', icon: null, pages: PAGES.BLOG },
				{ name: 'documentation', icon: null, pages: PAGES.DOCUMENTATION },
				{ name: 'custom', icon: null, pages: null },
			],
		},
		search: {
			options: [
				{ name: 'journal', icon: null, pages: PAGES.JOURNAL },
				{ name: 'blog', icon: null, pages: PAGES.BLOG },
				{ name: 'documentation', icon: null, pages: PAGES.DOCUMENTATION },
				{ name: 'custom', icon: null, pages: null },
			],
		},
	};

	const comparePageStructure = (current: any, template: any): boolean => {
		if (!current || !template) return false;
		if (current.type !== template.type) return false;
		if (current.layout !== template.layout) return false;
		if (current.width !== template.width) return false;
		if (current.nonce !== template.nonce) return false;

		if (Array.isArray(current.content) && Array.isArray(template.content)) {
			if (current.content.length !== template.content.length) return false;
			for (let i = 0; i < current.content.length; i++) {
				if (!comparePageStructure(current.content[i], template.content[i])) return false;
			}
		}

		return true;
	};

	const getActiveHomeTemplate = () => {
		const currentPages = portalProvider.current?.pages as any;
		const currentHome = currentPages?.home;
		if (!currentHome) return 'custom';

		const journalHome = PAGES.JOURNAL.home;
		const blogHome = PAGES.BLOG.home;
		const documentationHome = PAGES.DOCUMENTATION.home;

		if (comparePageStructure(currentHome, journalHome)) return 'journal';
		if (comparePageStructure(currentHome, blogHome)) return 'blog';
		if (comparePageStructure(currentHome, documentationHome)) return 'documentation';

		return 'custom';
	};

	const getActiveFeedTemplate = () => {
		const currentPages = portalProvider.current?.pages as any;
		const currentFeed = currentPages?.feed;
		if (!currentFeed) return 'custom';

		const journalFeed = PAGES.JOURNAL.feed;
		const blogFeed = PAGES.BLOG.feed;
		const documentationFeed = PAGES.DOCUMENTATION.feed;

		if (comparePageStructure(currentFeed, journalFeed)) return 'journal';
		if (comparePageStructure(currentFeed, blogFeed)) return 'blog';
		if (comparePageStructure(currentFeed, documentationFeed)) return 'documentation';

		return 'custom';
	};

	const getActivePostTemplate = () => {
		const currentPages = portalProvider.current?.pages as any;
		const currentPost = currentPages?.post;
		if (!currentPost) return 'custom';

		if (comparePageStructure(currentPost, PAGES.JOURNAL.post)) return 'journal';
		if (comparePageStructure(currentPost, PAGES.BLOG.post)) return 'blog';
		if (comparePageStructure(currentPost, PAGES.DOCUMENTATION.post)) return 'documentation';

		return 'custom';
	};

	const getActiveUserTemplate = () => {
		const currentPages = portalProvider.current?.pages as any;
		const currentUser = currentPages?.user;
		if (!currentUser) return 'custom';

		if (comparePageStructure(currentUser, PAGES.JOURNAL.user)) return 'journal';
		if (comparePageStructure(currentUser, PAGES.BLOG.user)) return 'blog';
		if (comparePageStructure(currentUser, PAGES.DOCUMENTATION.user)) return 'documentation';

		return 'custom';
	};

	const getActiveSearchTemplate = () => {
		const currentPages = portalProvider.current?.pages as any;
		const currentSearch = currentPages?.search;
		if (!currentSearch) return 'custom';

		if (comparePageStructure(currentSearch, PAGES.JOURNAL.search)) return 'journal';
		if (comparePageStructure(currentSearch, PAGES.BLOG.search)) return 'blog';
		if (comparePageStructure(currentSearch, PAGES.DOCUMENTATION.search)) return 'documentation';

		return 'custom';
	};

	const [activeTemplates, setActiveTemplates] = React.useState<{ [key: string]: string }>({
		home: getActiveHomeTemplate(),
		feed: getActiveFeedTemplate(),
		post: getActivePostTemplate(),
		user: getActiveUserTemplate(),
		search: getActiveSearchTemplate(),
	});

	React.useEffect(() => {
		setActiveTemplates({
			home: getActiveHomeTemplate(),
			feed: getActiveFeedTemplate(),
			post: getActivePostTemplate(),
			user: getActiveUserTemplate(),
			search: getActiveSearchTemplate(),
		});
	}, [
		(portalProvider.current?.pages as any)?.home,
		(portalProvider.current?.pages as any)?.feed,
		(portalProvider.current?.pages as any)?.post,
		(portalProvider.current?.pages as any)?.user,
		(portalProvider.current?.pages as any)?.search,
	]);

	async function handleTemplateChange(pageKey: string, templateName: string) {
		if (templateName === activeTemplates[pageKey]) return;
		if (!arProvider.wallet || !portalProvider.current?.id) return;

		const config = templateConfig[pageKey];
		if (!config) return;

		const template = config.options.find((t) => t.name === templateName);
		if (!template) return;

		const isCustom = templateName === 'custom';
		const newPageContent = isCustom ? { type: 'grid', content: [] } : template.pages[pageKey];

		setLoading(true);
		try {
			const updatedPages = {
				...portalProvider.current.pages,
				[pageKey]: newPageContent,
			};

			await permawebProvider.libs.updateZone(
				{ Pages: permawebProvider.libs.mapToProcessCase(updatedPages) },
				portalProvider.current.id,
				arProvider.wallet
			);

			portalProvider.refreshCurrentPortal(PortalPatchMapEnum.Presentation);
			setActiveTemplates((prev) => ({ ...prev, [pageKey]: templateName }));

			const messages = {
				home: language?.homeTemplateUpdated || 'Home template updated',
				feed: language?.feedTemplateUpdated || 'Feed template updated',
				post: 'Post template updated',
				user: 'User template updated',
				search: 'Search template updated',
			};
			addNotification(`${messages[pageKey]}!`, 'success');
		} catch (e: any) {
			addNotification(e.message ?? `Error updating ${pageKey} template`, 'warning');
		}
		setLoading(false);
	}

	const defaultOrder = ['home', 'feed', 'post', 'user', 'search'];

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

	const renderTemplateOptions = (pageKey: string, activeTemplate: string) => {
		const config = templateConfig[pageKey];
		if (!config) return null;

		return (
			<S.HomeTemplateWrapper>
				<S.HomeTemplateOptions>
					{config.options.map((option) => {
						const active = option.name === activeTemplate;
						return (
							<S.HomeTemplateOption
								key={option.name}
								$active={active}
								disabled={unauthorized || loading}
								onClick={() => !unauthorized && !loading && !active && handleTemplateChange(pageKey, option.name)}
							>
								<S.HomeTemplateOptionIcon $active={active}>
									{option.icon ? (
										<img src={option.icon} alt={option.name} />
									) : (
										<S.HomeTemplateIconPlaceholder $active={active}>
											<ReactSVG src={ICONS.add} />
										</S.HomeTemplateIconPlaceholder>
									)}
								</S.HomeTemplateOptionIcon>
								<S.HomeTemplateOptionLabel>{option.name}</S.HomeTemplateOptionLabel>
							</S.HomeTemplateOption>
						);
					})}
				</S.HomeTemplateOptions>
			</S.HomeTemplateWrapper>
		);
	};

	function renderPageList(pages: any, opts?: { static?: boolean }) {
		if (Object.entries(pages).length === 0) {
			return (
				<S.WrapperEmpty className={'border-wrapper-alt2'}>
					<p>{language?.noPagesFound}</p>
				</S.WrapperEmpty>
			);
		}

		return (
			<>
				{Object.entries(pages).map(([key], index) => {
					const isCollapsed = collapsedPages[key] ?? true;
					const hasTemplates = templateConfig[key] && !opts?.static;
					const isTemplatePage = !!templateConfig[key];

					return (
						<PageRow
							key={index}
							pageKey={key}
							isStatic={opts?.static}
							isCollapsed={isCollapsed}
							onToggleCollapse={() => setCollapsedPages((prev) => ({ ...prev, [key]: !prev[key] }))}
							isTemplatePage={isTemplatePage}
						>
							{hasTemplates && !isCollapsed && renderTemplateOptions(key, activeTemplates[key])}
							{!hasTemplates && !isCollapsed && !opts?.static && (
								<S.TemplateEmptyWrapper>
									<p>{language?.noTemplatesFound}</p>
								</S.TemplateEmptyWrapper>
							)}
						</PageRow>
					);
				})}
			</>
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
				<S.MainPagesWrapper>{renderPageList(mainPages)}</S.MainPagesWrapper>
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
					{renderPageList(staticPages, { static: true })}
				</S.InfoPagesWrapper>
			</S.Wrapper>
		) : null;
	}, [
		portalProvider.current?.id,
		portalProvider.current?.pages,
		languageProvider.current,
		collapsedPages,
		activeTemplates,
	]);

	return (
		<>
			{loading && <Loader message={'Updating Template...'} />}
			{pages}
		</>
	);
}
