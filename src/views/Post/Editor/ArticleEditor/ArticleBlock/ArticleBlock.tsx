import { ReactSVG } from 'react-svg';
import { Draggable } from '@hello-pangea/dnd';

import { ContentEditable } from 'components/atoms/ContentEditable';
import { IconButton } from 'components/atoms/IconButton';
import { ARTICLE_BLOCKS, ASSETS } from 'helpers/config';
import { useLanguageProvider } from 'providers/LanguageProvider';

import { MediaBlock } from './CustomBlocks/MediaBlock';
import * as S from './styles';
import { IProps } from './types';

export default function ArticleBlock(props: IProps) {
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	let useCustom: boolean = false;
	let element: any = null;

	switch (props.block.type) {
		case 'paragraph':
			element = 'p';
			break;
		case 'quote':
			element = 'blockquote';
			break;
		case 'ordered-list':
			element = 'ol';
			break;
		case 'unordered-list':
			element = 'ul';
			break;
		case 'code':
			element = 'code';
			break;
		case 'header-1':
			element = 'h1';
			break;
		case 'header-2':
			element = 'h2';
			break;
		case 'header-3':
			element = 'h3';
			break;
		case 'header-4':
			element = 'h4';
			break;
		case 'header-5':
			element = 'h5';
			break;
		case 'header-6':
			element = 'h6';
			break;
		case 'image':
			useCustom = true;
			element = (
				<MediaBlock
					type={'image'}
					content={props.block.content}
					data={props.block.data ?? null}
					onChange={(newContent: any, data: any) => props.onChangeBlock(props.block.id, newContent, data)}
				/>
			);
			break;
		case 'video':
			useCustom = true;
			element = (
				<MediaBlock
					type={'video'}
					content={props.block.content}
					data={props.block.data ?? null}
					onChange={(newContent: any, data: any) => props.onChangeBlock(props.block.id, newContent, data)}
				/>
			);
			break;
		default:
			element = 'p';
			break;
	}

	const handleMouseUp = () => {
		const selection = window.getSelection();
		if (selection) {
			console.log(selection.toString());
		}
	};

	function getElementToolbar() {
		return (
			<S.ElementToolbar tabIndex={-1}>
				<S.EToolbarHeader>
					<span>{ARTICLE_BLOCKS[props.block.type].label}</span>
				</S.EToolbarHeader>
				<S.EToolbarDelete>
					<IconButton
						type={'primary'}
						active={false}
						src={ASSETS.delete}
						handlePress={() => props.onDeleteBlock(props.block.id)}
						dimensions={{ wrapper: 23.5, icon: 13.5 }}
						tooltip={language.deleteBlock}
						tooltipPosition={'bottom-right'}
						noFocus
					/>
				</S.EToolbarDelete>
			</S.ElementToolbar>
		);
	}

	function getElement() {
		return (
			<S.ElementWrapper blockEditMode={props.blockEditMode} onFocus={props.onFocus} className={'fade-in'}>
				<S.ElementIndicator className={'fade-in'}>{getElementToolbar()}</S.ElementIndicator>
				<S.Element blockEditMode={props.blockEditMode} type={props.block.type} onMouseUp={handleMouseUp}>
					{useCustom ? (
						element
					) : (
						<ContentEditable
							element={element}
							value={props.block.content}
							onChange={(newContent: any) => props.onChangeBlock(props.block.id, newContent)}
							autoFocus={props.autoFocus}
						/>
					)}
				</S.Element>
				<S.ElementIndicatorDivider className={'fade-in'} />
			</S.ElementWrapper>
		);
	}

	if (props.blockEditMode) {
		return (
			<Draggable draggableId={props.block.id} index={props.index}>
				{(provided) => (
					<S.ElementDragWrapper
						ref={provided.innerRef}
						{...provided.draggableProps}
						{...provided.dragHandleProps}
						onFocus={props.onFocus}
						tabIndex={-1}
					>
						<S.EDragWrapper>
							<S.EDragHandler tabIndex={-1}>
								<ReactSVG src={ASSETS.drag} />
							</S.EDragHandler>
						</S.EDragWrapper>
						{getElement()}
					</S.ElementDragWrapper>
				)}
			</Draggable>
		);
	}

	return getElement();
}
