import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ReactSVG } from 'react-svg';
import {
	CollisionDetection,
	DndContext,
	DragEndEvent,
	DragOverEvent,
	DragOverlay,
	DragStartEvent,
	KeyboardSensor,
	PointerSensor,
	pointerWithin,
	UniqueIdentifier,
	useDraggable,
	useDroppable,
	useSensor,
	useSensors,
} from '@dnd-kit/core';

import { usePortalProvider } from 'editor/providers/PortalProvider';
import { useSettingsProvider } from 'editor/providers/SettingsProvider';

import { Button } from 'components/atoms/Button';
import { FormField } from 'components/atoms/FormField';
import { IconButton } from 'components/atoms/IconButton';
import { Loader } from 'components/atoms/Loader';
import { Select } from 'components/atoms/Select';
import { ICONS, POST_PREVIEWS, URLS } from 'helpers/config';
import { getTxEndpoint } from 'helpers/endpoints';
import { getThemeVars } from 'helpers/themes';
import { PortalPatchMapEnum, SelectOptionType } from 'helpers/types';
import { fixBooleanStrings, isMac } from 'helpers/utils';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { useNotifications } from 'providers/NotificationProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';

import * as S from './styles';

const SAMPLE_POST = {
	id: 'sample-post',
	name: 'Sample Post Title',
	creator: null,
	metadata: {
		thumbnail: 'WnMy_B8jZcGuvhHUsOCNOI1cNZHj3kFSJ7bfhxiHzpQ',
		description:
			'This preview description is intentionally long so you can see how max character limits behave. Use the settings panel to adjust max characters, spacing, and layout, then confirm truncation and ellipsis behavior in the live preview as you edit your template.',
		releaseDate: Date.now(),
		categories: [{ name: 'Technology' }, { name: 'Design' }],
		topics: ['react', 'typescript', 'web'],
		status: 'published',
	},
};

const POST_PREVIEW_BLOCKS: Record<string, { label: string; icon: string }> = {
	title: { label: 'Title', icon: ICONS.header1 },
	thumbnail: { label: 'Thumbnail', icon: ICONS.image },
	description: { label: 'Description', icon: ICONS.paragraph },
	author: { label: 'Author', icon: ICONS.user },
	date: { label: 'Date', icon: ICONS.time },
	categories: { label: 'Categories', icon: ICONS.filter },
	tags: { label: 'Tags', icon: ICONS.text },
	comments: { label: 'Comments', icon: ICONS.comments },
};

function normalizeAspectRatio(value?: string) {
	if (!value) return undefined;
	return value.replace(/\s*\/\s*/g, ' / ');
}

type SettingField = {
	key: string;
	label: string;
	type: 'select' | 'number' | 'text' | 'range';
	options?: SelectOptionType[];
	placeholder?: string;
	showIf?: { key: string; value: string };
	min?: number;
	max?: number;
	step?: number;
};

const BLOCK_SETTINGS: Record<string, SettingField[]> = {
	thumbnail: [
		{ key: 'flex', label: 'Flex', type: 'number', placeholder: '1' },
		{
			key: 'aspectRatio',
			label: 'Aspect Ratio',
			type: 'select',
			options: [
				{ id: '16/6', label: '16/6' },
				{ id: '16/9', label: '16/9' },
				{ id: '4/3', label: '4/3' },
				{ id: '1/1', label: '1/1' },
			],
		},
		{
			key: 'objectFit',
			label: 'Object Fit',
			type: 'select',
			options: [
				{ id: 'cover', label: 'Cover' },
				{ id: 'contain', label: 'Contain' },
				{ id: 'fill', label: 'Fill' },
			],
		},
	],
	categories: [
		{ key: 'maxCount', label: 'Max Categories', type: 'number', placeholder: '1' },
		{
			key: 'showBackground',
			label: 'Show Background',
			type: 'select',
			options: [
				{ id: '', label: 'Yes' },
				{ id: 'false', label: 'No' },
			],
		},
		{
			key: 'filter',
			label: 'Filter',
			type: 'select',
			options: [
				{ id: '', label: 'None' },
				{ id: 'invert', label: 'Invert' },
			],
		},
		{
			key: 'topLine',
			label: 'Top Line',
			type: 'select',
			options: [
				{ id: '', label: 'No' },
				{ id: 'true', label: 'Yes' },
			],
		},
	],
	title: [{ key: 'flex', label: 'Flex', type: 'number', placeholder: '1' }],
	description: [
		{ key: 'flex', label: 'Flex', type: 'number', placeholder: '1' },
		{ key: 'maxChars', label: 'Max Characters', type: 'number', placeholder: '320' },
	],
	author: [
		{
			key: 'showAvatar',
			label: 'Show Avatar',
			type: 'select',
			options: [
				{ id: '', label: 'Yes' },
				{ id: 'false', label: 'No' },
			],
		},
		{
			key: 'width',
			label: 'Width',
			type: 'select',
			options: [
				{ id: '', label: 'Fit Content' },
				{ id: 'flex', label: 'Flex' },
			],
		},
		{ key: 'flex', label: 'Flex Value', type: 'number', placeholder: '1', showIf: { key: 'width', value: 'flex' } },
	],
	date: [
		{
			key: 'width',
			label: 'Width',
			type: 'select',
			options: [
				{ id: '', label: 'Fit Content' },
				{ id: 'flex', label: 'Flex' },
			],
		},
		{ key: 'flex', label: 'Flex Value', type: 'number', placeholder: '1', showIf: { key: 'width', value: 'flex' } },
	],
	tags: [],
	comments: [
		{
			key: 'hideWhenEmpty',
			label: 'Hide When Empty',
			type: 'select',
			options: [
				{ id: '', label: 'Yes' },
				{ id: 'false', label: 'No' },
			],
		},
		{ key: 'maxCount', label: 'Max Comments', type: 'number', placeholder: '10' },
		{
			key: 'sortOrder',
			label: 'Sort Order',
			type: 'select',
			options: [
				{ id: '', label: 'Newest First' },
				{ id: 'asc', label: 'Oldest First' },
			],
		},
	],
};

const POST_SETTINGS: SettingField[] = [
	{ key: 'gap', label: 'Gap', type: 'range', min: 0, max: 40, step: 1 },
	{ key: 'padding', label: 'Padding', type: 'range', min: 0, max: 40, step: 1 },
];

type BlockLayout = {
	flex?: number;
	aspectRatio?: string;
	objectFit?: string;
	position?: string;
	filter?: string;
	direction?: string;
	gap?: string;
	maxCount?: number;
	showAvatar?: string;
	topLine?: string;
	showBackground?: string;
	hideWhenEmpty?: string;
	sortOrder?: string;
	width?: string;
	maxChars?: string;
};

type LayoutBlock = { id: string; type: string; layout?: BlockLayout; children?: LayoutBlock[] };
type LayoutColumn = { id: string; blocks: LayoutBlock[] };
type LayoutRow = { id: string; columns: LayoutColumn[] };

type PostPreviewTemplate = {
	id: string;
	name: string;
	type: string;
	layout: { direction?: string; gap?: string; padding?: string };
	rows: LayoutRow[];
};

function generateId() {
	return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

const customCollisionDetection: CollisionDetection = (args) => {
	const collisions = pointerWithin(args);
	if (collisions.length <= 1) return collisions;

	const blockLevel = collisions.filter((c) => {
		const id = String(c.id);
		return (
			id.startsWith('block-left:') ||
			id.startsWith('block-right:') ||
			id.startsWith('body-block-left:') ||
			id.startsWith('body-block-right:') ||
			id.startsWith('stack:')
		);
	});
	if (blockLevel.length > 0) return blockLevel;

	return collisions;
};

function migrateToRows(content: any[]): LayoutRow[] {
	if (!content || content.length === 0) return [];
	if (content[0]?.columns) {
		return (content as LayoutRow[]).map((row) => ({
			...row,
			columns: (row.columns || []).map((col) => ({
				...col,
				blocks: (col.blocks || []).map((block) => normalizeBlock(block)),
			})),
		}));
	}
	if (content[0]?.blocks) {
		return content.map((row: any) => ({
			id: row.id,
			columns: row.blocks.map((block: any, idx: number) => ({
				id: `col-${row.id}-${idx}`,
				blocks: [normalizeBlock(block)],
			})),
		}));
	}
	return content.map((item, idx) => ({
		id: `row-${idx}`,
		columns: [
			{
				id: `col-${idx}-0`,
				blocks: [
					normalizeBlock({
						id: item.id || `${item.type}-${idx}`,
						type: item.type,
						...(item.layout ? { layout: item.layout } : {}),
						...(item.content ? { children: item.content } : {}),
					}),
				],
			},
		],
	}));
}

function normalizeBlock(block: any): LayoutBlock {
	const normalized: LayoutBlock = {
		id: block.id,
		type: block.type,
		...(block.layout ? { layout: block.layout } : {}),
	};
	if (block.type === 'body' && (block.children || block.content)) {
		const children = (block.children || block.content || []).map((child: any, idx: number) => {
			const normalizedChild =
				typeof child === 'string'
					? { id: child, type: child }
					: {
							id: child.id || `${child.type}-${idx}-${block.id}`,
							type: child.type,
							...(child.layout ? { layout: child.layout } : {}),
							...(child.content ? { children: child.content } : {}),
					  };
			return normalizeBlock(normalizedChild);
		});
		normalized.children = children;
	}
	return normalized;
}

function updateBlockInTree(
	block: LayoutBlock,
	blockId: string,
	updater: (target: LayoutBlock) => LayoutBlock
): LayoutBlock {
	if (block.id === blockId) return updater(block);
	if (block.type === 'body' && block.children) {
		const updatedChildren = block.children.map((child) => updateBlockInTree(child, blockId, updater));
		return { ...block, children: updatedChildren };
	}
	return block;
}

function collectBlockTypes(block: LayoutBlock, set: Set<string>) {
	set.add(block.type);
	if (block.type === 'body' && block.children) {
		block.children.forEach((child) => collectBlockTypes(child, set));
	}
}

function serializeBlock(block: LayoutBlock): any {
	const entry: any = { id: block.id, type: block.type };
	if (block.layout) entry.layout = block.layout;
	if (block.type === 'body' && block.children) {
		entry.content = block.children.map((child) => serializeBlock(child));
	}
	return entry;
}

function serializeRows(rows: LayoutRow[]): any[] {
	return rows.flatMap((row) => row.columns.flatMap((col) => col.blocks.map((block) => serializeBlock(block))));
}

function getBlockById(rows: LayoutRow[], id: UniqueIdentifier): LayoutBlock | null {
	for (const row of rows) {
		for (const col of row.columns) {
			for (const block of col.blocks) {
				if (block.id === id) return block;
				if (block.type === 'body' && block.children) {
					const child = block.children.find((c) => c.id === id);
					if (child) return child;
				}
			}
		}
	}
	return null;
}

function insertIntoBody(
	rows: LayoutRow[],
	bodyId: string,
	targetBlockId: string,
	blockToInsert: LayoutBlock,
	position: 'before' | 'after'
): LayoutRow[] | null {
	let updated = false;
	const newRows = rows.map((row) => ({
		...row,
		columns: row.columns.map((col) => ({
			...col,
			blocks: col.blocks.map((block) => {
				if (block.id !== bodyId || block.type !== 'body' || !block.children) return block;
				const targetIndex = block.children.findIndex((child) => child.id === targetBlockId);
				if (targetIndex === -1) return block;
				const insertAt = position === 'before' ? targetIndex : targetIndex + 1;
				const children = [...block.children];
				children.splice(insertAt, 0, blockToInsert);
				updated = true;
				return { ...block, children };
			}),
		})),
	}));
	return updated ? newRows : null;
}

function inlineGroupInsert(
	rows: LayoutRow[],
	targetLocation: { rowIndex: number; colIndex: number; blockIndex: number; parentBodyId?: string; bodyIndex?: number },
	blockToInsert: LayoutBlock,
	position: 'before' | 'after'
): LayoutRow[] | null {
	const newRows = rows.map((row, rIdx) => {
		if (rIdx !== targetLocation.rowIndex) return row;
		return {
			...row,
			columns: row.columns.map((col, cIdx) => {
				if (cIdx !== targetLocation.colIndex) return col;
				const targetBlock = col.blocks[targetLocation.blockIndex];
				if (!targetBlock) return col;
				const children = position === 'before' ? [blockToInsert, targetBlock] : [targetBlock, blockToInsert];
				const bodyBlock: LayoutBlock = {
					id: `body-${generateId()}`,
					type: 'body',
					layout: { direction: 'row', gap: '10px' },
					children,
				};
				const newBlocks = [...col.blocks];
				newBlocks.splice(targetLocation.blockIndex, 1, bodyBlock);
				return { ...col, blocks: newBlocks };
			}),
		};
	});
	return newRows;
}

function SortableBlock({
	block,
	onDelete,
	isSelected,
	onSelect,
	inline = false,
}: {
	block: LayoutBlock;
	onDelete: () => void;
	isSelected: boolean;
	onSelect: () => void;
	inline?: boolean;
}) {
	const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: block.id });

	const style = {
		transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
		opacity: isDragging ? 0 : 1,
	};

	return (
		<S.BlockWrapper ref={setNodeRef} style={style} $isDragging={isDragging} $inline={inline}>
			<S.Block
				$isSelected={isSelected}
				$compact={block.type !== 'thumbnail'}
				onClick={onSelect}
				style={inline ? { width: '100%' } : undefined}
			>
				<S.BlockHeader>
					<S.BlockHeaderLeft {...attributes} {...listeners}>
						<ReactSVG src={ICONS.drag} />
						<span>{POST_PREVIEW_BLOCKS[block.type]?.label || block.type}</span>
					</S.BlockHeaderLeft>
					<IconButton
						type={'alt1'}
						active={false}
						src={ICONS.delete}
						handlePress={() => onDelete()}
						dimensions={{ wrapper: 22, icon: 12 }}
						noFocus
					/>
				</S.BlockHeader>
				{block.type === 'thumbnail' && (
					<S.BlockContent
						$type={block.type}
						style={
							block.layout?.aspectRatio ? { aspectRatio: normalizeAspectRatio(block.layout.aspectRatio) } : undefined
						}
					>
						<ReactSVG src={POST_PREVIEW_BLOCKS[block.type]?.icon || ICONS.article} />
					</S.BlockContent>
				)}
			</S.Block>
		</S.BlockWrapper>
	);
}

function DraggableAvailableBlock({ type, config }: { type: string; config: { label: string; icon: string } }) {
	const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: `available-${type}` });

	const style = {
		transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
	};

	return (
		<S.AvailableBlock ref={setNodeRef} style={style} {...attributes} {...listeners} $isDragging={isDragging}>
			<ReactSVG src={config.icon} />
			<span>{config.label}</span>
		</S.AvailableBlock>
	);
}

function ColumnDropZone({ id, isActive, isOver }: { id: string; isActive: boolean; isOver: boolean }) {
	const { setNodeRef } = useDroppable({ id });
	return <S.ColumnDropZone ref={setNodeRef} data-dropzone={id} $isActive={isActive} $isDraggingOver={isOver} />;
}

function BlockDropZone({ id, isActive, isOver }: { id: string; isActive: boolean; isOver: boolean }) {
	const { setNodeRef } = useDroppable({ id });
	return <S.BlockDropZone ref={setNodeRef} $isActive={isActive} $isDraggingOver={isOver} />;
}

function InlineDropZone({
	id,
	isActive,
	isOver,
	side,
}: {
	id: string;
	isActive: boolean;
	isOver: boolean;
	side: 'left' | 'right';
}) {
	const { setNodeRef } = useDroppable({ id });
	return <S.InlineDropZone ref={setNodeRef} $isActive={isActive} $isDraggingOver={isOver} $side={side} />;
}

function DropZoneBetweenRows({
	id,
	isActive,
	isOver,
	activeBlock,
}: {
	id: string;
	isActive: boolean;
	isOver: boolean;
	activeBlock: LayoutBlock | null;
}) {
	const { setNodeRef } = useDroppable({ id });
	return (
		<S.DropZone ref={setNodeRef} $isActive={isActive} $isDraggingOver={isOver}>
			{isOver && activeBlock && (
				<S.DropIndicator>
					<ReactSVG src={POST_PREVIEW_BLOCKS[activeBlock.type]?.icon || ICONS.article} />
					<span>{POST_PREVIEW_BLOCKS[activeBlock.type]?.label}</span>
				</S.DropIndicator>
			)}
		</S.DropZone>
	);
}

function PreviewRenderer({
	template,
	themeVars,
}: {
	template: PostPreviewTemplate;
	themeVars: Record<string, string>;
}) {
	const renderPreviewElement = (block: LayoutBlock, key: number, rowIndex: number) => {
		const layout = block.layout || {};
		switch (block.type) {
			case 'body':
				return (
					<S.PreviewBody
						key={key}
						style={{
							flex: layout.flex,
							flexDirection: (layout.direction || 'row') as React.CSSProperties['flexDirection'],
							gap: layout.gap ? `${layout.gap}px` : '10px',
						}}
					>
						{(block.children || []).map((child, childIndex) => renderPreviewElement(child, childIndex, rowIndex))}
					</S.PreviewBody>
				);
			case 'thumbnail':
				return (
					<S.PreviewThumbnail key={key} style={{ flex: layout.flex }}>
						<img
							src={getTxEndpoint(SAMPLE_POST.metadata.thumbnail)}
							style={{ aspectRatio: layout.aspectRatio || '16/9', objectFit: (layout.objectFit as any) || 'cover' }}
						/>
					</S.PreviewThumbnail>
				);
			case 'title':
				return (
					<S.PreviewTitle key={key} style={{ flex: layout.flex }}>
						{SAMPLE_POST.name}
					</S.PreviewTitle>
				);
			case 'description':
				if (layout.maxChars) {
					const max = Number(layout.maxChars);
					const text = SAMPLE_POST.metadata.description;
					const trimmed = text.length > max ? `${text.slice(0, Math.max(0, max - 3))}...` : text;
					return (
						<S.PreviewDescription key={key} style={{ flex: layout.flex }}>
							{trimmed}
						</S.PreviewDescription>
					);
				}
				return (
					<S.PreviewDescription key={key} style={{ flex: layout.flex }}>
						{SAMPLE_POST.metadata.description}
					</S.PreviewDescription>
				);
			case 'author':
				return (
					<S.PreviewAuthor
						key={key}
						style={{
							width: layout.width === 'flex' ? undefined : 'fit-content',
							flex: layout.width === 'flex' ? layout.flex || 1 : undefined,
						}}
					>
						{layout.showAvatar !== 'false' && <div className="avatar" />}
						<span>Author Name</span>
					</S.PreviewAuthor>
				);
			case 'date':
				return (
					<S.PreviewDate key={key}>{new Date(SAMPLE_POST.metadata.releaseDate).toLocaleDateString()}</S.PreviewDate>
				);
			case 'categories':
				return (
					<S.PreviewCategories
						key={key}
						$showBackground={layout.showBackground !== 'false'}
						$isFirstRow={rowIndex === 0}
					>
						{SAMPLE_POST.metadata.categories.slice(0, layout.maxCount || 1).map((cat, i) => (
							<span key={i}>{cat.name}</span>
						))}
					</S.PreviewCategories>
				);
			case 'tags':
				return (
					<S.PreviewTags key={key}>
						{SAMPLE_POST.metadata.topics.map((tag, i) => (
							<span key={i}>#{tag}</span>
						))}
					</S.PreviewTags>
				);
			case 'comments':
				return (
					<S.PreviewComments key={key}>
						<span>3 Comments</span>
					</S.PreviewComments>
				);
			default:
				return null;
		}
	};

	return (
		<S.LivePreviewWrapper>
			<S.LivePreviewHeader>Preview</S.LivePreviewHeader>
			<S.LivePreview
				style={{
					...themeVars,
					flexDirection: (template.layout.direction || 'column') as React.CSSProperties['flexDirection'],
					gap: template.layout.gap ? `${template.layout.gap}px` : '20px',
					...(template.layout.padding ? { padding: `${template.layout.padding}px` } : {}),
				}}
				$topLine={template.rows.some((r) =>
					r.columns.some((c) => c.blocks.some((b) => b.type === 'categories' && b.layout?.topLine === 'true'))
				)}
			>
				{template.rows.map((row, rowIndex) => (
					<S.PreviewRow key={row.id} $blockCount={row.columns.length}>
						{row.columns.map((col) => {
							const colLayout = col.blocks[0]?.layout;
							const blockType = col.blocks[0]?.type;
							const hasWidthOption = BLOCK_SETTINGS[blockType]?.some((f) => f.key === 'width');
							const usesFlex = colLayout?.width === 'flex';
							return (
								<S.PreviewColumn
									key={col.id}
									style={{
										flex: usesFlex ? colLayout?.flex || 1 : hasWidthOption ? undefined : colLayout?.flex || 1,
										width: !usesFlex && hasWidthOption ? 'fit-content' : undefined,
									}}
								>
									{col.blocks.map((block, blockIndex) => renderPreviewElement(block, blockIndex, rowIndex))}
								</S.PreviewColumn>
							);
						})}
					</S.PreviewRow>
				))}
				{template.rows.length === 0 && (
					<S.EmptyState>
						<span>No elements added yet</span>
					</S.EmptyState>
				)}
			</S.LivePreview>
		</S.LivePreviewWrapper>
	);
}

export default function PostPreviewEdit() {
	const navigate = useNavigate();
	const { previewId } = useParams();

	const arProvider = useArweaveProvider();
	const portalProvider = usePortalProvider();
	const permawebProvider = usePermawebProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];
	const { addNotification } = useNotifications();
	const { settings } = useSettingsProvider();

	const isNew = !previewId;
	const isDefaultTemplate = previewId && ['blog', 'journal', 'minimal'].includes(previewId);

	const [loading, setLoading] = React.useState<{ active: boolean; message: string | null }>({
		active: false,
		message: null,
	});
	const [template, setTemplate] = React.useState<PostPreviewTemplate | null>(null);
	const [originalTemplate, setOriginalTemplate] = React.useState<PostPreviewTemplate | null>(null);
	const [hasBodyOverflow, setHasBodyOverflow] = React.useState(false);

	const [activeId, setActiveId] = React.useState<UniqueIdentifier | null>(null);
	const [overId, setOverId] = React.useState<UniqueIdentifier | null>(null);
	const [selectedBlockId, setSelectedBlockId] = React.useState<string | null>(null);

	const selectedBlock = React.useMemo(() => {
		if (!selectedBlockId || !template) return null;
		for (const row of template.rows) {
			for (const col of row.columns) {
				for (const block of col.blocks) {
					if (block.id === selectedBlockId) return block;
					if (block.type === 'body' && block.children) {
						const child = block.children.find((c) => c.id === selectedBlockId);
						if (child) return child;
					}
				}
			}
		}
		return null;
	}, [selectedBlockId, template]);

	const updateBlockLayout = (blockId: string, key: string, value: any) => {
		if (!template) return;
		const newRows = template.rows.map((row) => ({
			...row,
			columns: row.columns.map((col) => ({
				...col,
				blocks: col.blocks.map((block) =>
					updateBlockInTree(block, blockId, (target) => {
						const newLayout = { ...(target.layout || {}), [key]: value };
						if (value === '' || value === undefined) delete newLayout[key];
						return { ...target, layout: Object.keys(newLayout).length > 0 ? newLayout : undefined };
					})
				),
			})),
		}));
		setTemplate({ ...template, rows: newRows });
	};

	const updateTemplateLayout = (key: string, value: any) => {
		if (!template) return;
		const newLayout = { ...template.layout, [key]: value };
		if (value === '' || value === undefined) delete newLayout[key];
		setTemplate({ ...template, layout: newLayout });
	};

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
		useSensor(KeyboardSensor)
	);

	React.useEffect(() => {
		const checkOverflow = () => {
			setHasBodyOverflow(document.documentElement.scrollHeight > window.innerHeight);
		};
		checkOverflow();
		window.addEventListener('resize', checkOverflow);
		return () => window.removeEventListener('resize', checkOverflow);
	}, []);

	React.useEffect(() => {
		if (previewId && portalProvider.current) {
			const portalPreviews = portalProvider.current?.layout?.postPreviews || portalProvider.current?.postPreviews || {};
			const existingTemplate = portalPreviews[previewId] || POST_PREVIEWS[previewId as keyof typeof POST_PREVIEWS];
			if (existingTemplate) {
				const rows = migrateToRows(existingTemplate.rows || existingTemplate.content || []);
				const loadedTemplate = { ...existingTemplate, id: previewId, rows };
				setTemplate(loadedTemplate);
				setOriginalTemplate(JSON.parse(JSON.stringify(loadedTemplate)));
			}
		} else if (isNew) {
			const newTemplate: PostPreviewTemplate = {
				id: `custom-${Date.now()}`,
				name: 'New Template',
				type: 'post-preview',
				layout: { direction: 'column', gap: '20px' },
				rows: [],
			};
			setTemplate(newTemplate);
			setOriginalTemplate(JSON.parse(JSON.stringify(newTemplate)));
		}
	}, [previewId, portalProvider.current, isNew]);

	const hasChanges = React.useMemo(() => {
		if (!template || !originalTemplate) return false;
		return JSON.stringify(template) !== JSON.stringify(originalTemplate);
	}, [template, originalTemplate]);

	React.useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			const modifier = isMac() ? e.metaKey : e.ctrlKey;
			if (modifier && e.shiftKey && e.key.toLowerCase() === 's') {
				e.preventDefault();
				if (hasChanges && !loading.active) handleSave();
			}
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [hasChanges, loading.active, template]);

	const handleSave = async () => {
		if (!template || !portalProvider.current?.id || !arProvider.wallet) return;
		setLoading({ active: true, message: `${language?.saving}...` });
		try {
			let existingPreviews = portalProvider.current?.layout?.postPreviews || portalProvider.current?.postPreviews || {};
			if (Object.keys(existingPreviews).length === 0) {
				try {
					const response = await permawebProvider.libs.readState({
						processId: portalProvider.current.id,
						path: 'Store.PostPreviews',
						hydrate: true,
					});
					const legacy = fixBooleanStrings(permawebProvider.libs.mapFromProcessCase(response)) || {};
					existingPreviews = { ...legacy };
				} catch {
					// ignore legacy fetch errors
				}
			}
			const contentForSave = serializeRows(template.rows);
			const templateToSave = { ...template, content: contentForSave };
			const updatedPreviews = { ...existingPreviews, [template.id]: templateToSave };
			const updatedLayout = {
				...(portalProvider.current?.layout || {}),
				postPreviews: updatedPreviews,
			};

			await permawebProvider.libs.updateZone(
				{ Layout: permawebProvider.libs.mapToProcessCase(updatedLayout) },
				portalProvider.current.id,
				arProvider.wallet
			);

			portalProvider.refreshCurrentPortal(PortalPatchMapEnum.Presentation);
			setOriginalTemplate(JSON.parse(JSON.stringify(template)));
			addNotification(language?.saved || 'Saved!', 'success');
			if (isNew) navigate(`${URLS.portalDesign(portalProvider.current.id)}post-previews`);
		} catch (e: any) {
			addNotification(e.message ?? 'Error saving template', 'warning');
		}
		setLoading({ active: false, message: null });
	};

	const usedBlockTypes = React.useMemo(() => {
		if (!template) return new Set<string>();
		const used = new Set<string>();
		template.rows.forEach((row) =>
			row.columns.forEach((col) => col.blocks.forEach((block) => collectBlockTypes(block, used)))
		);
		return used;
	}, [template?.rows]);

	const availableBlocks = React.useMemo(() => {
		return Object.entries(POST_PREVIEW_BLOCKS).filter(([type]) => !usedBlockTypes.has(type));
	}, [usedBlockTypes]);

	const findBlockLocation = (
		id: UniqueIdentifier
	): { rowIndex: number; colIndex: number; blockIndex: number; parentBodyId?: string; bodyIndex?: number } | null => {
		if (!template) return null;
		for (let rowIndex = 0; rowIndex < template.rows.length; rowIndex++) {
			for (let colIndex = 0; colIndex < template.rows[rowIndex].columns.length; colIndex++) {
				const blocks = template.rows[rowIndex].columns[colIndex].blocks;
				for (let blockIndex = 0; blockIndex < blocks.length; blockIndex++) {
					const block = blocks[blockIndex];
					if (block.id === id) return { rowIndex, colIndex, blockIndex };
					if (block.type === 'body' && block.children) {
						const bodyIndex = block.children.findIndex((child) => child.id === id);
						if (bodyIndex !== -1) {
							return { rowIndex, colIndex, blockIndex, parentBodyId: block.id, bodyIndex };
						}
					}
				}
			}
		}
		return null;
	};

	const getActiveBlock = (): LayoutBlock | null => {
		if (!activeId || !template) return null;
		const idStr = String(activeId);
		if (idStr.startsWith('available-')) {
			const type = idStr.replace('available-', '');
			return { id: `new-${type}`, type };
		}
		for (const row of template.rows) {
			for (const col of row.columns) {
				for (const block of col.blocks) {
					if (block.id === activeId) return block;
					if (block.type === 'body' && block.children) {
						const child = block.children.find((c) => c.id === activeId);
						if (child) return child;
					}
				}
			}
		}
		return null;
	};

	const handleDragStart = (event: DragStartEvent) => {
		setActiveId(event.active.id);
	};

	const handleDragOver = (event: DragOverEvent) => {
		setOverId(event.over?.id || null);
	};

	const removeBlockFromTemplate = (
		loc: { rowIndex: number; colIndex: number; blockIndex: number; parentBodyId?: string; bodyIndex?: number },
		rows: LayoutRow[]
	): LayoutRow[] => {
		return rows
			.map((row, rIdx) => {
				if (rIdx !== loc.rowIndex) return row;
				const newColumns = row.columns
					.map((col, cIdx) => {
						if (cIdx !== loc.colIndex) return col;
						if (loc.parentBodyId) {
							const updatedBlocks = col.blocks
								.map((block, bIdx) => {
									if (bIdx !== loc.blockIndex || block.id !== loc.parentBodyId || block.type !== 'body') return block;
									const children = (block.children || []).filter((_, idx) => idx !== loc.bodyIndex);
									if (children.length === 0) return null;
									if (children.length === 1) return children[0];
									return { ...block, children };
								})
								.filter(Boolean) as LayoutBlock[];
							return { ...col, blocks: updatedBlocks };
						}
						return { ...col, blocks: col.blocks.filter((_, bIdx) => bIdx !== loc.blockIndex) };
					})
					.filter((col) => col.blocks.length > 0);
				return { ...row, columns: newColumns };
			})
			.filter((row) => row.columns.length > 0);
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		setActiveId(null);
		setOverId(null);

		if (!template || !over) return;

		const activeIdStr = String(active.id);
		const overIdStr = String(over.id);

		const isFromAvailable = activeIdStr.startsWith('available-');
		const isToAvailable = overIdStr === 'available-blocks' || overIdStr.startsWith('available-');

		if (isFromAvailable && isToAvailable) return;

		if (!isFromAvailable && isToAvailable) {
			const location = findBlockLocation(active.id);
			if (location) {
				setTemplate({ ...template, rows: removeBlockFromTemplate(location, template.rows) });
			}
			return;
		}

		const blockType = isFromAvailable ? activeIdStr.replace('available-', '') : null;
		const newBlock = blockType ? { id: `${blockType}-${generateId()}`, type: blockType } : null;

		// Stack drop zones (above/below blocks within a column)
		if (overIdStr.startsWith('stack:')) {
			const parts = overIdStr.replace('stack:', '').split(':');
			const [rowId, colId, insertIndexStr] = parts;
			const insertIndex = parseInt(insertIndexStr, 10);

			let blockToInsert: LayoutBlock;
			let newRows = [...template.rows];

			if (isFromAvailable && newBlock) {
				blockToInsert = newBlock;
			} else {
				const location = findBlockLocation(active.id);
				if (!location) return;
				blockToInsert = template.rows[location.rowIndex].columns[location.colIndex].blocks[location.blockIndex];
				newRows = removeBlockFromTemplate(location, newRows);
			}

			const targetRowIndex = newRows.findIndex((r) => r.id === rowId);
			if (targetRowIndex !== -1) {
				const targetColIndex = newRows[targetRowIndex].columns.findIndex((c) => c.id === colId);
				if (targetColIndex !== -1) {
					const targetBlocks = [...newRows[targetRowIndex].columns[targetColIndex].blocks];
					targetBlocks.splice(insertIndex, 0, blockToInsert);
					newRows[targetRowIndex].columns[targetColIndex] = {
						...newRows[targetRowIndex].columns[targetColIndex],
						blocks: targetBlocks,
					};
				}
			}

			setTemplate({ ...template, rows: newRows });
			return;
		}

		// Block-level drop zones within inline body groups
		if (overIdStr.startsWith('body-block-left:') || overIdStr.startsWith('body-block-right:')) {
			const isLeft = overIdStr.startsWith('body-block-left:');
			const parts = overIdStr.replace('body-block-left:', '').replace('body-block-right:', '').split(':');
			const [bodyId, targetBlockId] = parts;
			if (String(active.id) === targetBlockId) return;

			let blockToInsert: LayoutBlock;
			let newRows = [...template.rows];

			if (isFromAvailable && newBlock) {
				blockToInsert = newBlock;
			} else {
				const location = findBlockLocation(active.id);
				if (!location) return;
				blockToInsert = getBlockById(template.rows, active.id);
				if (!blockToInsert) return;
				newRows = removeBlockFromTemplate(location, newRows);
			}

			const updatedRows = insertIntoBody(newRows, bodyId, targetBlockId, blockToInsert, isLeft ? 'before' : 'after');
			if (updatedRows) setTemplate({ ...template, rows: updatedRows });
			return;
		}

		// Block-level drop zones (left/right of individual blocks)
		if (overIdStr.startsWith('block-left:') || overIdStr.startsWith('block-right:')) {
			const isLeft = overIdStr.startsWith('block-left:');
			const parts = overIdStr.replace('block-left:', '').replace('block-right:', '').split(':');
			const [rowId, colId, targetBlockId] = parts;

			let blockToInsert: LayoutBlock;
			let newRows = [...template.rows];

			const targetLocation = findBlockLocation(targetBlockId);
			if (!targetLocation) return;

			if (isFromAvailable && newBlock) {
				blockToInsert = newBlock;
			} else {
				const location = findBlockLocation(active.id);
				if (!location) return;
				blockToInsert = getBlockById(template.rows, active.id);
				if (!blockToInsert) return;
				newRows = removeBlockFromTemplate(location, newRows);

				if (
					location.rowIndex === targetLocation.rowIndex &&
					location.colIndex === targetLocation.colIndex &&
					location.blockIndex < targetLocation.blockIndex
				) {
					targetLocation.blockIndex -= 1;
				}
			}

			const targetRowIndex = newRows.findIndex((r) => r.id === rowId);
			if (targetRowIndex !== -1) {
				const targetColIndex = newRows[targetRowIndex].columns.findIndex((c) => c.id === colId);
				if (targetColIndex !== -1) {
					const targetRow = newRows[targetRowIndex];
					const targetCol = targetRow.columns[targetColIndex];
					const shouldInlineGroup =
						(targetRow.columns.length > 1 && targetCol.blocks.length > 1 && targetLocation.blockIndex > 0) ||
						targetLocation.parentBodyId;

					if (shouldInlineGroup) {
						const updatedRows = targetLocation.parentBodyId
							? insertIntoBody(
									newRows,
									targetLocation.parentBodyId,
									targetBlockId,
									blockToInsert,
									isLeft ? 'before' : 'after'
							  )
							: inlineGroupInsert(newRows, targetLocation, blockToInsert, isLeft ? 'before' : 'after');
						if (updatedRows) {
							setTemplate({ ...template, rows: updatedRows });
							return;
						}
					}

					const newColumn: LayoutColumn = { id: `col-${generateId()}`, blocks: [blockToInsert] };
					const targetColumns = [...newRows[targetRowIndex].columns];
					const insertAt = isLeft ? targetColIndex : targetColIndex + 1;
					targetColumns.splice(insertAt, 0, newColumn);
					newRows[targetRowIndex] = { ...newRows[targetRowIndex], columns: targetColumns };
				}
			}

			setTemplate({ ...template, rows: newRows });
			return;
		}

		// Edge drop zones (left/right/between columns)
		if (
			overIdStr.startsWith('edge-left-') ||
			overIdStr.startsWith('edge-right-') ||
			overIdStr.startsWith('edge-between-')
		) {
			let rowId: string;
			let insertAt: number;

			if (overIdStr.startsWith('edge-left-')) {
				rowId = overIdStr.replace('edge-left-', '');
				insertAt = 0;
			} else if (overIdStr.startsWith('edge-right-')) {
				rowId = overIdStr.replace('edge-right-', '');
				insertAt = -1; // Will be set to end
			} else {
				const rest = overIdStr.replace('edge-between-', '');
				const lastDash = rest.lastIndexOf('-');
				rowId = rest.substring(0, lastDash);
				insertAt = parseInt(rest.substring(lastDash + 1), 10);
			}

			let blockToInsert: LayoutBlock;
			let newRows = [...template.rows];

			if (isFromAvailable && newBlock) {
				blockToInsert = newBlock;
			} else {
				const location = findBlockLocation(active.id);
				if (!location) return;
				blockToInsert = template.rows[location.rowIndex].columns[location.colIndex].blocks[location.blockIndex];
				newRows = removeBlockFromTemplate(location, newRows);
			}

			const targetRowIndex = newRows.findIndex((r) => r.id === rowId);
			if (targetRowIndex !== -1) {
				const newColumn: LayoutColumn = { id: `col-${generateId()}`, blocks: [blockToInsert] };
				const targetColumns = [...(newRows[targetRowIndex].columns || [])];
				if (insertAt === -1) insertAt = targetColumns.length;
				targetColumns.splice(insertAt, 0, newColumn);
				newRows[targetRowIndex] = { ...newRows[targetRowIndex], columns: targetColumns };
			}

			setTemplate({ ...template, rows: newRows });
			return;
		}

		// Vertical drop zone (above/below rows)
		if (overIdStr.startsWith('dropzone-')) {
			const insertIndex = parseInt(overIdStr.replace('dropzone-', ''), 10);
			let blockToInsert: LayoutBlock;
			let newRows = [...template.rows];

			if (isFromAvailable && newBlock) {
				blockToInsert = newBlock;
			} else {
				const location = findBlockLocation(active.id);
				if (!location) return;
				blockToInsert = template.rows[location.rowIndex].columns[location.colIndex].blocks[location.blockIndex];
				newRows = removeBlockFromTemplate(location, newRows);
			}

			let adjustedIndex = insertIndex;
			if (!isFromAvailable) {
				const location = findBlockLocation(active.id);
				if (location && location.rowIndex < insertIndex) {
					adjustedIndex = Math.max(0, insertIndex - 1);
				}
			}

			const newRow: LayoutRow = {
				id: `row-${generateId()}`,
				columns: [{ id: `col-${generateId()}`, blocks: [blockToInsert] }],
			};
			newRows.splice(adjustedIndex, 0, newRow);
			setTemplate({ ...template, rows: newRows });
			return;
		}
	};

	const handleResetToDefault = () => {
		if (!template) return;
		const defaultTemplate = POST_PREVIEWS[template.id as keyof typeof POST_PREVIEWS];
		if (!defaultTemplate) return;
		const rows = migrateToRows(defaultTemplate.rows || defaultTemplate.content || []);
		const resetTemplate = { ...defaultTemplate, id: template.id, rows };
		setSelectedBlockId(null);
		setTemplate(resetTemplate);
	};

	const deleteBlock = (_rowId: string, _colId: string, blockId: string) => {
		if (!template || loading.active) return;
		const location = findBlockLocation(blockId);
		if (!location) return;
		const newRows = removeBlockFromTemplate(location, template.rows);
		setTemplate({ ...template, rows: newRows });
	};

	const activeBlock = getActiveBlock();
	const activeRowIndex =
		activeId && template && !String(activeId).startsWith('available-')
			? template.rows.findIndex((r) =>
					r.columns.some((c) =>
						c.blocks.some(
							(b) =>
								b.id === String(activeId) || (b.type === 'body' && b.children?.some((ch) => ch.id === String(activeId)))
						)
					)
			  )
			: -1;
	const unauthorized = !portalProvider.permissions?.updatePortalMeta;
	const primaryDisabled = unauthorized || !hasChanges || loading.active;

	const scheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	const activeTheme = portalProvider.current?.themes?.find((t: any) => t.active);
	const themeVars = activeTheme ? getThemeVars(activeTheme, scheme) : {};

	if (!template) return <Loader message={`${language?.loading}...`} />;

	return (
		<>
			<S.Wrapper>
				<S.ToolbarWrapper navWidth={settings.navWidth} hasBodyOverflow={hasBodyOverflow}>
					<S.ToolbarContent className={'max-view-wrapper'} navWidth={settings.navWidth}>
						<S.TitleWrapper>
							<input
								value={template.name}
								onChange={(e) => setTemplate({ ...template, name: e.target.value })}
								placeholder={language?.templateName || 'Template name'}
								disabled={loading.active || !!isDefaultTemplate}
							/>
						</S.TitleWrapper>
						<S.EndActions>
							{hasChanges && !loading.active && (
								<S.UpdateWrapper>
									<span>{language?.unsavedChanges || 'Unsaved changes'}</span>
									<div className={'indicator'} />
								</S.UpdateWrapper>
							)}
							{isDefaultTemplate && (
								<S.SubmitWrapper>
									<Button
										type={'alt1'}
										label={'Reset to Default'}
										handlePress={handleResetToDefault}
										active={false}
										disabled={unauthorized || !hasChanges || loading.active}
										noFocus
									/>
								</S.SubmitWrapper>
							)}
							<S.SubmitWrapper>
								<Button
									type={'alt1'}
									label={language?.save || 'Save'}
									handlePress={handleSave}
									active={false}
									disabled={primaryDisabled}
									tooltip={primaryDisabled ? null : (isMac() ? 'Cmd' : 'CTRL') + ' + Shift + S'}
									noFocus
								/>
							</S.SubmitWrapper>
						</S.EndActions>
					</S.ToolbarContent>
				</S.ToolbarWrapper>

				<S.EditorWrapper>
					<S.Editor blockEditMode={true}>
						<S.ElementWrapper blockEditMode={true}>
							<DndContext
								sensors={sensors}
								collisionDetection={customCollisionDetection}
								onDragStart={handleDragStart}
								onDragOver={handleDragOver}
								onDragEnd={handleDragEnd}
							>
								<S.Element blockEditMode={true} direction={'row'}>
									<S.PreviewContainer>
										<S.PreviewArea>
											{template.rows.length === 0 && !activeId && (
												<S.EmptyState>
													<span>{language?.dragBlocksHere || 'Drag blocks here'}</span>
												</S.EmptyState>
											)}

											<DropZoneBetweenRows
												id="dropzone-0"
												isActive={!!activeId && activeRowIndex !== 0}
												isOver={overId === 'dropzone-0'}
												activeBlock={activeBlock}
											/>

											{template.rows.map((row, rowIndex) => {
												const rowHasActive =
													!!activeId &&
													!String(activeId).startsWith('available-') &&
													row.columns.some((c: any) =>
														c.blocks.some(
															(b: any) =>
																b.id === String(activeId) ||
																(b.type === 'body' && b.children?.some((child: any) => child.id === String(activeId)))
														)
													);
												return (
													<React.Fragment key={row.id}>
														<S.Row $isDraggingOver={overId === row.id} $isDragging={!!activeId}>
															<ColumnDropZone
																id={`edge-left-${row.id}`}
																isActive={!!activeId && !rowHasActive}
																isOver={overId === `edge-left-${row.id}`}
															/>
															{(
																row.columns ||
																(row as any).blocks?.map((b: any, i: number) => ({ id: `col-${i}`, blocks: [b] })) ||
																[]
															).map((col: any, colIndex: number) => (
																<React.Fragment key={col.id}>
																	{colIndex > 0 && (
																		<ColumnDropZone
																			id={`edge-between-${row.id}-${colIndex}`}
																			isActive={!!activeId && !rowHasActive}
																			isOver={overId === `edge-between-${row.id}-${colIndex}`}
																		/>
																	)}
																	<S.Column>
																		<BlockDropZone
																			id={`stack:${row.id}:${col.id}:0`}
																			isActive={!!activeId && String(activeId) !== col.blocks[0]?.id}
																			isOver={overId === `stack:${row.id}:${col.id}:0`}
																		/>
																		{col.blocks.map((block: any, blockIndex: number) => {
																			if (block.type === 'body' && block.children) {
																				return (
																					<React.Fragment key={block.id}>
																						<S.InlineGroupWrapper>
																							<S.InlineGroup>
																								{block.children.map((child: any, childIndex: number) => {
																									const inlineActive = !!activeId;
																									return (
																										<S.BlockRow key={child.id}>
																											{childIndex === 0 && (
																												<InlineDropZone
																													id={`body-block-left:${block.id}:${child.id}`}
																													isActive={inlineActive}
																													isOver={overId === `body-block-left:${block.id}:${child.id}`}
																													side="left"
																												/>
																											)}
																											<SortableBlock
																												block={child}
																												onDelete={() => deleteBlock(row.id, col.id, child.id)}
																												isSelected={selectedBlockId === child.id}
																												onSelect={() =>
																													setSelectedBlockId(
																														selectedBlockId === child.id ? null : child.id
																													)
																												}
																												inline
																											/>
																											<InlineDropZone
																												id={`body-block-right:${block.id}:${child.id}`}
																												isActive={inlineActive}
																												isOver={overId === `body-block-right:${block.id}:${child.id}`}
																												side="right"
																											/>
																										</S.BlockRow>
																									);
																								})}
																							</S.InlineGroup>
																						</S.InlineGroupWrapper>
																						<BlockDropZone
																							id={`stack:${row.id}:${col.id}:${blockIndex + 1}`}
																							isActive={!!activeId}
																							isOver={overId === `stack:${row.id}:${col.id}:${blockIndex + 1}`}
																						/>
																					</React.Fragment>
																				);
																			}

																			const isSelf = String(activeId) === block.id;
																			return (
																				<React.Fragment key={block.id}>
																					<S.BlockRow>
																						<ColumnDropZone
																							id={`block-left:${row.id}:${col.id}:${block.id}`}
																							isActive={!!activeId && !isSelf}
																							isOver={overId === `block-left:${row.id}:${col.id}:${block.id}`}
																						/>
																						<SortableBlock
																							block={block}
																							onDelete={() => deleteBlock(row.id, col.id, block.id)}
																							isSelected={selectedBlockId === block.id}
																							onSelect={() =>
																								setSelectedBlockId(selectedBlockId === block.id ? null : block.id)
																							}
																						/>
																						<ColumnDropZone
																							id={`block-right:${row.id}:${col.id}:${block.id}`}
																							isActive={!!activeId && !isSelf}
																							isOver={overId === `block-right:${row.id}:${col.id}:${block.id}`}
																						/>
																					</S.BlockRow>
																					<BlockDropZone
																						id={`stack:${row.id}:${col.id}:${blockIndex + 1}`}
																						isActive={!!activeId && !isSelf}
																						isOver={overId === `stack:${row.id}:${col.id}:${blockIndex + 1}`}
																					/>
																				</React.Fragment>
																			);
																		})}
																	</S.Column>
																</React.Fragment>
															))}
															<ColumnDropZone
																id={`edge-right-${row.id}`}
																isActive={!!activeId && !rowHasActive}
																isOver={overId === `edge-right-${row.id}`}
															/>
														</S.Row>
														<DropZoneBetweenRows
															id={`dropzone-${rowIndex + 1}`}
															isActive={!!activeId && activeRowIndex !== rowIndex && activeRowIndex !== rowIndex + 1}
															isOver={overId === `dropzone-${rowIndex + 1}`}
															activeBlock={activeBlock}
														/>
													</React.Fragment>
												);
											})}
										</S.PreviewArea>
										<PreviewRenderer template={template} themeVars={themeVars} />
									</S.PreviewContainer>

									<S.SidebarContainer>
										<S.SettingsContainer>
											<S.SettingsPanel>
												<S.SettingsPanelHeader>
													<p>{selectedBlock ? POST_PREVIEW_BLOCKS[selectedBlock.type]?.label : 'Post Preview'}</p>
												</S.SettingsPanelHeader>
												<S.SettingsContent>
													{selectedBlock ? (
														BLOCK_SETTINGS[selectedBlock.type]?.length > 0 ? (
															BLOCK_SETTINGS[selectedBlock.type]
																.filter(
																	(field) =>
																		!field.showIf ||
																		(selectedBlock.layout as any)?.[field.showIf.key] === field.showIf.value
																)
																.map((field) => (
																	<S.SettingField key={field.key}>
																		{field.type === 'select' ? (
																			<Select
																				label={field.label}
																				activeOption={
																					field.options?.find(
																						(opt) =>
																							opt.id ===
																							((field.key === 'aspectRatio'
																								? (selectedBlock.layout as any)?.[field.key] || '16/9'
																								: (selectedBlock.layout as any)?.[field.key]) || '')
																					) ||
																					field.options?.[0] || { id: '', label: '' }
																				}
																				setActiveOption={(option: SelectOptionType) =>
																					updateBlockLayout(selectedBlock.id, field.key, option.id)
																				}
																				options={field.options || []}
																				disabled={false}
																			/>
																		) : (
																			<FormField
																				label={field.label}
																				type={field.type === 'number' ? 'number' : undefined}
																				value={
																					field.type === 'number'
																						? (selectedBlock.layout as any)?.[field.key] ?? ''
																						: (selectedBlock.layout as any)?.[field.key] || ''
																				}
																				placeholder={field.placeholder}
																				onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
																					updateBlockLayout(
																						selectedBlock.id,
																						field.key,
																						field.type === 'number'
																							? e.target.value
																								? Number(e.target.value)
																								: undefined
																							: e.target.value
																					)
																				}
																				disabled={false}
																				invalid={{ status: false, message: null }}
																				sm
																				noMargin
																				hideErrorMessage
																			/>
																		)}
																	</S.SettingField>
																))
														) : (
															<S.SettingsEmpty>
																<span>{language?.noSettings || 'No settings for this element'}</span>
															</S.SettingsEmpty>
														)
													) : (
														POST_SETTINGS.map((field) => (
															<S.SettingField key={field.key}>
																{field.type === 'range' ? (
																	<>
																		<S.SettingLabel>{field.label}</S.SettingLabel>
																		<S.SliderField>
																			<S.SettingInput
																				type="range"
																				min={field.min}
																				max={field.max}
																				step={field.step}
																				value={parseInt((template.layout as any)?.[field.key]) || 20}
																				onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
																					updateTemplateLayout(field.key, e.target.value)
																				}
																			/>
																			<span>{parseInt((template.layout as any)?.[field.key]) || 20}px</span>
																		</S.SliderField>
																	</>
																) : (
																	<FormField
																		label={field.label}
																		value={(template.layout as any)?.[field.key] || ''}
																		placeholder={field.placeholder}
																		onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
																			updateTemplateLayout(field.key, e.target.value)
																		}
																		disabled={false}
																		invalid={{ status: false, message: null }}
																		sm
																		noMargin
																		hideErrorMessage
																	/>
																)}
															</S.SettingField>
														))
													)}
												</S.SettingsContent>
											</S.SettingsPanel>
										</S.SettingsContainer>
										<S.BlocksContainer>
											<S.BlocksPanel>
												<S.BlocksPanelHeader>
													<p>{language?.postPreviewElements || 'Elements'}</p>
												</S.BlocksPanelHeader>
												<S.BlocksList id="available-blocks">
													{availableBlocks.length > 0 ? (
														availableBlocks.map(([type, config]) => (
															<DraggableAvailableBlock key={type} type={type} config={config} />
														))
													) : (
														<S.AllUsed>
															<span>{language?.allBlocksUsed || 'All blocks used'}</span>
														</S.AllUsed>
													)}
												</S.BlocksList>
											</S.BlocksPanel>
										</S.BlocksContainer>
									</S.SidebarContainer>
								</S.Element>

								<DragOverlay>
									{activeBlock && (
										<S.DragOverlayBlock>
											<S.BlockHeader>
												<S.BlockHeaderLeft>
													<ReactSVG src={ICONS.drag} />
													<span>{POST_PREVIEW_BLOCKS[activeBlock.type]?.label || activeBlock.type}</span>
												</S.BlockHeaderLeft>
											</S.BlockHeader>
											{activeBlock.type === 'thumbnail' && (
												<S.BlockContent
													$type={activeBlock.type}
													style={
														activeBlock.layout?.aspectRatio
															? { aspectRatio: normalizeAspectRatio(activeBlock.layout.aspectRatio) }
															: undefined
													}
												>
													<ReactSVG src={POST_PREVIEW_BLOCKS[activeBlock.type]?.icon || ICONS.article} />
												</S.BlockContent>
											)}
										</S.DragOverlayBlock>
									)}
								</DragOverlay>
							</DndContext>
						</S.ElementWrapper>
					</S.Editor>
				</S.EditorWrapper>
			</S.Wrapper>

			{loading.active && <Loader message={loading.message} />}
		</>
	);
}
