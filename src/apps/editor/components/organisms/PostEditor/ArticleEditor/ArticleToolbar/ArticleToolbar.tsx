import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { ReactSVG } from 'react-svg';
import { debounce } from 'lodash';

import { ArticleBlocks } from 'editor/components/molecules/ArticleBlocks';
import { usePortalProvider } from 'editor/providers/PortalProvider';
import { EditorStoreRootState } from 'editor/store';
import { currentPostUpdate } from 'editor/store/post';

import { Button } from 'components/atoms/Button';
import { IconButton } from 'components/atoms/IconButton';
import { Modal } from 'components/atoms/Modal';
import { Portal } from 'components/atoms/Portal';
import { Tabs } from 'components/atoms/Tabs';
import { PostRenderer } from 'components/molecules/PostRenderer';
import { DOM, ICONS, STYLING } from 'helpers/config';
import { getThemeVars } from 'helpers/themes';
import {
	ArticleBlockEnum,
	PortalAssetRequestType,
	PortalCategoryType,
	PortalUserType,
	RequestUpdateType,
} from 'helpers/types';
import { hasUnsavedPostChanges, isMac } from 'helpers/utils';
import { checkWindowCutoff, hideDocumentBody, showDocumentBody } from 'helpers/window';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';
import { CloseHandler } from 'wrappers/CloseHandler';

import { ArticlePost } from '../ArticlePost';

import { ArticleToolbarMarkup } from './ArticleToolbarMarkup';
import * as S from './styles';

export default function ArticleToolbar(props: {
	addBlock: (type: ArticleBlockEnum) => void;
	viewMode: 'original' | 'new';
	handleInitAddBlock: (e: any) => void;
	handleSubmit: (reviewStatus?: string) => void;
	handleStatusUpdate: (status: 'Pending' | 'Review') => void;
	handleRequestUpdate: (updateType: RequestUpdateType) => void;
	handleSwitchOriginal: (viewmode: 'original' | 'new') => void;
	staticPage?: boolean;
}) {
	const dispatch = useDispatch();
	const { assetId } = useParams<{ assetId?: string }>();

	const currentPost = useSelector((state: EditorStoreRootState) => state.currentPost);

	const permawebProvider = usePermawebProvider();
	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const TABS = [];

	if (!props.staticPage) TABS.push({ label: language?.post, id: 'post' });
	TABS.push({ label: language?.blocks, id: 'blocks' });

	const [currentTab, setCurrentTab] = React.useState<string>(TABS[0]!.id);
	const [desktop, setDesktop] = React.useState(checkWindowCutoff(parseInt(STYLING.cutoffs.desktop)));
	const [previewOpen, setPreviewOpen] = React.useState(false);
	const [showDropdown, setShowDropdown] = React.useState(false);

	const titleRef = React.useRef<any>(null);
	const prevDesktopRef = React.useRef<boolean>(desktop);

	const hasChanges = hasUnsavedPostChanges(currentPost.data, currentPost.originalData);
	const isEmpty =
		!currentPost.data.content ||
		currentPost.data.content.length === 0 ||
		currentPost.data.content.every((block) => !block.content || block.content.trim() === '');

	const handleCurrentPostUpdate = (updatedField: { field: string; value: any }) => {
		dispatch(currentPostUpdate(updatedField));
	};

	function handleWindowResize() {
		if (checkWindowCutoff(parseInt(STYLING.cutoffs.desktop))) {
			setDesktop(true);
		} else {
			setDesktop(false);
		}
	}

	const debouncedResize = React.useCallback(debounce(handleWindowResize, 0), []);

	React.useEffect(() => {
		window.addEventListener('resize', debouncedResize);

		return () => {
			window.removeEventListener('resize', debouncedResize);
		};
	}, [debouncedResize]);

	React.useEffect(() => {
		if (titleRef && titleRef.current) titleRef.current.focus();
	}, [titleRef]);

	React.useEffect(() => {
		const wasDesktop = prevDesktopRef.current;
		const isDesktop = desktop;

		// Close panel when transitioning to mobile OR from mobile to desktop
		if ((!isDesktop && wasDesktop) || (isDesktop && !wasDesktop)) {
			handleCurrentPostUpdate({ field: 'panelOpen', value: false });
		}

		prevDesktopRef.current = desktop;
	}, [desktop]);

	React.useEffect(() => {
		if (currentPost.editor.panelOpen && !desktop) {
			hideDocumentBody();
			return () => {
				showDocumentBody();
			};
		}
	}, [currentPost.editor.panelOpen, desktop]);

	React.useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.ctrlKey) {
				if (event.key.toLowerCase() === 'k') {
					event.preventDefault();
					handleCurrentPostUpdate({ field: 'panelOpen', value: !currentPost.editor.panelOpen });
				}
				if (event.key.toLowerCase() === 'l') {
					event.preventDefault();
					handleCurrentPostUpdate({ field: 'blockEditMode', value: !currentPost.editor.blockEditMode });
				}
			}
			if (
				event.key === 'Enter' ||
				((event.ctrlKey || event.metaKey) && event.key === 'Enter') ||
				event.key === 'Tab' ||
				event.key === 'ArrowDown'
			) {
				if (document.activeElement === titleRef.current) {
					event.preventDefault();
					props.handleInitAddBlock(event);
				}
			}
		};

		document.addEventListener('keydown', handleKeyDown);

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [currentPost.data, currentPost.editor.blockEditMode, currentPost.editor.panelOpen]);

	React.useEffect(() => {
		const handleFocus = () => {
			handleCurrentPostUpdate({ field: 'titleFocused', value: true });
		};

		const handleBlur = () => {
			handleCurrentPostUpdate({ field: 'titleFocused', value: false });
		};

		const titleElement = titleRef.current;
		if (titleElement) {
			titleElement.addEventListener('focus', handleFocus);
			titleElement.addEventListener('blur', handleBlur);
		}

		return () => {
			if (titleElement) {
				titleElement.removeEventListener('focus', handleFocus);
				titleElement.removeEventListener('blur', handleBlur);
			}
		};
	}, [titleRef]);

	const handleSetCategories = React.useCallback(
		(updatedCategories: PortalCategoryType[]) => {
			dispatch(currentPostUpdate({ field: 'categories', value: updatedCategories }));
		},
		[dispatch]
	);

	const handleSetTopics = React.useCallback(
		(updatedTopics: string[]) => {
			dispatch(currentPostUpdate({ field: 'topics', value: updatedTopics }));
		},
		[dispatch]
	);

	function getCurrentTab() {
		switch (currentTab) {
			case 'blocks':
				return <ArticleBlocks type={'post'} addBlock={props.addBlock} context={'toolbar'} />;
			case 'post':
				return (
					<ArticlePost
						categories={currentPost.data.categories}
						setCategories={handleSetCategories}
						topics={currentPost.data.topics}
						setTopics={handleSetTopics}
					/>
				);
			default:
				return null;
		}
	}

	// <Button
	// 	type={'primary'}
	// 	label={language?.toolkit}
	// 	handlePress={() => {
	// 		handleCurrentPostUpdate({ field: 'panelOpen', value: !currentPost.editor.panelOpen });
	// 		setCurrentTab(TABS[0]!.id);
	// 	}}
	// 	active={currentPost.editor.panelOpen}
	// 	disabled={currentPost.editor.loading.active}
	// 	icon={currentPost.editor.panelOpen ? ICONS.close : ICONS.tools}
	// 	iconLeftAlign
	// 	tooltip={'CTRL + K'}
	// 	noFocus
	// />

	// <Button
	// 	type={'primary'}
	// 	label={language?.layout}
	// 	handlePress={() =>
	// 		handleCurrentPostUpdate({ field: 'blockEditMode', value: !currentPost.editor.blockEditMode })
	// 	}
	// 	active={currentPost.editor.blockEditMode}
	// 	disabled={currentPost.editor.loading.active}
	// 	icon={currentPost.editor.blockEditMode ? ICONS.close : ICONS.layout}
	// 	iconLeftAlign
	// 	tooltip={'CTRL + L'}
	// 	noFocus
	// />
	// <Button
	// 	type={'primary'}
	// 	label={language?.preview ?? 'Preview'}
	// 	handlePress={() => setPreviewOpen(true)}
	// 	active={false}
	// 	disabled={currentPost.editor.loading.active}
	// 	noFocus
	// 	icon={ICONS.show}
	// 	iconLeftAlign
	// />

	{
		/* <Button
		type={'primary'}
		label={language?.changes}
		handlePress={() => props.handleSwitchOriginal(props.viewMode === 'original' ? 'new' : 'original')}
		icon={props.viewMode === 'original' ? ICONS.close : ICONS.help}
		iconLeftAlign
		noFocus
	/> */
	}

	function handleOptionDropdownAction(action: () => void) {
		action();
		setShowDropdown(false);
	}

	function getOptionsDropdown() {
		const actions = [
			<button
				onClick={() =>
					handleOptionDropdownAction(() => {
						handleCurrentPostUpdate({ field: 'panelOpen', value: !currentPost.editor.panelOpen });
						setCurrentTab(TABS[0]!.id);
					})
				}
			>
				<ReactSVG src={currentPost.editor.panelOpen ? ICONS.close : ICONS.tools} />
				<p>{currentPost.editor.panelOpen ? language?.closeToolkit : language?.openToolkit}</p>
				<span>CTRL + K</span>
			</button>,
			<button
				onClick={() =>
					handleOptionDropdownAction(() => {
						handleCurrentPostUpdate({ field: 'blockEditMode', value: !currentPost.editor.blockEditMode });
					})
				}
			>
				<ReactSVG src={currentPost.editor.blockEditMode ? ICONS.close : ICONS.layout} />
				<p>{currentPost.editor.blockEditMode ? language?.closeLayout : language?.openLayout}</p>
				<span>CTRL + L</span>
			</button>,
			<button
				onClick={() =>
					handleOptionDropdownAction(() => {
						setPreviewOpen(true);
					})
				}
			>
				<ReactSVG src={ICONS.show} />
				<p>{language?.preview}</p>
			</button>,
		];

		if (isCurrentRequest && !requestUnauthorized) {
			actions.push(
				<button
					onClick={() =>
						handleOptionDropdownAction(() => {
							props.handleSwitchOriginal(props.viewMode === 'original' ? 'new' : 'original');
						})
					}
				>
					<ReactSVG src={props.viewMode === 'original' ? ICONS.close : ICONS.write} />
					<p>{props.viewMode === 'original' ? language?.hideChanges : language?.showChanges}</p>
				</button>
			);
		}

		return (
			<>
				{actions.map((action, index) => {
					return <React.Fragment key={index}>{action}</React.Fragment>;
				})}
			</>
		);
	}

	const isAssetIdPresentInAssets = React.useMemo(() => {
		return portalProvider.current?.assets?.some((asset: any) => asset.id === assetId);
	}, [assetId, portalProvider.current?.assets]);

	/* If a contributor visits a post that they did not create, then disable updates */
	const currentUser = portalProvider.current?.users?.find(
		(user: PortalUserType) => user.address === permawebProvider.profile?.id
	);
	const submitUnauthorized =
		assetId && currentUser?.address !== currentPost.data?.creator && !portalProvider.permissions?.postAutoIndex;
	const isCurrentRequest =
		!!assetId && portalProvider.current?.requests?.some((request: PortalAssetRequestType) => request.id === assetId);
	const currentRequest =
		isCurrentRequest &&
		portalProvider.current?.requests?.find((request: PortalAssetRequestType) => request.id === assetId);
	const primaryDisabled =
		submitUnauthorized ||
		currentPost.editor.loading.active ||
		currentPost.editor.submitDisabled ||
		portalProvider.updating;
	const requestUnauthorized = !portalProvider.permissions?.updatePostRequestStatus;

	function getSubmit() {
		if (isCurrentRequest) {
			if (!requestUnauthorized) {
				return (
					<>
						<Button
							type={'warning'}
							label={language?.reject}
							handlePress={() => props.handleRequestUpdate('Reject')}
							active={false}
							disabled={primaryDisabled || requestUnauthorized || currentRequest?.status !== 'Review'}
							noFocus
						/>
						<Button
							type={'indicator'}
							label={language?.approve}
							handlePress={() => props.handleRequestUpdate('Approve')}
							active={false}
							disabled={primaryDisabled || requestUnauthorized || currentRequest?.status !== 'Review'}
							noFocus
						/>
					</>
				);
			} else {
				return (
					<>
						<Button
							type={'primary'}
							label={language?.save}
							handlePress={() =>
								currentRequest?.status === 'Pending' && !isAssetIdPresentInAssets
									? props.handleSubmit('Auto')
									: props.handleSubmit()
							}
							active={false}
							disabled={primaryDisabled || currentRequest?.status !== 'Pending'}
							tooltip={primaryDisabled ? null : (isMac ? 'Cmd' : 'CTRL') + ' + Shift + S'}
							noFocus
						/>
						{currentRequest?.status && (
							<Button
								type={'alt1'}
								label={currentRequest?.status === 'Pending' ? language?.submitForReview : language?.markAsPending}
								handlePress={() =>
									props.handleStatusUpdate(currentRequest?.status === 'Pending' ? 'Review' : 'Pending')
								}
								active={false}
								disabled={primaryDisabled}
								noFocus
							/>
						)}
					</>
				);
			}
		}

		return (
			<>
				<Button
					type={'alt1'}
					label={language?.save}
					handlePress={() =>
						// Contributors need to save using the approve workflow - this will trigger the request approval process
						portalProvider.permissions?.postAutoIndex ? props.handleSubmit('Auto') : props.handleSubmit()
					}
					active={false}
					disabled={primaryDisabled}
					tooltip={primaryDisabled ? null : (isMac ? 'Cmd' : 'CTRL') + ' + Shift + S'}
					noFocus
				/>
			</>
		);
	}

	const panel = React.useMemo(() => {
		const content = currentPost.editor.panelOpen ? (
			<S.Panel className={'border-wrapper-alt2 fade-in'} open={currentPost.editor.panelOpen}>
				<S.PanelCloseWrapperStart>
					<IconButton
						type={'primary'}
						src={ICONS.close}
						handlePress={() => {
							handleCurrentPostUpdate({ field: 'panelOpen', value: !currentPost.editor.panelOpen });
							setCurrentTab(TABS[0]!.id);
						}}
						tooltip={language?.closeToolkit}
						tooltipPosition={'bottom-right'}
						dimensions={{
							icon: 12.5,
							wrapper: 20,
						}}
						noFocus
						disabled={currentPost.editor.loading.active}
					/>
				</S.PanelCloseWrapperStart>
				<Tabs
					onTabPropClick={(label: string) => {
						const tab = TABS.find((t) => t.label === label);
						if (tab) setCurrentTab(tab.id);
					}}
					type={'alt1'}
				>
					{TABS.map((tab: { label: string; id: string; icon?: string }, index: number) => {
						return <S.TabWrapper key={index} label={tab.label} icon={tab.icon ? tab.icon : null} />;
					})}
				</Tabs>
				<S.TabContent className={'scroll-wrapper-hidden'}>
					{getCurrentTab()}

					<S.PanelCloseWrapperEnd>
						<Button
							type={'primary'}
							label={language?.closeToolkit}
							handlePress={() => {
								handleCurrentPostUpdate({ field: 'panelOpen', value: !currentPost.editor.panelOpen });
								setCurrentTab(TABS[0]!.id);
							}}
							noFocus
							disabled={currentPost.editor.loading.active}
							height={40}
							fullWidth
						/>
					</S.PanelCloseWrapperEnd>
				</S.TabContent>
			</S.Panel>
		) : null;
		if (!desktop)
			return currentPost.editor.panelOpen ? (
				<Portal node={DOM.overlay}>
					<div className={'overlay'}>{content}</div>
				</Portal>
			) : null;
		return content;
	}, [currentPost.editor.panelOpen, currentTab, props.addBlock, desktop, currentPost.editor.loading.active]);

	const previewPost = React.useMemo(() => {
		const d = currentPost.data;
		return {
			name: d?.title || '',
			dateCreated: d?.dateCreated || Date.now(),
			creator: d?.creator,
			metadata: {
				status: (d?.status?.toLowerCase?.() as 'draft' | 'published') || 'draft',
				description: d?.description || '',
				thumbnail: d?.thumbnail || undefined,
				topics: d?.topics || [],
			},
		} as any;
	}, [currentPost.data]);

	// Reuse the editor content as-is
	const previewContent = React.useMemo(() => currentPost.data?.content || [], [currentPost.data?.content]);

	// Fetch the creator's profile for preview
	React.useEffect(() => {
		const creatorId = currentPost.data?.creator;
		if (creatorId && !portalProvider.usersByPortalId[creatorId]) {
			portalProvider.fetchPortalUserProfile({ address: creatorId } as PortalUserType);
		}
	}, [currentPost.data?.creator, portalProvider]);

	// Use the creator's profile for author display in preview
	const previewProfile = React.useMemo(() => {
		const creatorId = currentPost.data?.creator;
		const p = creatorId ? portalProvider.usersByPortalId[creatorId] : permawebProvider.profile;
		return {
			displayName: p?.displayName || p?.handle || p?.id || 'Author',
			thumbnail: p?.thumbnail || p?.avatar || undefined,
		};
	}, [currentPost.data?.creator, portalProvider.usersByPortalId, permawebProvider.profile]);

	const scheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	const activeTheme = portalProvider.current.themes.find((t: any) => t.active);
	const themeVars = getThemeVars(activeTheme, scheme);

	const previewModal = React.useMemo(() => {
		if (!previewOpen) return null;

		return (
			<Modal
				header={language?.preview ?? 'Preview'}
				handleClose={() => setPreviewOpen(false)}
				width={900}
				className={'scroll-wrapper-hidden'}
			>
				<S.PreviewCard style={Object.fromEntries(Object.entries(themeVars))}>
					<PostRenderer
						isLoadingPost={false}
						isLoadingProfile={false}
						isLoadingContent={false}
						post={previewPost}
						profile={previewProfile}
						content={previewContent}
						isPreview={true}
					/>
				</S.PreviewCard>
			</Modal>
		);
	}, [previewOpen, previewPost, previewProfile, previewContent, language, themeVars]);

	return (
		<>
			<S.Wrapper>
				<S.TitleWrapper>
					<input
						ref={titleRef}
						value={currentPost.data.title ?? ''}
						onChange={(e: any) => handleCurrentPostUpdate({ field: 'title', value: e.target.value })}
						placeholder={props.staticPage ? language?.pageTitle : language?.untitledPost}
						disabled={currentPost.editor.loading.active || !portalProvider.current?.id}
					/>
				</S.TitleWrapper>
				<S.EndActions>
					<S.Indicators>
						{hasChanges && !isEmpty && !currentPost.editor.loading.active && (
							<S.UpdateWrapper>
								<span>{language.unsavedChanges}</span>
								<div className={'indicator'} />
							</S.UpdateWrapper>
						)}
						{currentRequest?.status && (
							<S.UpdateWrapper>
								<span>{currentRequest?.status}</span>
								<div className={'indicator'} />
							</S.UpdateWrapper>
						)}
					</S.Indicators>
					<ArticleToolbarMarkup />
					<S.OptionsWrapper>
						<CloseHandler active={showDropdown} disabled={!showDropdown} callback={() => setShowDropdown(false)}>
							<Button
								type={'primary'}
								label={language?.options}
								handlePress={() => setShowDropdown((prev) => !prev)}
								active={showDropdown}
								disabled={false}
								icon={ICONS.arrow}
								noFocus
							/>
							{showDropdown && (
								<S.OptionsDropdown className={'border-wrapper-alt1 fade-in scroll-wrapper-hidden'}>
									{getOptionsDropdown()}
								</S.OptionsDropdown>
							)}
						</CloseHandler>
					</S.OptionsWrapper>
					<S.SubmitWrapper>{getSubmit()}</S.SubmitWrapper>
				</S.EndActions>
			</S.Wrapper>
			{panel}
			{previewModal}
		</>
	);
}
