import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { debounce } from 'lodash';

import { usePortalProvider } from 'editor/providers/PortalProvider';
import { EditorStoreRootState } from 'editor/store';
import { currentPostUpdate } from 'editor/store/post';

import { Button } from 'components/atoms/Button';
import { IconButton } from 'components/atoms/IconButton';
import { Portal } from 'components/atoms/Portal';
import { Tabs } from 'components/atoms/Tabs';
import { ASSETS, DOM, STYLING } from 'helpers/config';
import {
	ArticleBlockEnum,
	PortalAssetRequestType,
	PortalCategoryType,
	PortalUserType,
	RequestUpdateType,
} from 'helpers/types';
import { checkWindowCutoff, hideDocumentBody, showDocumentBody } from 'helpers/window';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';

import { ArticleBlocks } from '../ArticleBlocks';
import { ArticlePost } from '../ArticlePost';

import * as S from './styles';

export default function ArticleToolbar(props: {
	addBlock: (type: ArticleBlockEnum) => void;
	handleInitAddBlock: (e: any) => void;
	handleSubmit: () => void;
	handleRequestUpdate: (updateType: RequestUpdateType) => void;
}) {
	const dispatch = useDispatch();
	const { assetId } = useParams<{ assetId?: string }>();

	const currentPost = useSelector((state: EditorStoreRootState) => state.currentPost);

	const permawebProvider = usePermawebProvider();
	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const TABS = [{ label: language?.post }, { label: language?.blocks }];

	const titleRef = React.useRef<any>(null);
	const [currentTab, setCurrentTab] = React.useState<string>(TABS[0]!.label);
	const [desktop, setDesktop] = React.useState(checkWindowCutoff(parseInt(STYLING.cutoffs.initial)));

	const handleCurrentPostUpdate = (updatedField: { field: string; value: any }) => {
		dispatch(currentPostUpdate(updatedField));
	};

	function handleWindowResize() {
		if (checkWindowCutoff(parseInt(STYLING.cutoffs.initial))) {
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
		if (!desktop) handleCurrentPostUpdate({ field: 'panelOpen', value: false });
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

	function getCurrentTab() {
		switch (currentTab) {
			case 'Blocks':
				return <ArticleBlocks addBlock={props.addBlock} context={'toolbar'} />;
			case 'Post':
				return (
					<ArticlePost
						categories={currentPost.data.categories}
						setCategories={(updatedCategories: PortalCategoryType[]) =>
							handleCurrentPostUpdate({ field: 'categories', value: updatedCategories })
						}
						topics={currentPost.data.topics}
						setTopics={(updatedTopics: string[]) => handleCurrentPostUpdate({ field: 'topics', value: updatedTopics })}
					/>
				);
			default:
				return null;
		}
	}

	/* If a contributor visits a post that they did not create, then disable updates */
	const currentUser = portalProvider.current?.users?.find(
		(user: PortalUserType) => user.address === permawebProvider.profile?.id
	);
	const submitUnauthorized =
		assetId && currentUser?.address !== currentPost.data?.creator && !portalProvider.permissions.postAutoIndex;
	const isCurrentRequest =
		!!assetId && portalProvider.current?.requests?.some((request: PortalAssetRequestType) => request.id === assetId);

	const primaryDisabled = submitUnauthorized || currentPost.editor.loading.active || currentPost.editor.submitDisabled;
	const requestUnauthorized = !portalProvider.permissions?.updatePostRequestStatus;
	const statusDisabled = requestUnauthorized || submitUnauthorized || currentPost.editor.loading.active;

	function getSubmit() {
		if (isCurrentRequest) {
			return (
				<>
					<Button
						type={'warning'}
						label={language?.reject}
						handlePress={() => props.handleRequestUpdate('Reject')}
						active={false}
						disabled={primaryDisabled || requestUnauthorized}
						noFocus
					/>
					<Button
						type={'indicator'}
						label={language?.approve}
						handlePress={() => props.handleRequestUpdate('Approve')}
						active={false}
						disabled={primaryDisabled || requestUnauthorized}
						noFocus
					/>
				</>
			);
		}

		return (
			<Button
				type={'alt1'}
				label={language?.save}
				handlePress={props.handleSubmit}
				active={false}
				disabled={primaryDisabled}
				noFocus
			/>
		);
	}

	const panel = React.useMemo(() => {
		const content = (
			<S.Panel className={'border-wrapper-primary fade-in'} open={currentPost.editor.panelOpen}>
				<Tabs onTabPropClick={(label: string) => setCurrentTab(label)} type={'alt1'}>
					{TABS.map((tab: { label: string; icon?: string }, index: number) => {
						return <S.TabWrapper key={index} label={tab.label} icon={tab.icon ? tab.icon : null} />;
					})}
				</Tabs>
				<S.TabContent className={'scroll-wrapper-hidden'}>{getCurrentTab()}</S.TabContent>
				<S.PanelCloseWrapper>
					<IconButton
						type={'primary'}
						src={ASSETS.close}
						handlePress={() => handleCurrentPostUpdate({ field: 'panelOpen', value: !currentPost.editor.panelOpen })}
						tooltip={language?.closeToolkit}
						tooltipPosition={'bottom-right'}
						dimensions={{
							icon: 12.5,
							wrapper: 20,
						}}
						noFocus
						disabled={currentPost.editor.loading.active}
					/>
				</S.PanelCloseWrapper>
			</S.Panel>
		);
		if (!desktop)
			return currentPost.editor.panelOpen ? (
				<Portal node={DOM.overlay}>
					<div className={'overlay'}>{content}</div>
				</Portal>
			) : null;
		return content;
	}, [
		currentPost.editor.panelOpen,
		currentTab,
		props.addBlock,
		desktop,
		currentPost.editor.loading.active,
	]);

	return (
		<>
			<S.Wrapper>
				<S.TitleWrapper>
					<input
						ref={titleRef}
						value={currentPost.data.title ?? ''}
						onChange={(e: any) => handleCurrentPostUpdate({ field: 'title', value: e.target.value })}
						placeholder={language?.untitledPost}
						disabled={currentPost.editor.loading.active || !portalProvider.current?.id}
					/>
				</S.TitleWrapper>
				<S.EndActions>
					<Button
						type={'primary'}
						label={language?.toolkit}
						handlePress={() => handleCurrentPostUpdate({ field: 'panelOpen', value: !currentPost.editor.panelOpen })}
						active={currentPost.editor.panelOpen}
						disabled={currentPost.editor.loading.active}
						icon={currentPost.editor.panelOpen ? ASSETS.close : ASSETS.tools}
						iconLeftAlign
						tooltip={'CTRL + K'}
						noFocus
					/>
					<Button
						type={'primary'}
						label={language?.layout}
						handlePress={() =>
							handleCurrentPostUpdate({ field: 'blockEditMode', value: !currentPost.editor.blockEditMode })
						}
						active={currentPost.editor.blockEditMode}
						disabled={currentPost.editor.loading.active}
						icon={currentPost.editor.blockEditMode ? ASSETS.close : ASSETS.layout}
						iconLeftAlign
						tooltip={'CTRL + L'}
						noFocus
					/>
					<S.StatusAction status={currentPost.data.status}>
						<Button
							type={'primary'}
							label={currentPost.data?.status?.toUpperCase() ?? '-'}
							handlePress={() =>
								handleCurrentPostUpdate({
									field: 'status',
									value: currentPost.data.status === 'draft' ? 'published' : 'draft',
								})
							}
							active={false}
							disabled={statusDisabled}
							tooltip={statusDisabled ? null : `Mark as ${currentPost.data.status === 'draft' ? 'published' : 'draft'}`}
							noFocus
						/>
					</S.StatusAction>
					<S.SubmitWrapper>{getSubmit()}</S.SubmitWrapper>
				</S.EndActions>
			</S.Wrapper>
			{panel}
		</>
	);
}
