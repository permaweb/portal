import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

	const homeTemplateOptions = [
		{ name: 'journal', icon: ICONS.pageHomeJournal, pages: PAGES.JOURNAL },
		{ name: 'blog', icon: ICONS.pageHomeBlog, pages: PAGES.BLOG },
		{ name: 'documentation', icon: ICONS.pageHomeDocumentation, pages: PAGES.BLOG },
		{ name: 'custom', icon: null, pages: null },
	];

	const getActiveHomeTemplate = () => {
		const currentPages = portalProvider.current?.pages as any;
		const currentHome = currentPages?.home;
		if (!currentHome) return 'custom';

		const journalHome = PAGES.JOURNAL.home;
		const blogHome = PAGES.BLOG.home;

		if (JSON.stringify(currentHome) === JSON.stringify(journalHome)) return 'journal';
		if (JSON.stringify(currentHome) === JSON.stringify(blogHome)) return 'blog';

		const navPosition = portalProvider.current?.layout?.navigation?.layout?.position;
		if (
			(navPosition === 'left' || navPosition === 'right') &&
			JSON.stringify(currentHome) === JSON.stringify(blogHome)
		) {
			return 'documentation';
		}

		return 'custom';
	};

	const [activeHomeTemplate, setActiveHomeTemplate] = React.useState<string>(getActiveHomeTemplate());

	React.useEffect(() => {
		setActiveHomeTemplate(getActiveHomeTemplate());
	}, [(portalProvider.current?.pages as any)?.home]);

	async function handleHomeTemplateChange(templateName: string) {
		if (templateName === 'custom' || templateName === activeHomeTemplate) return;
		if (!arProvider.wallet || !portalProvider.current?.id) return;

		const template = homeTemplateOptions.find((t) => t.name === templateName);
		if (!template || !template.pages) return;

		setLoading(true);
		try {
			const updatedPages = {
				...portalProvider.current.pages,
				home: template.pages.home,
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

	const defaultOrder = ['home', 'feed', 'post', 'user'];

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
			<S.PagesWrapper className={'border-wrapper-alt2'}>
				{Object.entries(pages).map(([key], index) => {
					const redirectBase = pages[key].type === 'static' ? URLS.pageEditInfo : URLS.pageEditMain;
					const redirectId = pages[key].type === 'static' ? pages[key].id : key;
					const isHome = key === 'home';

					return (
						<React.Fragment key={index}>
							<Link
								to={`${resolvePrimaryDomain(portalProvider.current?.domains, portalProvider.current?.id)}/#/${urlify(
									key
								)}`}
								target={'_blank'}
							>
								<S.PageWrapper className={'fade-in'}>
									<S.PageHeader>
										<p>{displayUrlName(key)}</p>
									</S.PageHeader>
									<S.PageDetail>
										<S.PageActions>
											<Button
												type={'alt3'}
												label={language?.edit}
												handlePress={(e: any) => {
													e.preventDefault();
													e.stopPropagation();
													navigate(`${redirectBase(portalProvider.current.id)}/${redirectId}`);
												}}
											/>
										</S.PageActions>
									</S.PageDetail>
								</S.PageWrapper>
							</Link>
							{isHome && (
								<S.HomeTemplateWrapper>
									<S.HomeTemplateOptions>
										{homeTemplateOptions.map((option) => {
											const active = option.name === activeHomeTemplate;
											const isCustom = option.name === 'custom';
											return (
												<S.HomeTemplateOption
													key={option.name}
													$active={active}
													disabled={unauthorized || loading || (isCustom && !active)}
													onClick={() =>
														!unauthorized && !loading && !isCustom && handleHomeTemplateChange(option.name)
													}
												>
													<S.HomeTemplateOptionIcon $active={active}>
														{option.icon ? <img src={option.icon} alt={option.name} /> : <ReactSVG src={ICONS.add} />}
													</S.HomeTemplateOptionIcon>
													<S.HomeTemplateOptionLabel>{option.name}</S.HomeTemplateOptionLabel>
												</S.HomeTemplateOption>
											);
										})}
									</S.HomeTemplateOptions>
								</S.HomeTemplateWrapper>
							)}
						</React.Fragment>
					);
				})}
			</S.PagesWrapper>
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
				{renderPageList(mainPages)}
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
	}, [portalProvider.current?.id, portalProvider.current?.pages, languageProvider.current]);

	return (
		<>
			{loading && <Loader message={`${language?.updatingHomeTemplate || 'Updating home template'}...`} />}
			{pages}
		</>
	);
}
