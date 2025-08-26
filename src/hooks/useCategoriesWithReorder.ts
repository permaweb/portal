import { PortalCategoryType } from 'helpers/types';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { useNotifications } from 'providers/NotificationProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';
import React from 'react';
import { usePortalProvider } from 'viewer/providers/PortalProvider';

export function useCategoriesWithReorder(props: {
	categories: PortalCategoryType[];
	setCategories: (cats: PortalCategoryType[]) => void;
	allowReorder?: boolean;
	skipAuthCheck?: boolean;
	selectOnAdd?: boolean;
	unauthorized?: boolean;
}) {
	const arProvider = useArweaveProvider();
	const portalProvider = usePortalProvider();
	const permawebProvider = usePermawebProvider();
	const languageProvider = useLanguageProvider();
	const { addNotification } = useNotifications();
	const language = languageProvider.object[languageProvider.current];

	const categoryElementRefs = React.useRef<Map<string, HTMLElement>>(new Map());
	const draggedElementRef = React.useRef<HTMLElement | null>(null);

	const [categoryOptions, setCategoryOptions] = React.useState<PortalCategoryType[] | null>(null);
	const [showCategoryAdd, setShowCategoryAdd] = React.useState<boolean>(false);
	const [newCategoryName, setNewCategoryName] = React.useState<string>('');
	const [showDeleteConfirmation, setShowDeleteConfirmation] = React.useState<boolean>(false);
	const [categoryLoading, setCategoryLoading] = React.useState<boolean>(false);
	const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
	const [isDragging, setIsDragging] = React.useState<boolean>(false);
	const [dragOverId, setDragOverId] = React.useState<string | null>(null);
	const [showChildDropZone, setShowChildDropZone] = React.useState<boolean>(false);
	const [mouseX, setMouseX] = React.useState<number>(0);
	const [categoryElementRects, setCategoryElementRects] = React.useState<Map<string, DOMRect>>(new Map());

	React.useEffect(() => {
		if (portalProvider.current?.id) {
			if (portalProvider.current.categories) setCategoryOptions(portalProvider.current.categories);
		}
	}, [portalProvider.current]);

	const getEffectiveParentId = () => {
		if (props.categories?.length > 0) return props.categories[0].id;
		return null;
	};
	// Capture category element positions using refs
	const updateElementRects = React.useCallback(() => {
		const rects = new Map<string, DOMRect>();
		if (props.allowReorder) {
			categoryElementRefs.current.forEach((element, id) => {
				if (element) {
					rects.set(id, element.getBoundingClientRect());
				}
			});
			console.log('Updated element rects:', rects.size, 'elements from refs');
		}
		setCategoryElementRects(rects);
	}, [props.allowReorder]);

	// Mouse tracking during drag
	React.useEffect(() => {
		const handleMouseMove = (event: MouseEvent) => {
			if (isDragging) {
				setMouseX(event.clientX);
				// console.log('Mouse tracking:', event.clientX);
			}
		};

		if (isDragging) {
			console.log('Starting mouse tracking');
			document.addEventListener('mousemove', handleMouseMove);
			return () => {
				console.log('Stopping mouse tracking');
				document.removeEventListener('mousemove', handleMouseMove);
			};
		}
	}, [isDragging]);

	const addCategory = async () => {
		if (!props.unauthorized && newCategoryName && portalProvider.current?.id && arProvider.wallet) {
			setCategoryLoading(true);
			try {
				const effectiveParent = getEffectiveParentId();
				console.log('Adding new category under parent ID:', effectiveParent);
				const newCategory: PortalCategoryType = {
					id: Date.now().toString(),
					name: newCategoryName,
					parent: effectiveParent,
				};

				const isDuplicate = (categories: PortalCategoryType[], name: string): boolean => {
					return categories.some((category) => {
						if (category.name.toLowerCase() === name.toLowerCase()) {
							return true;
						}
						if (category.children && category.children.length > 0) {
							return isDuplicate(category.children, name);
						}
						return false;
					});
				};

				if (isDuplicate(categoryOptions, newCategoryName)) {
					addNotification(language?.categoryDuplicateError || 'Category already exists', 'warning');
					setCategoryLoading(false);
					return;
				}

				const addToParent = (categories: PortalCategoryType[]): PortalCategoryType[] => {
					return categories.map((category) => {
						if (category.id === effectiveParent) {
							return {
								...category,
								children: [...(category.children || []), newCategory],
							};
						} else if (category.children) {
							return {
								...category,
								children: addToParent(category.children),
							};
						}
						return category;
					});
				};

				const updatedCategories = effectiveParent ? addToParent(categoryOptions) : [...categoryOptions, newCategory];

				const categoryUpdateId = await permawebProvider.libs.updateZone(
					{ Categories: permawebProvider.libs.mapToProcessCase(updatedCategories) },
					portalProvider.current.id,
					arProvider.wallet
				);

				portalProvider.refreshCurrentPortal();

				console.log(`Category update: ${categoryUpdateId}`);

				if (props.selectOnAdd) props.setCategories([...props.categories, newCategory]);

				setCategoryOptions(updatedCategories);
				addNotification(`${language?.categoryAdded}!`, 'success');
				setNewCategoryName('');
			} catch (e: any) {
				addNotification(e.message ?? 'Error adding category', 'warning');
			}
			setCategoryLoading(false);
		}
	};

	const deleteCategories = async () => {
		if (!props.unauthorized && arProvider.wallet && portalProvider.current?.categories && props.categories?.length) {
			setCategoryLoading(true);
			try {
				const findCategoriesToDelete = (categories: PortalCategoryType[], selectedIds: string[]): string[] => {
					let toDelete: string[] = [];

					categories.forEach((category) => {
						if (selectedIds.includes(category.id)) {
							toDelete.push(category.id);
							if (category.children && category.children.length > 0) {
								toDelete = [...toDelete, ...findCategoriesToDelete(category.children, selectedIds)];
							}
						} else if (category.children) {
							toDelete = [...toDelete, ...findCategoriesToDelete(category.children, selectedIds)];
						}
					});

					return toDelete;
				};

				const removeCategories = (categories: PortalCategoryType[], idsToDelete: string[]): PortalCategoryType[] => {
					return categories
						.filter((category) => !idsToDelete.includes(category.id))
						.map((category) => ({
							...category,
							children: category.children ? removeCategories(category.children, idsToDelete) : [],
						}));
				};

				const selectedIds = props.categories.map((cat: PortalCategoryType) => cat.id);
				const allCategories = portalProvider.current.categories;

				const idsToDelete = findCategoriesToDelete(allCategories, selectedIds);

				const updatedCategories = removeCategories(allCategories, idsToDelete);

				const categoryUpdateId = await permawebProvider.libs.updateZone(
					{ Categories: permawebProvider.libs.mapToProcessCase(updatedCategories) },
					portalProvider.current.id,
					arProvider.wallet
				);

				props.setCategories([]);

				portalProvider.refreshCurrentPortal();

				console.log(`Category update: ${categoryUpdateId}`);

				setCategoryOptions(updatedCategories);
				addNotification(`${language?.categoriesUpdated}!`, 'success');
				setShowDeleteConfirmation(false);
			} catch (e: any) {
				addNotification(e.message ?? 'Error deleting categories', 'warning');
			}
			setCategoryLoading(false);
		}
	};

	const findParentCategory = (categories: PortalCategoryType[], childId: string): PortalCategoryType | null => {
		for (const category of categories) {
			if (category.children?.some((child) => child.id === childId)) {
				return category;
			}
			if (category.children) {
				const found = findParentCategory(category.children, childId);
				if (found) return found;
			}
		}
		return null;
	};

	function findCategoryById(categories: PortalCategoryType[], id: string): PortalCategoryType | undefined {
		for (const category of categories) {
			if (category.id === id) {
				return category;
			} else if (category.children && category.children.length > 0) {
				const found = findCategoryById(category.children, id);
				if (found) return found;
			}
		}
		return undefined;
	}

	const handleSelectCategory = (categoryId: string) => {
		const isSelected = props.categories.some((category) => category.id === categoryId);
		let updatedCategories: PortalCategoryType[];
		if (isSelected) {
			updatedCategories = props.categories.filter((category) => category.id !== categoryId);
		} else {
			const categoryToAdd = findCategoryById(categoryOptions, categoryId);
			updatedCategories = categoryToAdd ? [...props.categories, categoryToAdd] : props.categories;
		}
		props.setCategories(updatedCategories);
	};

	const flattenCategories = (
		categories: PortalCategoryType[],
		level: number = 0
	): Array<{ category: PortalCategoryType; level: number; path: string }> => {
		const flattened: Array<{ category: PortalCategoryType; level: number; path: string }> = [];

		const flatten = (cats: PortalCategoryType[], currentLevel: number, parentPath: string = '') => {
			cats.forEach((cat, index) => {
				const path = parentPath ? `${parentPath}.${index}` : `${index}`;
				flattened.push({ category: cat, level: currentLevel, path });

				if (cat.children && cat.children.length > 0) {
					flatten(cat.children, currentLevel + 1, path);
				}
			});
		};

		flatten(categories, level);
		return flattened;
	};

	const reconstructHierarchy = (
		flattened: Array<{ category: PortalCategoryType; level: number; path: string }>
	): PortalCategoryType[] => {
		const result: PortalCategoryType[] = [];
		const stack: Array<{ category: PortalCategoryType; level: number }> = [];

		flattened.forEach((item) => {
			const newCategory = { ...item.category, children: [] };

			while (stack.length > 0 && stack[stack.length - 1].level >= item.level) {
				stack.pop();
			}

			if (stack.length === 0) {
				result.push(newCategory);
			} else {
				const parent = stack[stack.length - 1].category;
				if (!parent.children) parent.children = [];
				parent.children.push(newCategory);
			}

			stack.push({ category: newCategory, level: item.level });
		});

		return result;
	};

	const handleDragEnd = async (result: any) => {
		console.log('Drag ended - cleaning up states');

		// Store dragOverId before clearing it for logic use
		const activeDragOverId = dragOverId;

		// Clean up all drag states immediately
		setIsDragging(false);
		setSelectedIds(new Set());
		setDragOverId(null);
		setShowChildDropZone(false);
		setMouseX(0);
		draggedElementRef.current = null;

		console.log('Drag result:', result);
		console.log('Active dragOverId was:', activeDragOverId);

		if (!result.destination || props.unauthorized) return;
		const { source, destination } = result;
		if (source.index === destination.index) return;

		const flattened = flattenCategories(categoryOptions);
		const dragged = flattened[source.index];

		// Check if we're trying to make a category a child of itself or its descendants
		const draggedTarget = destination.index < flattened.length ? flattened[destination.index] : null;
		const isDraggedIntoDescendant =
			draggedTarget && (draggedTarget.path === dragged.path || draggedTarget.path.startsWith(dragged.path + '.'));

		if (isDraggedIntoDescendant) {
			addNotification('Cannot make a category a child of itself or its descendants', 'warning');
			return;
		}

		// Determine if this should be a child relationship based on:
		// 1. Position relative to potential parent
		// 2. Mouse position being to the right of the parent (tracked via dragOverId)
		let shouldMakeChild = false;
		let newParent = null;

		console.log('handleDragEnd - activeDragOverId:', activeDragOverId, 'destination.index:', destination.index);

		if (activeDragOverId) {
			// Find the parent based on activeDragOverId (which was set during drag update)
			const potentialParent = flattened.find((item) => item.category.id === activeDragOverId);

			// Check if we can make this a child relationship
			const canBeChild =
				potentialParent &&
				!potentialParent.path.startsWith(dragged.path + '.') && // Not dragging into own descendant
				potentialParent.category.id !== dragged.category.id; // Not same category

			if (canBeChild) {
				console.log(
					'Making child relationship - parent:',
					potentialParent.category.name,
					'child:',
					dragged.category.name
				);
				shouldMakeChild = true;
				newParent = potentialParent;
			}
		}

		let reordered: PortalCategoryType[];

		console.log(shouldMakeChild);
		console.log(newParent);

		if (shouldMakeChild && newParent) {
			console.log('Creating child relationship...');
			// Make the dragged item a child of the new parent
			const subtree = flattened.filter(
				(item) => item.path === dragged.path || item.path.startsWith(dragged.path + '.')
			);
			const remaining = flattened.filter(
				(item) => !(item.path === dragged.path || item.path.startsWith(dragged.path + '.'))
			);

			console.log(
				'Subtree to move:',
				subtree.map((item) => item.category.name)
			);
			console.log(
				'Remaining items:',
				remaining.map((item) => item.category.name)
			);

			// Update the dragged item's level to be child of new parent
			const updatedSubtree = subtree.map((item) => ({
				...item,
				level: item.level - dragged.level + newParent.level + 1,
			}));

			console.log(
				'Updated subtree levels:',
				updatedSubtree.map((item) => `${item.category.name} (level ${item.level})`)
			);

			// Find insertion point after the new parent and its existing children
			let insertIdx = 0;
			for (let i = 0; i < remaining.length; i++) {
				if (remaining[i].path === newParent.path) {
					insertIdx = i + 1;
					// Skip existing children of the new parent
					while (insertIdx < remaining.length && remaining[insertIdx].level > newParent.level) {
						insertIdx++;
					}
					break;
				}
			}

			console.log('Insertion index:', insertIdx);
			const newFlattened = [...remaining.slice(0, insertIdx), ...updatedSubtree, ...remaining.slice(insertIdx)];
			console.log(
				'New flattened structure:',
				newFlattened.map((item) => `${item.category.name} (level ${item.level})`)
			);

			reordered = reconstructHierarchy(newFlattened);
			console.log('Reconstructed hierarchy:', reordered);
		} else {
			// Regular reordering logic
			const subtree = flattened.filter(
				(item) => item.path === dragged.path || item.path.startsWith(dragged.path + '.')
			);
			const remaining = flattened.filter(
				(item) => !(item.path === dragged.path || item.path.startsWith(dragged.path + '.'))
			);

			let insertIdx = destination.index;
			if (destination.index > source.index) {
				insertIdx = destination.index + 1;
			}

			const newFlattened = [...remaining.slice(0, insertIdx), ...subtree, ...remaining.slice(insertIdx)];
			reordered = reconstructHierarchy(newFlattened);
		}

		setCategoryOptions(reordered);

		if (arProvider.wallet && portalProvider.current?.id) {
			try {
				const categoryUpdateId = await permawebProvider.libs.updateZone(
					{ Categories: permawebProvider.libs.mapToProcessCase(reordered) },
					portalProvider.current.id,
					arProvider.wallet
				);

				console.log(`Categories update: ${categoryUpdateId}`);

				portalProvider.refreshCurrentPortal();
				addNotification(`${language?.categoriesUpdated}!`, 'success');
			} catch (e: any) {
				addNotification(e.message ?? 'Error reordering categories', 'warning');
			}
		}
	};

	function handleDragStart(start: any) {
		const draggedId = start.draggableId;
		const flat = flattenCategories(categoryOptions);
		const dragged = flat.find((item) => item.category.id === draggedId)!;

		const subtreeIds = flat
			.filter((item) => item.path === dragged.path || item.path.startsWith(dragged.path + '.'))
			.map((item) => item.category.id);

		// Reset all drag-related state
		setDragOverId(null);
		setShowChildDropZone(false);
		setSelectedIds(new Set(subtreeIds));
		setIsDragging(true);
		setMouseX(0);

		console.log('Drag started - reset all states');

		// Update element rects immediately when drag starts
		setTimeout(() => {
			updateElementRects();
		}, 50);
	}

	function handleDragUpdate(update: any) {
		if (!update.destination) {
			setDragOverId(null);
			setShowChildDropZone(false);
			return;
		}

		const { destination } = update;
		const flattened = flattenCategories(categoryOptions);
		const dragged = flattened.find((item) => item.category.id === update.draggableId);

		console.log('Drag update:', {
			destinationIndex: destination.index,
			mouseX,
			draggedId: update.draggableId,
			elementRectsSize: categoryElementRects.size,
		});

		// Use the destination index to find which category we're near
		let bestParentCandidate = null;

		if (mouseX > 850 && destination.index > 0) {
			// Look at the category just before the drop destination
			const potentialParent = flattened[destination.index - 1];

			if (potentialParent && dragged) {
				const canBeChild =
					!potentialParent.path.startsWith(dragged.path + '.') && potentialParent.category.id !== dragged.category.id;

				if (canBeChild) {
					console.log('Checking destination-based parent:', potentialParent.category.name);
					bestParentCandidate = potentialParent;
				}
			}
		}

		// If no destination-based parent, fall back to checking all categories
		if (!bestParentCandidate && mouseX > 850) {
			for (let i = 0; i < flattened.length; i++) {
				const potentialParent = flattened[i];

				if (!dragged || !potentialParent) continue;

				const canBeChild =
					!potentialParent.path.startsWith(dragged.path + '.') && potentialParent.category.id !== dragged.category.id;

				if (canBeChild) {
					console.log('Fallback check for:', potentialParent.category.name);
					bestParentCandidate = potentialParent;
					break; // Take the first valid one
				}
			}
		}

		if (bestParentCandidate) {
			console.log('Setting dragOverId to:', bestParentCandidate.category.name);
			setDragOverId(bestParentCandidate.category.id);
			setShowChildDropZone(true);
		} else {
			console.log('Clearing dragOverId');
			setDragOverId(null);
			setShowChildDropZone(false);
		}
	}

	return {
		addCategory,
		categoryOptions,
		showCategoryAdd,
		setShowCategoryAdd,
		newCategoryName,
		setNewCategoryName,
		categoryLoading,
		showDeleteConfirmation,
		setShowDeleteConfirmation,
		deleteCategories,
		handleSelectCategory,
		flattenCategories,
		categoryElementRefs,
		selectedIds,
		isDragging,
		dragOverId,
		showChildDropZone,
		handleDragEnd,
		handleDragStart,
		handleDragUpdate,
		findParentCategory,
		updateElementRects,
		setCategoryOptions,
		setSelectedIds,
		setIsDragging,
		setDragOverId,
		setShowChildDropZone,
		findCategoryById,
		getEffectiveParentId,
		categoryElementRects,
		mouseX,
		setMouseX,
		reconstructHierarchy,
	};
}
