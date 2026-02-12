import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ReactSVG } from 'react-svg';
import {
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
import { IconButton } from 'components/atoms/IconButton';
import { Loader } from 'components/atoms/Loader';
import { ICONS, POST_PREVIEWS } from 'helpers/config';
import { getTxEndpoint } from 'helpers/endpoints';
import { getThemeVars } from 'helpers/themes';
import { PortalPatchMapEnum } from 'helpers/types';
import { isMac } from 'helpers/utils';
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
		description: 'This is a sample description for the post preview. It shows how the description element will appear.',
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

type SettingField = {
	key: string;
	label: string;
	type: 'select' | 'number' | 'text' | 'range';
	options?: { label: string; value: string }[];
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
				{ label: 'Default (16/9)', value: '' },
				{ label: '16/6', value: '16/6' },
				{ label: '16/9', value: '16/9' },
				{ label: '4/3', value: '4/3' },
				{ label: '1/1', value: '1/1' },
			],
		},
		{
			key: 'objectFit',
			label: 'Object Fit',
			type: 'select',
			options: [
				{ label: 'Cover', value: 'cover' },
				{ label: 'Contain', value: 'contain' },
				{ label: 'Fill', value: 'fill' },
			],
		},
	],
	categories: [
		{ key: 'maxCount', label: 'Max Categories', type: 'number', placeholder: '1' },
		{
			key: 'position',
			label: 'Position',
			type: 'select',
			options: [
				{ label: 'Inline', value: '' },
				{ label: 'Absolute', value: 'absolute' },
			],
		},
		{
			key: 'filter',
			label: 'Filter',
			type: 'select',
			options: [
				{ label: 'None', value: '' },
				{ label: 'Invert', value: 'invert' },
			],
		},
	],
	title: [{ key: 'flex', label: 'Flex', type: 'number', placeholder: '1' }],
	description: [{ key: 'flex', label: 'Flex', type: 'number', placeholder: '1' }],
	author: [
		{
			key: 'showAvatar',
			label: 'Show Avatar',
			type: 'select',
			options: [
				{ label: 'Yes', value: '' },
				{ label: 'No', value: 'false' },
			],
		},
		{
			key: 'width',
			label: 'Width',
			type: 'select',
			options: [
				{ label: 'Fit Content', value: '' },
				{ label: 'Flex', value: 'flex' },
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
				{ label: 'Fit Content', value: '' },
				{ label: 'Flex', value: 'flex' },
			],
		},
		{ key: 'flex', label: 'Flex Value', type: 'number', placeholder: '1', showIf: { key: 'width', value: 'flex' } },
	],
	tags: [],
	comments: [],
};

const POST_SETTINGS: SettingField[] = [
	{ key: 'gap', label: 'Gap', type: 'range', min: 0, max: 60, step: 1 },
	{ key: 'padding', label: 'Padding', type: 'range', min: 0, max: 60, step: 1 },
	{
		key: 'topLine',
		label: 'Top Line',
		type: 'select',
		options: [
			{ label: 'No', value: '' },
			{ label: 'Yes', value: 'true' },
		],
	},
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
	width?: string;
};

type LayoutBlock = { id: string; type: string; layout?: BlockLayout };
type LayoutColumn = { id: string; blocks: LayoutBlock[] };
type LayoutRow = { id: string; columns: LayoutColumn[] };

type PostPreviewTemplate = {
	id: string;
	name: string;
	type: string;
	layout: { direction?: string; gap?: string; padding?: string; topLine?: boolean };
	rows: LayoutRow[];
};

function generateId() {
	return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function migrateToRows(content: any[]): LayoutRow[] {
	if (!content || content.length === 0) return [];
	if (content[0]?.columns) return content as LayoutRow[];
	if (content[0]?.blocks) {
		return content.map((row: any) => ({
			id: row.id,
			columns: row.blocks.map((block: any, idx: number) => ({
				id: `col-${row.id}-${idx}`,
				blocks: [block],
			})),
		}));
	}
	return content.map((item, idx) => ({
		id: `row-${idx}`,
		columns: [
			{
				id: `col-${idx}-0`,
				blocks: [
					{ id: item.id || `${item.type}-${idx}`, type: item.type, ...(item.layout ? { layout: item.layout } : {}) },
				],
			},
		],
	}));
}

function SortableBlock({
	block,
	onDelete,
	isSelected,
	onSelect,
}: {
	block: LayoutBlock;
	onDelete: () => void;
	isSelected: boolean;
	onSelect: () => void;
}) {
	const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: block.id });

	const style = {
		transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
		opacity: isDragging ? 0.5 : 1,
	};

	return (
		<S.BlockWrapper ref={setNodeRef} style={style} $isDragging={isDragging}>
			<S.Block $isSelected={isSelected} $compact={block.type !== 'thumbnail'} onClick={onSelect}>
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
					<S.BlockContent $type={block.type}>
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
	const renderPreviewElement = (block: LayoutBlock, key: number) => {
		const layout = block.layout || {};
		switch (block.type) {
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
					<S.PreviewCategories key={key}>
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
				$topLine={template.layout.topLine}
			>
				{template.rows.map((row) => (
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
									{col.blocks.map((block, blockIndex) => renderPreviewElement(block, blockIndex))}
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
				const block = col.blocks.find((b) => b.id === selectedBlockId);
				if (block) return block;
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
				blocks: col.blocks.map((block) => {
					if (block.id !== blockId) return block;
					const newLayout = { ...(block.layout || {}), [key]: value };
					if (value === '' || value === undefined) delete newLayout[key];
					return { ...block, layout: Object.keys(newLayout).length > 0 ? newLayout : undefined };
				}),
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
			const portalPreviews = portalProvider.current?.postPreviews || {};
			const existingTemplate = portalPreviews[previewId] || POST_PREVIEWS[previewId as keyof typeof POST_PREVIEWS];
			if (existingTemplate) {
				const rows = migrateToRows(existingTemplate.content || existingTemplate.rows || []);
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
			const existingPreviews = portalProvider.current?.postPreviews || {};
			const contentForSave = template.rows.flatMap((row) =>
				row.columns.flatMap((col) =>
					col.blocks.map((block) => {
						const entry: any = { id: block.id, type: block.type };
						if (block.layout) entry.layout = block.layout;
						return entry;
					})
				)
			);
			const templateToSave = { ...template, content: contentForSave };
			const updatedPreviews = { ...existingPreviews, [template.id]: templateToSave };

			await permawebProvider.libs.updateZone(
				{ 'Store.PostPreviews': permawebProvider.libs.mapToProcessCase(updatedPreviews) },
				portalProvider.current.id,
				arProvider.wallet
			);

			portalProvider.refreshCurrentPortal(PortalPatchMapEnum.Presentation);
			setOriginalTemplate(JSON.parse(JSON.stringify(template)));
			addNotification(language?.saved || 'Saved!', 'success');
			if (isNew) navigate(`/${portalProvider.current.id}/design/post-preview/edit/${template.id}`);
		} catch (e: any) {
			addNotification(e.message ?? 'Error saving template', 'warning');
		}
		setLoading({ active: false, message: null });
	};

	const usedBlockTypes = React.useMemo(() => {
		if (!template) return new Set<string>();
		const used = new Set<string>();
		template.rows.forEach((row) => row.columns.forEach((col) => col.blocks.forEach((block) => used.add(block.type))));
		return used;
	}, [template?.rows]);

	const availableBlocks = React.useMemo(() => {
		return Object.entries(POST_PREVIEW_BLOCKS).filter(([type]) => !usedBlockTypes.has(type));
	}, [usedBlockTypes]);

	const findBlockLocation = (
		id: UniqueIdentifier
	): { rowIndex: number; colIndex: number; blockIndex: number } | null => {
		if (!template) return null;
		for (let rowIndex = 0; rowIndex < template.rows.length; rowIndex++) {
			for (let colIndex = 0; colIndex < template.rows[rowIndex].columns.length; colIndex++) {
				const blockIndex = template.rows[rowIndex].columns[colIndex].blocks.findIndex((b) => b.id === id);
				if (blockIndex !== -1) return { rowIndex, colIndex, blockIndex };
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
				const block = col.blocks.find((b) => b.id === activeId);
				if (block) return block;
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
		loc: { rowIndex: number; colIndex: number; blockIndex: number },
		rows: LayoutRow[]
	): LayoutRow[] => {
		return rows
			.map((row, rIdx) => {
				if (rIdx !== loc.rowIndex) return row;
				const newColumns = row.columns
					.map((col, cIdx) => {
						if (cIdx !== loc.colIndex) return col;
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

		// Block-level drop zones (left/right of individual blocks)
		if (overIdStr.startsWith('block-left:') || overIdStr.startsWith('block-right:')) {
			const isLeft = overIdStr.startsWith('block-left:');
			const parts = overIdStr.replace('block-left:', '').replace('block-right:', '').split(':');
			const [rowId, colId] = parts;

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

	const deleteBlock = (rowId: string, colId: string, blockId: string) => {
		if (!template || loading.active) return;
		const newRows = template.rows
			.map((row) => {
				if (row.id !== rowId) return row;
				const newColumns = row.columns
					.map((col) => {
						if (col.id !== colId) return col;
						return { ...col, blocks: col.blocks.filter((b) => b.id !== blockId) };
					})
					.filter((col) => col.blocks.length > 0);
				return { ...row, columns: newColumns };
			})
			.filter((row) => row.columns.length > 0);
		setTemplate({ ...template, rows: newRows });
	};

	const activeBlock = getActiveBlock();
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
								collisionDetection={pointerWithin}
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
												isActive={!!activeId}
												isOver={overId === 'dropzone-0'}
												activeBlock={activeBlock}
											/>

											{template.rows.map((row, rowIndex) => (
												<React.Fragment key={row.id}>
													<S.Row $isDraggingOver={overId === row.id} $isDragging={!!activeId}>
														<ColumnDropZone
															id={`edge-left-${row.id}`}
															isActive={!!activeId}
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
																		isActive={!!activeId}
																		isOver={overId === `edge-between-${row.id}-${colIndex}`}
																	/>
																)}
																<S.Column>
																	<BlockDropZone
																		id={`stack:${row.id}:${col.id}:0`}
																		isActive={!!activeId}
																		isOver={overId === `stack:${row.id}:${col.id}:0`}
																	/>
																	{col.blocks.map((block: any, blockIndex: number) => (
																		<React.Fragment key={block.id}>
																			<S.BlockRow>
																				<ColumnDropZone
																					id={`block-left:${row.id}:${col.id}:${block.id}`}
																					isActive={!!activeId}
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
																					isActive={!!activeId}
																					isOver={overId === `block-right:${row.id}:${col.id}:${block.id}`}
																				/>
																			</S.BlockRow>
																			<BlockDropZone
																				id={`stack:${row.id}:${col.id}:${blockIndex + 1}`}
																				isActive={!!activeId}
																				isOver={overId === `stack:${row.id}:${col.id}:${blockIndex + 1}`}
																			/>
																		</React.Fragment>
																	))}
																</S.Column>
															</React.Fragment>
														))}
														<ColumnDropZone
															id={`edge-right-${row.id}`}
															isActive={!!activeId}
															isOver={overId === `edge-right-${row.id}`}
														/>
													</S.Row>
													<DropZoneBetweenRows
														id={`dropzone-${rowIndex + 1}`}
														isActive={!!activeId}
														isOver={overId === `dropzone-${rowIndex + 1}`}
														activeBlock={activeBlock}
													/>
												</React.Fragment>
											))}
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
																		<S.SettingLabel>{field.label}</S.SettingLabel>
																		{field.type === 'select' ? (
																			<S.SettingSelect
																				value={(selectedBlock.layout as any)?.[field.key] || ''}
																				onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
																					updateBlockLayout(selectedBlock.id, field.key, e.target.value)
																				}
																			>
																				{field.options?.map((opt) => (
																					<option key={opt.value} value={opt.value}>
																						{opt.label}
																					</option>
																				))}
																			</S.SettingSelect>
																		) : field.type === 'number' ? (
																			<S.SettingInput
																				type="number"
																				value={(selectedBlock.layout as any)?.[field.key] ?? ''}
																				placeholder={field.placeholder}
																				onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
																					updateBlockLayout(
																						selectedBlock.id,
																						field.key,
																						e.target.value ? Number(e.target.value) : undefined
																					)
																				}
																			/>
																		) : (
																			<S.SettingInput
																				type="text"
																				value={(selectedBlock.layout as any)?.[field.key] || ''}
																				placeholder={field.placeholder}
																				onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
																					updateBlockLayout(selectedBlock.id, field.key, e.target.value)
																				}
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
																<S.SettingLabel>{field.label}</S.SettingLabel>
																{field.type === 'select' ? (
																	<S.SettingSelect
																		value={
																			field.key === 'topLine'
																				? template.layout.topLine
																					? 'true'
																					: ''
																				: (template.layout as any)?.[field.key] || ''
																		}
																		onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
																			updateTemplateLayout(
																				field.key,
																				field.key === 'topLine' ? e.target.value === 'true' : e.target.value
																			)
																		}
																	>
																		{field.options?.map((opt) => (
																			<option key={opt.value} value={opt.value}>
																				{opt.label}
																			</option>
																		))}
																	</S.SettingSelect>
																) : field.type === 'range' ? (
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
																) : (
																	<S.SettingInput
																		type="text"
																		value={(template.layout as any)?.[field.key] || ''}
																		placeholder={field.placeholder}
																		onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
																			updateTemplateLayout(field.key, e.target.value)
																		}
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
											<S.BlockContent $type={activeBlock.type}>
												<ReactSVG src={POST_PREVIEW_BLOCKS[activeBlock.type]?.icon || ICONS.article} />
											</S.BlockContent>
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
