import { useRef } from 'react';
import { useSelector } from 'react-redux';
import { ReactSVG } from 'react-svg';

import { EditorStoreRootState } from 'editor/store';

import { ICONS } from 'helpers/config';

import * as S from './styles';

const DEFAULT_HEIGHT = 50;
const DEFAULT_WIDTH = 1;
const MIN_HEIGHT = 20;
const MIN_WIDTH = 1;

export default function SpacerBlock(props: {
	type: 'post' | 'page';
	direction: 'horizontal' | 'vertical';
	data: any;
	onChange: any;
}) {
	const isResizing = useRef(false);
	const startPos = useRef<{ x: number; y: number; side?: 'left' | 'right' | 'top' | 'bottom' }>({ x: 0, y: 0 });
	const startSize = useRef({ width: 0, height: 0 });

	const currentReducer = useSelector((state: EditorStoreRootState) => {
		switch (props.type) {
			case 'post':
				return state.currentPost;
			case 'page':
				return state.currentPage;
			default:
				return state.currentPost;
		}
	});

	function getIcon() {
		switch (props.direction) {
			case 'horizontal':
				return ICONS.spacerHorizontal;
			case 'vertical':
				return ICONS.spacerVertical;
			default:
				return null;
		}
	}

	function getHeight() {
		return props.data?.height ?? (props.direction === 'vertical' ? DEFAULT_HEIGHT : null);
	}

	function getWidth() {
		return props.data?.width ?? (props.direction === 'horizontal' ? DEFAULT_WIDTH : null);
	}

	function handleResizeStart(e: React.MouseEvent, side: 'left' | 'right' | 'top' | 'bottom') {
		e.preventDefault();
		e.stopPropagation();
		isResizing.current = true;
		startPos.current = { x: e.clientX, y: e.clientY, side };
		startSize.current = {
			width: getWidth() || DEFAULT_WIDTH,
			height: getHeight() || DEFAULT_HEIGHT,
		};

		document.addEventListener('mousemove', handleResizeMove);
		document.addEventListener('mouseup', handleResizeEnd);
	}

	function handleResizeMove(e: MouseEvent) {
		if (!isResizing.current) return;

		if (props.direction === 'horizontal') {
			// For horizontal spacer, adjust width based on horizontal drag
			const deltaX = e.clientX - startPos.current.x;
			const widthChange = deltaX / 100; // Scale factor for flex width
			const newWidth = Math.max(MIN_WIDTH, startSize.current.width + widthChange);

			props.onChange({ ...props.data, width: newWidth });
		} else if (props.direction === 'vertical') {
			// For vertical spacer, adjust height based on vertical drag
			const deltaY = e.clientY - startPos.current.y;
			// When dragging from top, invert the delta (drag up = negative delta = increase height)
			const heightChange = startPos.current.side === 'top' ? -deltaY : deltaY;
			const newHeight = Math.max(MIN_HEIGHT, startSize.current.height + heightChange);

			props.onChange({ ...props.data, height: newHeight });
		}
	}

	function handleResizeEnd() {
		isResizing.current = false;
		document.removeEventListener('mousemove', handleResizeMove);
		document.removeEventListener('mouseup', handleResizeEnd);
	}

	return (
		<S.Wrapper blockEditMode={currentReducer?.editor.blockEditMode} height={getHeight()}>
			{currentReducer?.editor.blockEditMode && <ReactSVG src={getIcon()} />}
			{props.direction === 'vertical' && (
				<>
					<S.ResizeHandle $side={'top'} onMouseDown={(e) => handleResizeStart(e, 'top')} />
					<S.ResizeHandle $side={'bottom'} onMouseDown={(e) => handleResizeStart(e, 'bottom')} />
				</>
			)}
		</S.Wrapper>
	);
}
