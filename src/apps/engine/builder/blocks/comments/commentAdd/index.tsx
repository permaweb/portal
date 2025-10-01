import * as React from 'react';
import { ReactSVG } from 'react-svg';
import { $getRoot, $getSelection } from 'lexical';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $insertNodes, COMMAND_PRIORITY_HIGH, KEY_ENTER_COMMAND, TextNode } from 'lexical';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { ICONS } from 'helpers/config';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';

import EmojiPicker from './emojiPicker';
import * as S from './styles';

const MAX_EDITOR_LENGTH = 500;

function CommentEditorContent(props: any) {
	const { commentsId, parentId, existingComments = [], onCommentAdded, onSubmittingChange } = props;
	const [editor] = useLexicalComposerContext();
	const { profile, libs } = usePermawebProvider();
	const [canSend, setCanSend] = React.useState(false);
	const [editorText, setEditorText] = React.useState('');
	const [isSubmitting, setIsSubmitting] = React.useState(false);

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
		if (!canSend || !profile?.id || isSubmitting) return;

		const plainText = editorText.trim();
		if (!plainText || checkForDuplicate(plainText)) return;

		setIsSubmitting(true);
		onSubmittingChange?.(true);
		try {
			const comment = await libs.createComment({
				commentsId,
				content: plainText,
			});

			// Clear the editor after successful submission
			editor.update(() => {
				const root = $getRoot();
				root.clear();
			});
			setEditorText('');
			setCanSend(false);

			// Notify parent component to refresh comments
			if (onCommentAdded && comment) {
				onCommentAdded(comment);
			} else {
				// Fallback: dispatch custom event for parent to listen to
				window.dispatchEvent(
					new CustomEvent('commentAdded', {
						detail: { comment, commentsId },
					})
				);
			}
		} catch (error) {
			console.error('Failed to create comment:', error);
		} finally {
			setIsSubmitting(false);
			onSubmittingChange?.(false);
		}
	};

	const checkForDuplicate = (text: string) => {
		if (!profile?.id || !existingComments.length) return false;

		const normalizedText = text.trim().toLowerCase();
		return existingComments.some(
			(comment: any) => comment.author?.id === profile.id && comment.content?.trim().toLowerCase() === normalizedText
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

	return (
		<>
			<S.Editor onClick={handleEditorClick}>
				<ContentEditable className="editor-input" />
				<S.Actions>
					<EmojiPicker onInsertEmoji={handleEmoji} />
					<S.Send onClick={handleSubmit} $active={canSend && !isSubmitting}>
						<ReactSVG src={ICONS.send} />
					</S.Send>
				</S.Actions>
			</S.Editor>
			<OnChangePlugin onChange={handleEditorChange} />
			<HistoryPlugin />
		</>
	);
}

export default function CommentAdd(props: any) {
	const { commentsId, parentId } = props;
	const { profile } = usePermawebProvider();
	const { walletAddress } = useArweaveProvider();
	const [isSubmitting, setIsSubmitting] = React.useState(false);

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
		? !parentId
			? 'Write a comment...'
			: 'Write a reply...'
		: 'Login to write a comment...';

	return (
		<S.CommentAdd $active={isLoggedIn && !isSubmitting}>
			<LexicalComposer initialConfig={initialConfig}>
				<PlainTextPlugin
					contentEditable={
						<CommentEditorContent
							commentsId={commentsId}
							parentId={parentId}
							existingComments={props.existingComments}
							onCommentAdded={props.onCommentAdded}
							onSubmittingChange={setIsSubmitting}
						/>
					}
					placeholder={<div className="editor-placeholder">{placeholder}</div>}
					ErrorBoundary={LexicalErrorBoundary}
				/>
			</LexicalComposer>
		</S.CommentAdd>
	);
}
