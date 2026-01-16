import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ReactSVG } from 'react-svg';

import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
import { Loader } from 'components/atoms/Loader';
import { ICONS, PAGES, URLS } from 'helpers/config';
import { PortalPatchMapEnum } from 'helpers/types';
import { displayUrlName, resolvePrimaryDomain, urlify } from 'helpers/utils';
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

	const homeTemplateOptions = [
		{ name: 'journal', icon: ICONS.pageHomeJournal, pages: PAGES.JOURNAL },
		{ name: 'blog', icon: ICONS.pageHomeBlog, pages: PAGES.BLOG },
		{ name: 'documentation', icon: ICONS.pageHomeDocumentation, pages: PAGES.DOCUMENTATION },
		{ name: 'custom', icon: null, pages: null },
	];

	const feedTemplateOptions = [
		{ name: 'journal', icon: null, pages: PAGES.JOURNAL },
		{ name: 'blog', icon: null, pages: PAGES.BLOG },
		{ name: 'documentation', icon: null, pages: PAGES.DOCUMENTATION },
		{ name: 'custom', icon: null, pages: null },
	];

	const postTemplateOptions = [
		{ name: 'journal', icon: null, pages: PAGES.JOURNAL },
		{ name: 'blog', icon: null, pages: PAGES.BLOG },
		{ name: 'documentation', icon: null, pages: PAGES.DOCUMENTATION },
		{ name: 'custom', icon: null, pages: null },
	];

	const userTemplateOptions = [
		{ name: 'journal', icon: null, pages: PAGES.JOURNAL },
		{ name: 'blog', icon: null, pages: PAGES.BLOG },
		{ name: 'documentation', icon: null, pages: PAGES.DOCUMENTATION },
		{ name: 'custom', icon: null, pages: null },
	];

	const searchTemplateOptions = [
		{ name: 'journal', icon: null, pages: PAGES.JOURNAL },
		{ name: 'blog', icon: null, pages: PAGES.BLOG },
		{ name: 'documentation', icon: null, pages: PAGES.DOCUMENTATION },
		{ name: 'custom', icon: null, pages: null },
	];

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

	const [activeHomeTemplate, setActiveHomeTemplate] = React.useState<string>(getActiveHomeTemplate());
	const [activeFeedTemplate, setActiveFeedTemplate] = React.useState<string>(getActiveFeedTemplate());
	const [activePostTemplate, setActivePostTemplate] = React.useState<string>(getActivePostTemplate());
	const [activeUserTemplate, setActiveUserTemplate] = React.useState<string>(getActiveUserTemplate());
	const [activeSearchTemplate, setActiveSearchTemplate] = React.useState<string>(getActiveSearchTemplate());

	React.useEffect(() => {
		setActiveHomeTemplate(getActiveHomeTemplate());
	}, [(portalProvider.current?.pages as any)?.home]);

	React.useEffect(() => {
		setActiveFeedTemplate(getActiveFeedTemplate());
	}, [(portalProvider.current?.pages as any)?.feed]);

	React.useEffect(() => {
		setActivePostTemplate(getActivePostTemplate());
	}, [(portalProvider.current?.pages as any)?.post]);

	React.useEffect(() => {
		setActiveUserTemplate(getActiveUserTemplate());
	}, [(portalProvider.current?.pages as any)?.user]);

	React.useEffect(() => {
		setActiveSearchTemplate(getActiveSearchTemplate());
	}, [(portalProvider.current?.pages as any)?.search]);

	async function handleHomeTemplateChange(templateName: string) {
		if (templateName === activeHomeTemplate) return;
		if (!arProvider.wallet || !portalProvider.current?.id) return;

		const template = homeTemplateOptions.find((t) => t.name === templateName);
		if (!template) return;

		const isCustom = templateName === 'custom';
		const newHome = isCustom ? { type: 'grid', content: [] } : template.pages.home;

		setLoading(true);
		try {
			const updatedPages = {
				...portalProvider.current.pages,
				home: newHome,
			};

			await permawebProvider.libs.updateZone(
				{ Pages: permawebProvider.libs.mapToProcessCase(updatedPages) },
				portalProvider.current.id,
				arProvider.wallet
			);

			portalProvider.refreshCurrentPortal(PortalPatchMapEnum.Presentation);
			setActiveHomeTemplate(templateName);
			addNotification(`${language?.homeTemplateUpdated || 'Home template updated'}!`, 'success');
		} catch (e: any) {
			addNotification(e.message ?? 'Error updating home template', 'warning');
		}
		setLoading(false);
	}

	async function handleFeedTemplateChange(templateName: string) {
		if (templateName === activeFeedTemplate) return;
		if (!arProvider.wallet || !portalProvider.current?.id) return;

		const template = feedTemplateOptions.find((t) => t.name === templateName);
		if (!template) return;

		const isCustom = templateName === 'custom';
		const newFeed = isCustom ? { type: 'grid', content: [] } : template.pages.feed;

		setLoading(true);
		try {
			const updatedPages = {
				...portalProvider.current.pages,
				feed: newFeed,
			};

			await permawebProvider.libs.updateZone(
				{ Pages: permawebProvider.libs.mapToProcessCase(updatedPages) },
				portalProvider.current.id,
				arProvider.wallet
			);

			portalProvider.refreshCurrentPortal(PortalPatchMapEnum.Presentation);
			setActiveFeedTemplate(templateName);
			addNotification(`${language?.feedTemplateUpdated || 'Feed template updated'}!`, 'success');
		} catch (e: any) {
			addNotification(e.message ?? 'Error updating feed template', 'warning');
		}
		setLoading(false);
	}

	async function handlePostTemplateChange(templateName: string) {
		if (templateName === activePostTemplate) return;
		if (!arProvider.wallet || !portalProvider.current?.id) return;

		const template = postTemplateOptions.find((t) => t.name === templateName);
		if (!template) return;

		const isCustom = templateName === 'custom';
		const newPost = isCustom ? { type: 'grid', content: [] } : template.pages.post;

		setLoading(true);
		try {
			const updatedPages = {
				...portalProvider.current.pages,
				post: newPost,
			};

			await permawebProvider.libs.updateZone(
				{ Pages: permawebProvider.libs.mapToProcessCase(updatedPages) },
				portalProvider.current.id,
				arProvider.wallet
			);

			portalProvider.refreshCurrentPortal(PortalPatchMapEnum.Presentation);
			setActivePostTemplate(templateName);
			addNotification('Post template updated!', 'success');
		} catch (e: any) {
			addNotification(e.message ?? 'Error updating post template', 'warning');
		}
		setLoading(false);
	}

	async function handleUserTemplateChange(templateName: string) {
		if (templateName === activeUserTemplate) return;
		if (!arProvider.wallet || !portalProvider.current?.id) return;

		const template = userTemplateOptions.find((t) => t.name === templateName);
		if (!template) return;

		const isCustom = templateName === 'custom';
		const newUser = isCustom ? { type: 'grid', content: [] } : template.pages.user;

		setLoading(true);
		try {
			const updatedPages = {
				...portalProvider.current.pages,
				user: newUser,
			};

			await permawebProvider.libs.updateZone(
				{ Pages: permawebProvider.libs.mapToProcessCase(updatedPages) },
				portalProvider.current.id,
				arProvider.wallet
			);

			portalProvider.refreshCurrentPortal(PortalPatchMapEnum.Presentation);
			setActiveUserTemplate(templateName);
			addNotification('User template updated!', 'success');
		} catch (e: any) {
			addNotification(e.message ?? 'Error updating user template', 'warning');
		}
		setLoading(false);
	}

	async function handleSearchTemplateChange(templateName: string) {
		if (templateName === activeSearchTemplate) return;
		if (!arProvider.wallet || !portalProvider.current?.id) return;

		const template = searchTemplateOptions.find((t) => t.name === templateName);
		if (!template) return;

		const isCustom = templateName === 'custom';
		const newSearch = isCustom ? { type: 'grid', content: [] } : template.pages.search;

		setLoading(true);
		try {
			const updatedPages = {
				...portalProvider.current.pages,
				search: newSearch,
			};

			await permawebProvider.libs.updateZone(
				{ Pages: permawebProvider.libs.mapToProcessCase(updatedPages) },
				portalProvider.current.id,
				arProvider.wallet
			);

			portalProvider.refreshCurrentPortal(PortalPatchMapEnum.Presentation);
			setActiveSearchTemplate(templateName);
			addNotification('Search template updated!', 'success');
		} catch (e: any) {
			addNotification(e.message ?? 'Error updating search template', 'warning');
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

	function renderPageList(pages: any) {
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
					const redirectBase = pages[key].type === 'static' ? URLS.pageEditInfo : URLS.pageEditMain;
					const redirectId = pages[key].type === 'static' ? pages[key].id : key;
					const isHome = key === 'home';
					const isFeed = key === 'feed';
					const isPost = key === 'post';
					const isUser = key === 'user';
					const isSearch = key === 'search';
					const isCollapsed = collapsedPages[key] ?? false;
					const previewUrl = `${resolvePrimaryDomain(
						portalProvider.current?.domains,
						portalProvider.current?.id
					)}/#/${urlify(key)}`;

					return (
						<S.PagesWrapper key={index} className={'border-wrapper-alt2'}>
							<S.PageWrapper
								className={'fade-in'}
								onClick={() => setCollapsedPages((prev) => ({ ...prev, [key]: !prev[key] }))}
							>
								<S.PageHeader>
									<S.Arrow $open={!isCollapsed}>
										<ReactSVG src={ICONS.arrow} />
									</S.Arrow>
									<p>{displayUrlName(key)}</p>
								</S.PageHeader>
								<S.PageDetail>
									<S.PageActions>
										<Button
											type={'alt3'}
											label={'Preview'}
											handlePress={(e: any) => {
												e.stopPropagation();
												window.open(previewUrl, '_blank');
											}}
										/>
										<Button
											type={'alt3'}
											label={language?.edit}
											handlePress={(e: any) => {
												e.stopPropagation();
												navigate(`${redirectBase(portalProvider.current.id)}/${redirectId}`);
											}}
										/>
									</S.PageActions>
								</S.PageDetail>
							</S.PageWrapper>
							{isHome && !isCollapsed && (
								<S.HomeTemplateWrapper>
									<S.HomeTemplateOptions>
										{homeTemplateOptions.map((option) => {
											const active = option.name === activeHomeTemplate;
											return (
												<S.HomeTemplateOption
													key={option.name}
													$active={active}
													disabled={unauthorized || loading}
													onClick={() => !unauthorized && !loading && !active && handleHomeTemplateChange(option.name)}
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
							)}
							{isFeed && !isCollapsed && (
								<S.HomeTemplateWrapper>
									<S.HomeTemplateOptions>
										{feedTemplateOptions.map((option) => {
											const active = option.name === activeFeedTemplate;
											return (
												<S.HomeTemplateOption
													key={option.name}
													$active={active}
													disabled={unauthorized || loading}
													onClick={() => !unauthorized && !loading && !active && handleFeedTemplateChange(option.name)}
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
							)}
							{isPost && !isCollapsed && (
								<S.HomeTemplateWrapper>
									<S.HomeTemplateOptions>
										{postTemplateOptions.map((option) => {
											const active = option.name === activePostTemplate;
											return (
												<S.HomeTemplateOption
													key={option.name}
													$active={active}
													disabled={unauthorized || loading}
													onClick={() => !unauthorized && !loading && !active && handlePostTemplateChange(option.name)}
												>
													<S.HomeTemplateOptionIcon $active={active}>
														<S.HomeTemplateIconPlaceholder $active={active}>
															<ReactSVG src={ICONS.add} />
														</S.HomeTemplateIconPlaceholder>
													</S.HomeTemplateOptionIcon>
													<S.HomeTemplateOptionLabel>{option.name}</S.HomeTemplateOptionLabel>
												</S.HomeTemplateOption>
											);
										})}
									</S.HomeTemplateOptions>
								</S.HomeTemplateWrapper>
							)}
							{isUser && !isCollapsed && (
								<S.HomeTemplateWrapper>
									<S.HomeTemplateOptions>
										{userTemplateOptions.map((option) => {
											const active = option.name === activeUserTemplate;
											return (
												<S.HomeTemplateOption
													key={option.name}
													$active={active}
													disabled={unauthorized || loading}
													onClick={() => !unauthorized && !loading && !active && handleUserTemplateChange(option.name)}
												>
													<S.HomeTemplateOptionIcon $active={active}>
														<S.HomeTemplateIconPlaceholder $active={active}>
															<ReactSVG src={ICONS.add} />
														</S.HomeTemplateIconPlaceholder>
													</S.HomeTemplateOptionIcon>
													<S.HomeTemplateOptionLabel>{option.name}</S.HomeTemplateOptionLabel>
												</S.HomeTemplateOption>
											);
										})}
									</S.HomeTemplateOptions>
								</S.HomeTemplateWrapper>
							)}
							{isSearch && !isCollapsed && (
								<S.HomeTemplateWrapper>
									<S.HomeTemplateOptions>
										{searchTemplateOptions.map((option) => {
											const active = option.name === activeSearchTemplate;
											return (
												<S.HomeTemplateOption
													key={option.name}
													$active={active}
													disabled={unauthorized || loading}
													onClick={() =>
														!unauthorized && !loading && !active && handleSearchTemplateChange(option.name)
													}
												>
													<S.HomeTemplateOptionIcon $active={active}>
														<S.HomeTemplateIconPlaceholder $active={active}>
															<ReactSVG src={ICONS.add} />
														</S.HomeTemplateIconPlaceholder>
													</S.HomeTemplateOptionIcon>
													<S.HomeTemplateOptionLabel>{option.name}</S.HomeTemplateOptionLabel>
												</S.HomeTemplateOption>
											);
										})}
									</S.HomeTemplateOptions>
								</S.HomeTemplateWrapper>
							)}
						</S.PagesWrapper>
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
					{renderPageList(staticPages)}
				</S.InfoPagesWrapper>
			</S.Wrapper>
		) : null;
	}, [
		portalProvider.current?.id,
		portalProvider.current?.pages,
		languageProvider.current,
		collapsedPages,
		activeHomeTemplate,
		activeFeedTemplate,
		activePostTemplate,
		activeUserTemplate,
		activeSearchTemplate,
	]);

	return (
		<>
			{loading && <Loader message={'Updating Template...'} />}
			{pages}
		</>
	);
}
