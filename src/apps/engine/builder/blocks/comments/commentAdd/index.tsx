import * as React from 'react';
import { ReactSVG } from 'react-svg';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
import Avatar from 'engine/components/avatar';
import ModalPortal from 'engine/components/modalPortal';
import ProfileEditor from 'engine/components/profileEditor';
import { useCommentRules } from 'engine/hooks/comments';
import { useProfile } from 'engine/hooks/profiles';
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

import { ICONS } from 'helpers/config';
import { useArweaveProvider } from 'providers/ArweaveProvider';
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
	const { profile, libs } = usePermawebProvider();
	const { portal, portalId } = usePortalProvider();
	const { profile: portalProfile } = useProfile(portalId);
	const [canSend, setCanSend] = React.useState(false);
	const [editorText, setEditorText] = React.useState(initialContent || '');
	const [isSubmitting, setIsSubmitting] = React.useState(false);
	const [postAsPortal, setPostAsPortal] = React.useState(false);
	const [showAuthorDropdown, setShowAuthorDropdown] = React.useState(false);
	const dropdownRef = React.useRef<HTMLDivElement>(null);
	const [showProfileManage, setShowProfileManage] = React.useState(false);
	const { rules } = useCommentRules(commentsId);
	const [ruleError, setRuleError] = React.useState<string | null>(null);
	const [tipAmount, setTipAmount] = React.useState<string>('');
	const [tipError, setTipError] = React.useState<string | null>(null);

	const tippingEnabled = rules?.enableTipping && !isEditMode;
	const tipRequired = tippingEnabled && rules?.requireTipToComment;

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

	const validateTip = (): string | null => {
		if (!tipRequired) return null;

		if (!tipAmount || tipAmount.trim() === '' || tipAmount === '0') {
			return 'A tip is required to comment.';
		}

		const minTip = parseFloat(rules?.minTipAmount || '0');
		const currentTip = parseFloat(tipAmount);

		if (isNaN(currentTip) || currentTip <= 0) {
			return 'Please enter a valid tip amount.';
		}

		if (minTip > 0 && currentTip < minTip) {
			return `Minimum tip amount is ${rules.minTipAmount}.`;
		}

		return null;
	};

	const handleSubmit = async () => {
		if (!profile?.id) {
			setShowProfileManage(true);
			return;
		}

		const error = validateRules(editorText);
		if (error) {
			setRuleError(error);
			return;
		}

		const tipValidationError = validateTip();
		if (tipValidationError) {
			setTipError(tipValidationError);
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

				const shouldTip = tippingEnabled && tipAmount && parseFloat(tipAmount) > 0;

				if (shouldTip && libs.tipAndCreateComment) {
					comment = await libs.tipAndCreateComment({
						commentsId,
						parentId,
						content: plainText,
						tipAssetId: rules.tipAssetId,
						quantity: tipAmount,
					});
				} else if (postAsPortal && portalId) {
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
				setTipAmount('');
				setTipError(null);

				window.dispatchEvent(
					new CustomEvent('commentAdded', {
						detail: { comment, commentsId },
					})
				);

				if (onCommentAdded && comment) {
					onCommentAdded(comment);
				}
			}
		} catch (err: any) {
			console.error('Failed to save comment:', err);
			const msg = err?.message || String(err);
			if (msg.includes('Tip-Receipt-Id') || msg.includes('TipAssetId') || msg.includes('below minimum')) {
				setTipError(msg);
			} else {
				setRuleError(msg);
			}
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

	const validateRules = (text: string): string | null => {
		if (!rules) return null;

		// 1. Profile Age Check
		const dateCreated = profile?.dateCreated || profile?.createdAt;
		if (rules.profileAgeRequired > 0 && dateCreated) {
			const profileAge = Date.now() - dateCreated;
			if (profileAge < rules.profileAgeRequired) {
				const daysRequired = Math.ceil(rules.profileAgeRequired / (24 * 60 * 60 * 1000));
				return `Your profile must be at least ${daysRequired} days old to comment.`;
			}
		}

		// 2. Profile Thumbnail Check
		if (rules.requireProfileThumbnail && !profile?.thumbnail) {
			return 'You must have a profile picture to comment.';
		}

		// 3. Muted Words Check
		if (rules.mutedWords?.length > 0) {
			const lowerText = text.toLowerCase();
			const foundWord = rules.mutedWords.find((word: string) => lowerText.includes(word.toLowerCase()));
			if (foundWord) {
				return `Your comment contains a blocked word: "${foundWord}"`;
			}
		}

		return null;
	};

	const handleEditorChange = () => {
		editor.getEditorState().read(() => {
			const root = $getRoot();
			const text = root.getTextContent();
			setEditorText(text);
			const trimmedText = text.trim();
			const isDuplicate = checkForDuplicate(trimmedText);

			const error = validateRules(text);
			setRuleError(error);

			setCanSend(trimmedText.length > 0 && text.length <= MAX_EDITOR_LENGTH && !isDuplicate && !error);
		});
	};

	const handleEditorClick = (e: React.MouseEvent) => {
		// Focus the editor when clicking on the container
		if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('editor-input')) {
			editor.focus();
		}
	};

	const handleTipAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		if (value === '' || /^\d*\.?\d*$/.test(value)) {
			setTipAmount(value);
			setTipError(null);
		}
	};

	const roles = Array.isArray(profile?.roles) ? profile.roles : profile?.roles ? [profile.roles] : [];
	return (
		<>
			{ruleError && <S.RuleError>{ruleError}</S.RuleError>}
			{tipError && <S.RuleError>{tipError}</S.RuleError>}
			<S.Editor onClick={handleEditorClick}>
				{portalId && !isEditMode && roles && (roles.includes('Admin') || roles.includes('Moderator')) && (
					<S.AuthorSelector ref={dropdownRef}>
						<S.AuthorIconWrapper
							onClick={(e: React.MouseEvent) => {
								e.stopPropagation();
								setShowAuthorDropdown(!showAuthorDropdown);
							}}
						>
							{postAsPortal ? <Avatar profile={portalProfile} size={24} /> : <Avatar profile={profile} size={24} />}
						</S.AuthorIconWrapper>
						{showAuthorDropdown && (
							<S.AuthorDropdown>
								<S.AuthorOption
									onClick={() => {
										setPostAsPortal(false);
										setShowAuthorDropdown(false);
									}}
									$active={!postAsPortal}
								>
									<Avatar profile={profile} size={20} />
									<span>{profile?.displayName || 'User'}</span>
								</S.AuthorOption>
								<S.AuthorOption
									onClick={() => {
										setPostAsPortal(true);
										setShowAuthorDropdown(false);
									}}
									$active={postAsPortal}
								>
									<Avatar profile={portalProfile} size={20} />
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

			{tippingEnabled && (
				<S.TipAttachment>
					{tipRequired && <S.TipRequired>Tip required</S.TipRequired>}
					<S.TipInput
						type="text"
						inputMode="decimal"
						placeholder={
							rules?.minTipAmount && rules.minTipAmount !== '0' ? `Min: ${rules.minTipAmount}` : 'Tip amount'
						}
						value={tipAmount}
						onChange={handleTipAmountChange}
					/>
				</S.TipAttachment>
			)}

			<OnChangePlugin onChange={handleEditorChange} />
			<HistoryPlugin />
			{showProfileManage && (
				<ModalPortal>
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
				</ModalPortal>
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

	const roles = Array.isArray(profile?.roles) ? profile.roles : profile?.roles ? [profile.roles] : [];

	const hasAuthorIcon = Boolean(portalId && !isEditMode && roles.some((r) => ['Admin', 'Moderator'].includes(r)));

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
