import React from 'react';
import {
	CompositeDecorator,
	convertToRaw,
	Editor,
	EditorState,
	getDefaultKeyBinding,
	KeyBindingUtil,
	Modifier,
	RichUtils,
} from 'draft-js';
import 'draft-js/dist/Draft.css';
import EmojiPicker from 'emoji-picker-react';
import Icon from 'engine/components/icon';
import * as ICONS from 'engine/constants/icons';
import { usePermawebProvider } from 'providers/PermawebProvider';
// import { useArweaveProvider } from 'providers/ArweaveProvider';
import * as S from './styles';

export default function CommentAdd(props: any) {
	const { assetId, parentId } = props;	
  const { hasCommandModifier } = KeyBindingUtil;
	const { profile, libs } = usePermawebProvider();
	// const arProvider = useArweaveProvider();
	const MAX_EDITOR_LENGTH = 500;
	const emojiPickerRef = React.useRef(null);

	React.useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
				setEmojiDropdownActive(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

  const findLinkEntities = (contentBlock: any, callback: any, contentState: any) => {
		contentBlock.findEntityRanges((character: any) => {
			const entityKey = character.getEntity();
			return entityKey !== null && contentState.getEntity(entityKey).getType() === 'LINK';
		}, callback);
	};

	// @ts-ignore
  const Link = ({ contentState, entityKey, children }) => {
		const { url } = contentState.getEntity(entityKey).getData();
		return (
			<a href={url} target={'_blank'} rel={'noopener noreferrer'}>
				{children}
			</a>
		);
	};

  const linkDecorator = new CompositeDecorator([
		{
			strategy: findLinkEntities,
			component: Link,
		},
	]);

  const [editorState, setEditorState] = React.useState(() => EditorState.createEmpty(linkDecorator));
	// @ts-ignore
	const [messageActive, setMessageActive] = React.useState<boolean>(false);
	// @ts-ignore
	const [files, setFiles] = React.useState<any[]>([]);
  const [boldModeActive, setBoldModeActive] = React.useState<boolean>(false);
	const [italicModeActive, setItalicModeActive] = React.useState<boolean>(false);
	const [underlineModeActive, setUnderlineModeActive] = React.useState<boolean>(false);
	const [codeModeActive, setCodeModeActive] = React.useState<boolean>(false);
	const [canSend, setCanSend] = React.useState(false);

	const [emojiDropdownActive, setEmojiDropdownActive] = React.useState<boolean>(false);


  const editorRef = React.useRef<Editor | null>(null);
	

  const mapKeyToEditorCommand = (e: React.KeyboardEvent) => {
		if (e.keyCode === 83 && hasCommandModifier(e)) {
			return 'myeditor-save';
		}

		if (e.keyCode === 13 && e.shiftKey) {
			return 'insert-line-break';
		}

		if (e.keyCode === 13) {
			return 'submit-message';
		}

		return getDefaultKeyBinding(e);
	};

  const handleKeyCommand = (command: string, editorState: EditorState) => {
		if (command === 'submit-message' && !getSubmitDisabled(editorState)) {
			handleSubmit();
			return 'handled';
		}

		if (command === 'insert-line-break') {
			const selection = editorState.getSelection();
			let contentState = editorState.getCurrentContent();
			const currentBlock = contentState.getBlockForKey(selection.getStartKey());
			const hasLinkStyle = currentBlock.getInlineStyleAt(selection.getStartOffset() - 1).has('LINK');

			if (hasLinkStyle) {
				contentState = Modifier.removeInlineStyle(contentState, selection, 'LINK');

				contentState = Modifier.insertText(contentState, selection, ' ');

				const newEditorState = EditorState.push(editorState, contentState, 'change-inline-style');
				setEditorState(newEditorState);
			} else {
				contentState = Modifier.splitBlock(contentState, selection);
				const newEditorState = EditorState.push(editorState, contentState, 'split-block');
				setEditorState(newEditorState);
			}
			return 'handled';
		}

		const newState = RichUtils.handleKeyCommand(editorState, command);
		switch (command) {
			case 'bold':
				setBoldModeActive(!boldModeActive);
				break;
			case 'italic':
				setItalicModeActive(!italicModeActive);
				break;
			case 'underline':
				setUnderlineModeActive(!underlineModeActive);
				break;
			case 'code':
				handleCode();
				return;
			default:
				break;
		}
		if (newState) {
			setEditorState(newState);
			return 'handled';
		}
		return 'not-handled';
	};

	const resetEditor = () => {
		const emptyState = EditorState.createEmpty();
		setEditorState(emptyState);
	}

  const handleSubmit = async () => {
		console.log('Submit')
		const rawContent = convertToRaw(editorState.getCurrentContent());
		const plainText = rawContent.blocks.map(block => block.text).join('\n');

		const commentId = await libs.createComment({
			content: plainText,
			creator: profile.id,
			parentId: assetId,
		});

		if(commentId) resetEditor()
	};

  function checkEmptyEditor(editorState: EditorState) {
		const plainText = editorState.getCurrentContent().getPlainText();
		return !plainText.trim().length;
	}

  const handleCode = () => {
		const newState = RichUtils.toggleInlineStyle(editorState, 'CODE');
		setCodeModeActive(!codeModeActive);
		setEditorState(newState);
	};

	const handleEmoji = (emojiData: any, _e: any) => {
		const emoji = emojiData.emoji;
		const currentContent = editorState.getCurrentContent();
		const currentSelection = editorState.getSelection();
		const newContent = Modifier.insertText(currentContent, currentSelection, emoji);
		const newEditorState = EditorState.push(editorState, newContent, 'insert-characters');
		setEditorState(newEditorState);
	};

  function checkInvalidEditorLength(editorState: EditorState) {
		return editorState.getCurrentContent().getPlainText().length >= MAX_EDITOR_LENGTH;
	}

  function getSubmitDisabled(editorState: EditorState) {
		if (files && files.length) return false;
		return checkEmptyEditor(editorState) || checkInvalidEditorLength(editorState);
	}

  function handleEditorChange(newEditorState: EditorState) {
		setEditorState(newEditorState);
		const rawContent = convertToRaw(editorState.getCurrentContent());
		const plainText = rawContent.blocks.map(block => block.text).join('\n');
		setCanSend(plainText.length>0)
	}

  function getPlaceholder() {
		// if (!profile || !profile.walletAddress) return language.connectToPost;
		// return props.placeholder ? props.placeholder : language.postPlaceholder;
		return '';
	}

  const customStyleMap = {
    default: { backgroundColor: 'white', color: 'black' },
    BOLD: { fontWeight: 'bold' },
    ITALIC: { fontStyle: 'italic' },
    UNDERLINE: { textDecoration: 'underline' },
    RED: { color: 'red' },
    HIGHLIGHT: { backgroundColor: 'yellow' }
  };

  return (
    <S.CommentAdd $active={Boolean(profile)}>
      <S.Editor>
        <Editor
          ref={editorRef}
          // customStyleMap={EDITOR_STYLE_MAP(theme)}
          customStyleMap={customStyleMap}
          editorState={editorState}
					// @ts-ignore
          handleKeyCommand={handleKeyCommand}
          onChange={handleEditorChange}
          onFocus={() => setMessageActive(true)}
          onBlur={() => setMessageActive(false)}
          keyBindingFn={mapKeyToEditorCommand}
          placeholder={profile ? !parentId ? 'Write a comment...' : 'Write a reply...' : 'Login to write a comment...'}
        />
				<S.Actions>
					<S.Emojis>
						<S.EmojisIcon
							onClick={() => setEmojiDropdownActive(!emojiDropdownActive)}
						>
							<Icon icon={ICONS.EMOJI} />
						</S.EmojisIcon>
						{emojiDropdownActive && (
							<S.EmojiPicker ref={emojiPickerRef}>
								<EmojiPicker
									// theme={settingsProvider.currentTheme as any}
									width="350px"
									theme="dark"
									emojiStyle="twitter"
									skinTonesDisabled
									onEmojiClick={(emojiData: any, e: any) => handleEmoji(emojiData, e)}
								/>
							</S.EmojiPicker>
						)}  
					</S.Emojis>
					<S.Send onClick={() => handleSubmit()} $active={canSend}>
						<Icon icon={ICONS.SEND} />
					</S.Send>
				</S.Actions>
      </S.Editor>                
    </S.CommentAdd>    
  )
}