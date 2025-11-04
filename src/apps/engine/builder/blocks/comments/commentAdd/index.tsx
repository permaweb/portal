import * as React from 'react';
import { ReactSVG } from 'react-svg';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
import ProfileEditor from 'engine/components/profileEditor';
import { usePortalProvider } from 'engine/providers/portalProvider';
import {
	$createParagraphNode,
	$createTextNode,
	$getRoot,
	$getSelection,
	$insertNodes,
	COMMAND_PRIORITY_HIGH,
	KEY_ENTER_COMMAND,
	TextNode,
} from 'lexical';

import { Portal } from 'components/atoms/Portal';
import { ICONS } from 'helpers/config';
import { getTxEndpoint } from 'helpers/endpoints';
import { checkValidAddress } from 'helpers/utils';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';

import EmojiPicker from './emojiPicker';
import * as S from './styles';

const MAX_EDITOR_LENGTH = 500;

function CommentEditorContent(props: any) {
	const {
		commentsId,
		parentId,
		existingComments = [],
		onCommentAdded,
		onSubmittingChange,
		isEditMode,
		commentId,
		initialContent,
		onCancel,
	} = props;
	const [editor] = useLexicalComposerContext();
	const arProvider = useArweaveProvider();
	const languageProvider = useLanguageProvider();
	const { profile, libs } = usePermawebProvider();
	const { portal, portalId } = usePortalProvider();
	const [canSend, setCanSend] = React.useState(false);
	const [editorText, setEditorText] = React.useState(initialContent || '');
	const [isSubmitting, setIsSubmitting] = React.useState(false);
	const [postAsPortal, setPostAsPortal] = React.useState(false);
	const [showAuthorDropdown, setShowAuthorDropdown] = React.useState(false);
	const dropdownRef = React.useRef<HTMLDivElement>(null);
	const [showProfileManage, setShowProfileManage] = React.useState(false);
	const language = languageProvider.object?.[languageProvider.current] ?? null;
	React.useEffect(() => {
		if (initialContent && isEditMode) {
			editor.update(() => {
				const root = $getRoot();
				root.clear();
				const paragraph = $createParagraphNode();
				const textNode = $createTextNode(initialContent);
				paragraph.append(textNode);
				root.append(paragraph);
			});
			setEditorText(initialContent);
			setCanSend(true);
		}
	}, [initialContent, isEditMode, editor]);

	React.useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setShowAuthorDropdown(false);
			}
		}

		if (showAuthorDropdown) {
			document.addEventListener('mousedown', handleClickOutside);
			return () => document.removeEventListener('mousedown', handleClickOutside);
		}
	}, [showAuthorDropdown]);

	const handleEmoji = (emoji: string) => {
		editor.update(() => {
			const selection = $getSelection();
			if (selection) {
				const textNode = new TextNode(emoji);
				$insertNodes([textNode]);
			}
		});
	};

	React.useEffect(() => {
		return editor.registerCommand(
			KEY_ENTER_COMMAND,
			(event: KeyboardEvent) => {
				if (!event.shiftKey && canSend) {
					event.preventDefault();
					handleSubmit();
					return true;
				}
				return false;
			},
			COMMAND_PRIORITY_HIGH
		);
	}, [editor, canSend]);

	const handleSubmit = async () => {
		if (!profile?.id) {
			setShowProfileManage(true);
			return;
		}
		if (!canSend || isSubmitting) return;

		let plainText = '';
		editor.getEditorState().read(() => {
			const root = $getRoot();
			plainText = root.getTextContent().trim();
		});

		if (!plainText) return;
		if (!isEditMode && checkForDuplicate(plainText)) return;

		setIsSubmitting(true);
		onSubmittingChange?.(true);
		try {
			if (isEditMode) {
				const result = await libs.updateCommentContent({
					commentsId,
					commentId,
					content: plainText,
				});
				if (result && onCommentAdded) {
					onCommentAdded(plainText);
				}
			} else {
				let comment;

				if (postAsPortal && portalId) {
					const tags = [
						{ name: 'Forward-To', value: commentsId },
						{ name: 'Forward-Action', value: 'Add-Comment' },
					];

					if (parentId) {
						tags.push({ name: 'Parent-Id', value: parentId });
					}

					const zoneCommentId = await libs.sendMessage({
						processId: portalId,
						wallet: arProvider.wallet,
						action: 'Run-Action',
						tags: tags,
						data: { Input: plainText },
					});

					comment = zoneCommentId;
				} else {
					comment = await libs.createComment({
						commentsId,
						parentId,
						content: plainText,
					});
				}

				// Clear the editor after successful submission
				editor.update(() => {
					const root = $getRoot();
					root.clear();
				});
				setEditorText('');
				setCanSend(false);

				window.dispatchEvent(
					new CustomEvent('commentAdded', {
						detail: { comment, commentsId },
					})
				);

				if (onCommentAdded && comment) {
					onCommentAdded(comment);
				}
			}
		} catch (error) {
			console.error('Failed to save comment:', error);
		} finally {
			setIsSubmitting(false);
			onSubmittingChange?.(false);
		}
	};

	const checkForDuplicate = (text: string) => {
		const authorId = postAsPortal ? portalId : profile?.id;
		if (!authorId || !existingComments.length) return false;

		const normalizedText = text.trim().toLowerCase();
		return existingComments.some(
			(comment: any) => comment.author?.id === authorId && comment.content?.trim().toLowerCase() === normalizedText
		);
	};

	const handleEditorChange = () => {
		editor.getEditorState().read(() => {
			const root = $getRoot();
			const text = root.getTextContent();
			setEditorText(text);
			const trimmedText = text.trim();
			const isDuplicate = checkForDuplicate(trimmedText);
			setCanSend(trimmedText.length > 0 && text.length <= MAX_EDITOR_LENGTH && !isDuplicate);
		});
	};

	const handleEditorClick = (e: React.MouseEvent) => {
		// Focus the editor when clicking on the container
		if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('editor-input')) {
			editor.focus();
		}
	};

	const authorIcon = postAsPortal
		? portal?.Icon && checkValidAddress(portal.Icon)
			? getTxEndpoint(portal.Icon)
			: ICONS.portal
		: profile?.thumbnail && checkValidAddress(profile.thumbnail)
		? getTxEndpoint(profile.thumbnail)
		: ICONS.user;

	const userIcon =
		profile?.thumbnail && checkValidAddress(profile.thumbnail) ? getTxEndpoint(profile.thumbnail) : ICONS.user;
	const portalIcon = portal?.Icon && checkValidAddress(portal.Icon) ? getTxEndpoint(portal.Icon) : ICONS.portal;

	return (
		<>
			<S.Editor onClick={handleEditorClick}>
				{portalId &&
					!isEditMode &&
					profile?.roles &&
					(profile.roles.includes('Admin') || profile.roles.includes('Moderator')) && (
						<S.AuthorSelector ref={dropdownRef}>
							<S.AuthorIcon
								onClick={(e: React.MouseEvent) => {
									e.stopPropagation();
									setShowAuthorDropdown(!showAuthorDropdown);
								}}
								src={authorIcon}
								onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
									e.currentTarget.src = postAsPortal ? ICONS.portal : ICONS.user;
								}}
								alt={postAsPortal ? portal?.Name || 'Portal' : profile?.displayName || 'User'}
							/>
							{showAuthorDropdown && (
								<S.AuthorDropdown>
									<S.AuthorOption
										onClick={() => {
											setPostAsPortal(false);
											setShowAuthorDropdown(false);
										}}
										$active={!postAsPortal}
									>
										<img
											src={userIcon}
											onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
												e.currentTarget.src = ICONS.user;
											}}
											alt={profile?.displayName || 'User'}
										/>
										<span>{profile?.displayName || 'User'}</span>
									</S.AuthorOption>
									<S.AuthorOption
										onClick={() => {
											setPostAsPortal(true);
											setShowAuthorDropdown(false);
										}}
										$active={postAsPortal}
									>
										<img
											src={portalIcon}
											onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
												e.currentTarget.src = ICONS.portal;
											}}
											alt={portal?.Name || 'Portal'}
										/>
										<span>{portal?.Name || 'Portal'}</span>
									</S.AuthorOption>
								</S.AuthorDropdown>
							)}
						</S.AuthorSelector>
					)}
				<ContentEditable className="editor-input" />
				<S.Actions>
					<EmojiPicker onInsertEmoji={handleEmoji} />
					{isEditMode && (
						<S.CancelButton onClick={onCancel} title="Cancel">
							<ReactSVG src={ICONS.close} />
						</S.CancelButton>
					)}
					<S.Send onClick={handleSubmit} $active={canSend && !isSubmitting}>
						<ReactSVG src={ICONS.send} />
					</S.Send>
				</S.Actions>
			</S.Editor>

			<OnChangePlugin onChange={handleEditorChange} />
			<HistoryPlugin />
			{showProfileManage && (
				<Portal>
					<S.ModalOverlay
						onClick={() => {
							setShowProfileManage(false);
						}}
					>
						<S.ModalContent
							role="dialog"
							aria-modal="true"
							aria-label="Manage Profile"
							onClick={(e) => e.stopPropagation()}
						>
							<S.ModalHeader>
								<S.ModalTitle>Create Profile</S.ModalTitle>
								<S.CloseButton
									onClick={() => {
										setShowProfileManage(false);
									}}
									aria-label="Close"
								>
									×
								</S.CloseButton>
							</S.ModalHeader>
							<ProfileEditor profile={null} handleClose={() => setShowProfileManage(false)} handleUpdate={null} />
						</S.ModalContent>
					</S.ModalOverlay>
				</Portal>
			)}
		</>
	);
}

export default function CommentAdd(props: any) {
	const { commentsId, parentId, isEditMode, commentId, initialContent, onCancel, onSubmittingChange } = props;
	const { profile } = usePermawebProvider();
	const { walletAddress } = useArweaveProvider();
	const { portalId } = usePortalProvider();
	const [isSubmitting, setIsSubmitting] = React.useState(false);

	const hasAuthorIcon = Boolean(
		portalId &&
			!isEditMode &&
			profile?.roles &&
			(profile.roles.includes('Admin') || profile.roles.includes('Moderator'))
	);

	const initialConfig = {
		namespace: 'CommentEditor',
		theme: {
			paragraph: 'editor-paragraph',
			text: {
				bold: 'editor-text-bold',
				italic: 'editor-text-italic',
				underline: 'editor-text-underline',
				code: 'editor-text-code',
			},
		},
		onError: (error: Error) => {
			console.error('Lexical error:', error);
		},
	};

	const isLoggedIn = Boolean(walletAddress && profile?.id);
	const placeholder = isLoggedIn
		? isEditMode
			? 'Edit your comment...'
			: !parentId
			? 'Write a comment...'
			: 'Write a reply...'
		: 'Login to write a comment...';

	return (
		<S.CommentAdd $active={isLoggedIn && !isSubmitting} $hasIcon={hasAuthorIcon}>
			<LexicalComposer initialConfig={initialConfig}>
				<PlainTextPlugin
					contentEditable={
						<CommentEditorContent
							commentsId={commentsId}
							parentId={parentId}
							existingComments={props.existingComments}
							onCommentAdded={props.onCommentAdded}
							onSubmittingChange={(submitting: boolean) => {
								setIsSubmitting(submitting);
								onSubmittingChange?.(submitting);
							}}
							isEditMode={isEditMode}
							commentId={commentId}
							initialContent={initialContent}
							onCancel={onCancel}
						/>
					}
					placeholder={<div className="editor-placeholder">{placeholder}</div>}
					ErrorBoundary={LexicalErrorBoundary}
				/>
			</LexicalComposer>
		</S.CommentAdd>
	);
}
