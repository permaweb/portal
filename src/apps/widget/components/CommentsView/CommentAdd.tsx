import React from 'react';
import styled from 'styled-components';

import { usePermawebProvider } from '../../providers/WidgetPermawebProvider';
import { useWalletProvider } from '../../providers/WalletBridgeProvider';
import { useCommentRules } from '../../hooks/useComments';
import { EmojiPicker } from '../shared/EmojiPicker';

// ---------------------------------------------------------------------------
// Styled components
// ---------------------------------------------------------------------------

const MAX_CHARS = 500;

const Wrapper = styled.div<{ $active: boolean }>`
	display: flex;
	flex-direction: column;
	gap: 6px;
	opacity: ${(p) => (p.$active ? 1 : 0.6)};
`;

const EditorRow = styled.div`
	display: flex;
	align-items: flex-end;
	gap: 8px;
	background: var(--widget-input-bg);
	border: 1px solid var(--widget-border);
	border-radius: 8px;
	padding: 8px 10px;
	transition: border-color 0.15s;

	&:focus-within {
		border-color: var(--widget-primary);
	}
`;

const StyledTextarea = styled.textarea`
	flex: 1;
	background: transparent;
	border: none;
	outline: none;
	resize: none;
	color: var(--widget-text);
	font-family: inherit;
	font-size: 13px;
	line-height: 1.5;
	min-height: 36px;
	max-height: 120px;
	overflow-y: auto;

	&::placeholder {
		color: var(--widget-text);
		opacity: 0.4;
	}

	scrollbar-width: thin;
	scrollbar-color: var(--widget-border) transparent;

	&::-webkit-scrollbar {
		width: 4px;
	}

	&::-webkit-scrollbar-thumb {
		background: var(--widget-border);
		border-radius: 2px;
	}
`;

const Controls = styled.div`
	display: flex;
	align-items: center;
	gap: 6px;
	flex-shrink: 0;
`;

const SendButton = styled.button<{ $active: boolean }>`
	display: flex;
	align-items: center;
	justify-content: center;
	background: ${(p) => (p.$active ? 'var(--widget-primary)' : 'var(--widget-border)')};
	border: none;
	border-radius: 6px;
	width: 30px;
	height: 30px;
	cursor: ${(p) => (p.$active ? 'pointer' : 'not-allowed')};
	transition: background 0.15s, opacity 0.15s;
	flex-shrink: 0;
	color: #fff;
	font-size: 14px;

	&:hover {
		opacity: ${(p) => (p.$active ? 0.85 : 1)};
	}
`;

const CancelButton = styled.button`
	display: flex;
	align-items: center;
	justify-content: center;
	background: transparent;
	border: 1px solid var(--widget-border);
	border-radius: 6px;
	width: 30px;
	height: 30px;
	cursor: pointer;
	color: var(--widget-text);
	font-size: 16px;
	transition: border-color 0.15s;

	&:hover {
		border-color: var(--widget-text);
	}
`;

const Footer = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
`;

const CharCount = styled.span<{ $over: boolean }>`
	font-size: 11px;
	color: ${(p) => (p.$over ? '#ef4444' : 'var(--widget-text)')};
	opacity: ${(p) => (p.$over ? 1 : 0.4)};
`;

const RuleError = styled.div`
	font-size: 12px;
	color: #ef4444;
	padding: 4px 0;
`;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface CommentAddProps {
	commentsId: string;
	parentId?: string;
	initialContent?: string;
	isEditMode?: boolean;
	commentId?: string;
	onCommentAdded?: (content: string) => void;
	onSubmittingChange?: (isSubmitting: boolean) => void;
	onCancel?: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CommentAdd(props: CommentAddProps) {
	const {
		commentsId,
		parentId,
		initialContent = '',
		isEditMode = false,
		commentId,
		onCommentAdded,
		onSubmittingChange,
		onCancel,
	} = props;

	const { profile, libs } = usePermawebProvider();
	const { walletAddress } = useWalletProvider();
	const { rules } = useCommentRules(commentsId);

	const [text, setText] = React.useState(initialContent);
	const [isSubmitting, setIsSubmitting] = React.useState(false);
	const [ruleError, setRuleError] = React.useState<string | null>(null);

	const textareaRef = React.useRef<HTMLTextAreaElement>(null);

	const isLoggedIn = Boolean(walletAddress && profile?.id);
	const charCount = text.length;
	const isOver = charCount > MAX_CHARS;
	const canSend = isLoggedIn && text.trim().length > 0 && !isOver && !isSubmitting && !ruleError;

	// Sync initialContent when entering edit mode
	React.useEffect(() => {
		if (isEditMode && initialContent) {
			setText(initialContent);
		}
	}, [isEditMode, initialContent]);

	// Auto-grow textarea
	function autoResize(el: HTMLTextAreaElement) {
		el.style.height = 'auto';
		el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
	}

	function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
		const value = e.target.value;
		setText(value);
		autoResize(e.target);

		const error = validateRules(value);
		setRuleError(error);
	}

	function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			if (canSend) {
				void handleSubmit();
			}
		}
	}

	function handleEmojiInsert(emoji: string) {
		const el = textareaRef.current;
		if (!el) {
			setText((prev) => prev + emoji);
			return;
		}

		const start = el.selectionStart ?? text.length;
		const end = el.selectionEnd ?? text.length;
		const newText = text.slice(0, start) + emoji + text.slice(end);
		setText(newText);

		// Restore caret position after React re-render
		requestAnimationFrame(() => {
			el.selectionStart = start + emoji.length;
			el.selectionEnd = start + emoji.length;
			el.focus();
			autoResize(el);
		});

		const error = validateRules(newText);
		setRuleError(error);
	}

	function validateRules(value: string): string | null {
		if (!rules) return null;

		// Profile age check
		const dateCreated = profile?.dateCreated || profile?.createdAt;
		if (rules.profileAgeRequired > 0 && dateCreated) {
			const age = Date.now() - dateCreated;
			if (age < rules.profileAgeRequired) {
				const days = Math.ceil(rules.profileAgeRequired / (24 * 60 * 60 * 1000));
				return `Your profile must be at least ${days} days old to comment.`;
			}
		}

		// Profile thumbnail check
		if (rules.requireProfileThumbnail && !profile?.thumbnail) {
			return 'You must have a profile picture to comment.';
		}

		// Muted words check
		if (rules.mutedWords?.length > 0) {
			const lower = value.toLowerCase();
			const found = rules.mutedWords.find((word: string) => lower.includes(word.toLowerCase()));
			if (found) {
				return `Your comment contains a blocked word: "${found}"`;
			}
		}

		return null;
	}

	function checkForDuplicate(_text: string): boolean {
		// In widget mode we do not have a cached comment list to compare against,
		// so this is a lightweight guard. Duplicate detection is intentionally minimal here.
		return false;
	}

	async function handleSubmit() {
		if (!canSend || isSubmitting) return;

		if (!profile?.id) {
			console.log('[CommentAdd] No profile found. User must create a profile to comment.');
			return;
		}

		const trimmed = text.trim();
		if (!trimmed) return;

		if (!isEditMode && checkForDuplicate(trimmed)) return;

		setIsSubmitting(true);
		onSubmittingChange?.(true);

		try {
			if (isEditMode) {
				const result = await libs.updateCommentContent({
					commentsId,
					commentId,
					content: trimmed,
				});
				if (result) {
					onCommentAdded?.(trimmed);
				}
			} else {
				const comment = await libs.createComment({
					commentsId,
					parentId,
					content: trimmed,
				});

				setText('');
				if (textareaRef.current) {
					textareaRef.current.style.height = 'auto';
				}

				window.dispatchEvent(
					new CustomEvent('commentAdded', {
						detail: { comment, commentsId },
					})
				);

				if (onCommentAdded && comment) {
					onCommentAdded(comment);
				}
			}
		} catch (err) {
			console.error('[CommentAdd] Failed to save comment:', err);
		} finally {
			setIsSubmitting(false);
			onSubmittingChange?.(false);
		}
	}

	const placeholder = isLoggedIn
		? isEditMode
			? 'Edit your comment...'
			: parentId
			? 'Write a reply...'
			: 'Write a comment...'
		: 'Connect wallet to comment...';

	return (
		<Wrapper $active={isLoggedIn && !isSubmitting}>
			{ruleError && <RuleError>{ruleError}</RuleError>}

			<EditorRow>
				<StyledTextarea
					ref={textareaRef}
					value={text}
					onChange={handleChange}
					onKeyDown={handleKeyDown}
					placeholder={placeholder}
					disabled={!isLoggedIn || isSubmitting}
					rows={1}
					aria-label={placeholder}
				/>

				<Controls>
					<EmojiPicker onInsertEmoji={handleEmojiInsert} />

					{isEditMode && onCancel && (
						<CancelButton onClick={onCancel} title="Cancel" aria-label="Cancel edit">
							&#x2715;
						</CancelButton>
					)}

					<SendButton
						$active={canSend}
						onClick={() => void handleSubmit()}
						disabled={!canSend}
						title={isEditMode ? 'Save' : 'Send'}
						aria-label={isEditMode ? 'Save comment' : 'Send comment'}
					>
						{isSubmitting ? '…' : isEditMode ? '✓' : '↑'}
					</SendButton>
				</Controls>
			</EditorRow>

			<Footer>
				<span />
				<CharCount $over={isOver}>
					{charCount}/{MAX_CHARS}
				</CharCount>
			</Footer>
		</Wrapper>
	);
}
