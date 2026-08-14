import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { ReactSVG } from 'react-svg';
import { createLitePostPreview } from 'engine-lite/data';
import { EngineLitePostPreview } from 'engine-lite/preview';
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
import { DOM, ICONS, STYLING } from 'helpers/config';
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
		const data = currentPost.data;
		const post = createLitePostPreview(
			{
				id: assetId || 'preview',
				name: data.title,
				creator: data.creator,
				dateCreated: data.dateCreated || Date.now(),
				metadata: {
					description: data.description,
					thumbnail: data.thumbnail,
					topics: data.topics,
					categories: data.categories,
					content: data.content,
					releaseDate: data.releaseDate,
					url: data.url,
				},
			},
			portalProvider.current?.id || '',
			portalProvider.current?.name || 'Portal'
		);
		return post;
	}, [assetId, currentPost.data, portalProvider.current?.id, portalProvider.current?.name]);

	const previewModal = React.useMemo(() => {
		if (!previewOpen) return null;

		return (
			<Modal header={null} handleClose={() => setPreviewOpen(false)} width={900} allowOverflow>
				<S.PreviewModalContent>
					<S.PreviewModalClose>
						<IconButton
							type={'alt1'}
							warning
							src={ICONS.close}
							handlePress={() => setPreviewOpen(false)}
							active={false}
							dimensions={{ wrapper: 26, icon: 14 }}
							tooltip={language?.close}
							tooltipPosition={'left'}
						/>
					</S.PreviewModalClose>
					<S.PreviewFrame>
						<EngineLitePostPreview
							post={previewPost}
							themes={portalProvider.current?.themes || []}
							fonts={portalProvider.current?.fonts || null}
						/>
					</S.PreviewFrame>
				</S.PreviewModalContent>
			</Modal>
		);
	}, [previewOpen, previewPost, language, portalProvider.current?.themes, portalProvider.current?.fonts]);

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
