import React from 'react';

import { PortalCategoryMetaType, PortalCategoryType, PortalPatchMapEnum } from 'helpers/types';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { useNotifications } from 'providers/NotificationProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';

export function useCategoriesWithReorder(props: {
	categories: PortalCategoryType[];
	setCategories: (cats: PortalCategoryType[]) => void;
	allowReorder?: boolean;
	skipAuthCheck?: boolean;
	selectOnAdd?: boolean;
	unauthorized?: boolean;
	portalId: string | null;
	portalCategories: PortalCategoryType[] | null;
	refreshCurrentPortal: (patchKey: PortalPatchMapEnum.Navigation) => void;
}) {
	const arProvider = useArweaveProvider();
	const permawebProvider = usePermawebProvider();
	const languageProvider = useLanguageProvider();
	const { addNotification } = useNotifications();
	const language = languageProvider.object[languageProvider.current];

	const categoryElementRefs = React.useRef<Map<string, HTMLElement>>(new Map());
	const draggedElementRef = React.useRef<HTMLElement | null>(null);
	const draggedIdRef = React.useRef<string | null>(null);
	const originalDraggedRect = React.useRef<DOMRect | null>(null);

	const [categoryOptions, setCategoryOptions] = React.useState<PortalCategoryType[] | null>(null);
	const [showCategoryAdd, setShowCategoryAdd] = React.useState<boolean>(false);
	const [newCategoryName, setNewCategoryName] = React.useState<string>('');
	const [showDeleteConfirmation, setShowDeleteConfirmation] = React.useState<boolean>(false);
	const [categoryLoading, setCategoryLoading] = React.useState<boolean>(false);
	const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
	const [isDragging, setIsDragging] = React.useState<boolean>(false);
	const [dragOverId, setDragOverId] = React.useState<string | null>(null);
	const [showChildDropZone, setShowChildDropZone] = React.useState<boolean>(false);
	const [showUnNestIndicator, setShowUnNestIndicator] = React.useState<boolean>(false);
	const [mouseX, setMouseX] = React.useState<number>(0);
	const [categoryElementRects, setCategoryElementRects] = React.useState<Map<string, DOMRect>>(new Map());

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
		}
		setCategoryElementRects(rects);
	}, [props.allowReorder]);

	// Sync categoryOptions with portalCategories
	React.useEffect(() => {
		if (props.portalCategories) {
			setCategoryOptions(props.portalCategories);
		}
	}, [props.portalCategories]);

	// Mouse tracking during drag
	React.useEffect(() => {
		const handleMouseMove = (event: MouseEvent) => {
			if (isDragging) {
				setMouseX(event.clientX);
			}
		};

		if (isDragging) {
			document.addEventListener('mousemove', handleMouseMove);
			return () => {
				document.removeEventListener('mousemove', handleMouseMove);
			};
		}
	}, [isDragging]);

	// Store the current destination index from drag updates
	const currentDestinationRef = React.useRef<number | null>(null);

	// Update drag indicators based on mouse position
	React.useEffect(() => {
		if (!isDragging || !draggedIdRef.current || !originalDraggedRect.current || mouseX === 0) {
			return;
		}

		const draggedId = draggedIdRef.current;

		const flattened = flattenCategories(categoryOptions);
		const dragged = flattened.find((item) => item.category.id === draggedId);
		if (!dragged) return;

		const NEST_THRESHOLD = 40;
		// For un-nesting: trigger when dragged left by (indentation - buffer)
		// This makes it trigger when roughly aligned with parent level
		const INDENTATION_PER_LEVEL = 20;
		const UNNEST_BUFFER = 40; // Large buffer to account for grab position offset and make it easier to trigger

		// Use the original rect position, not the current animated position
		const originalLeft = originalDraggedRect.current.left;

		// Calculate the left position where the parent level would be
		// Each level is indented by INDENTATION_PER_LEVEL pixels
		// So the parent level (one level up) would be INDENTATION_PER_LEVEL pixels to the left
		const parentLevelLeft = originalLeft - INDENTATION_PER_LEVEL;

		// Check if dragging left to un-nest
		// Should trigger when mouse is roughly at or left of where the parent level starts
		// We add UNNEST_BUFFER to make it easier to trigger
		if (dragged.level > 0 && mouseX <= parentLevelLeft + UNNEST_BUFFER) {
			setDragOverId(dragged.category.id);
			setShowChildDropZone(false);
			setShowUnNestIndicator(true);
			return;
		}

		// Check if dragging right to nest
		// Use the current destination position if available, otherwise use source
		if (mouseX > originalLeft + NEST_THRESHOLD) {
			const sourceIndex = flattened.findIndex((item) => item.category.id === draggedId);
			const currentDestination = currentDestinationRef.current;

			// Determine which category should be the parent based on current drag position
			let potentialParentIndex = -1;
			if (currentDestination !== null && currentDestination > 0) {
				// Use the category before the current destination
				potentialParentIndex = currentDestination > sourceIndex ? currentDestination : currentDestination - 1;
			} else if (sourceIndex > 0) {
				// Fall back to source position
				potentialParentIndex = sourceIndex - 1;
			}

			if (potentialParentIndex >= 0 && potentialParentIndex < flattened.length) {
				const potentialParent = flattened[potentialParentIndex];
				const canBeChild =
					potentialParent &&
					!potentialParent.path.startsWith(dragged.path + '.') &&
					!dragged.path.startsWith(potentialParent.path + '.') &&
					potentialParent.category.id !== dragged.category.id;

				if (canBeChild) {
					setDragOverId(potentialParent.category.id);
					setShowChildDropZone(true);
					setShowUnNestIndicator(false);
					return;
				}
			}
		}

		// Clear indicators if not nesting/un-nesting
		setDragOverId(null);
		setShowChildDropZone(false);
		setShowUnNestIndicator(false);
	}, [isDragging, mouseX, categoryElementRects, categoryOptions]);

	const addCategory = async () => {
		if (!props.unauthorized && newCategoryName && props.portalId && arProvider.wallet) {
			setCategoryLoading(true);
			try {
				const effectiveParent = getEffectiveParentId();

				const newCategory: PortalCategoryType = {
					id: Date.now().toString(),
					name: newCategoryName,
					parent: effectiveParent,
					metadata: {},
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
					props.portalId,
					arProvider.wallet
				);

				props.refreshCurrentPortal(PortalPatchMapEnum.Navigation);

				console.log(`Categories update: ${categoryUpdateId}`);

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

	const updateCategory = async (categoryId: string, metadata: PortalCategoryMetaType) => {
		if (!props.unauthorized && props.portalId && arProvider.wallet) {
			setCategoryLoading(true);
			try {
				const updateMeta = (categories: PortalCategoryType[]): PortalCategoryType[] => {
					return categories.map((category) => {
						if (category.id === categoryId) {
							return {
								...category,
								metadata: {
									...category.metadata,
									...metadata,
								},
							};
						} else if (category.children) {
							return {
								...category,
								children: updateMeta(category.children),
							};
						}
						return category;
					});
				};

				const updatedCategories = updateMeta(categoryOptions);

				const categoryUpdateId = await permawebProvider.libs.updateZone(
					{ Categories: permawebProvider.libs.mapToProcessCase(updatedCategories) },
					props.portalId,
					arProvider.wallet
				);

				props.refreshCurrentPortal(PortalPatchMapEnum.Navigation);

				console.log(`Categories update: ${categoryUpdateId}`);

				setCategoryOptions(updatedCategories);
				addNotification(`Updated Category Metadata Successfully!`, 'success');
			} catch (e: any) {
				addNotification(e.message ?? 'Error updating category', 'warning');
			}
			setCategoryLoading(false);
		}
	};

	const deleteCategories = async () => {
		if (!props.unauthorized && arProvider.wallet && props.portalCategories && props.categories?.length) {
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
				const allCategories = props.portalCategories;

				const idsToDelete = findCategoriesToDelete(allCategories, selectedIds);

				const updatedCategories = removeCategories(allCategories, idsToDelete);

				const categoryUpdateId = await permawebProvider.libs.updateZone(
					{ Categories: permawebProvider.libs.mapToProcessCase(updatedCategories) },
					props.portalId,
					arProvider.wallet
				);

				props.setCategories([]);

				props.refreshCurrentPortal(PortalPatchMapEnum.Navigation);

				console.log(`Categories update: ${categoryUpdateId}`);

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
		// Store dragOverId and mouseX before clearing for logic use
		// @ts-ignore
		const _activeDragOverId = dragOverId;
		const currentMouseX = mouseX;
		const originalRect = originalDraggedRect.current;

		// Clean up all drag states immediately
		setIsDragging(false);
		setSelectedIds(new Set());
		setDragOverId(null);
		setShowChildDropZone(false);
		setShowUnNestIndicator(false);
		setMouseX(0);
		draggedElementRef.current = null;
		draggedIdRef.current = null;
		originalDraggedRect.current = null;
		currentDestinationRef.current = null;

		if (props.unauthorized) return;

		const { source, destination } = result;
		const flattened = flattenCategories(categoryOptions);
		const dragged = flattened[source.index];

		// Check if user is trying to nest/unnest based on horizontal movement
		const NEST_THRESHOLD = 40;
		const INDENTATION_PER_LEVEL = 20;
		const UNNEST_BUFFER = 40; // Large buffer to account for grab position offset and make it easier to trigger

		let shouldMakeChild = false;
		let shouldUnNest = false;
		let newParent = null;

		// Determine nesting intent from mouse position using the stored original position
		if (originalRect && currentMouseX > 0) {
			const originalLeft = originalRect.left;
			const parentLevelLeft = originalLeft - INDENTATION_PER_LEVEL;

			// User dragged to the right - try to make it a child
			if (currentMouseX > originalLeft + NEST_THRESHOLD) {
				// Find the category immediately before this one (or at destination) to use as parent
				let potentialParentIndex = source.index - 1;

				// If we moved to a new position, use the category before the destination
				if (destination.index !== source.index && destination.index > 0) {
					potentialParentIndex = destination.index > source.index ? destination.index : destination.index - 1;
				}

				if (potentialParentIndex >= 0 && potentialParentIndex < flattened.length) {
					const potentialParent = flattened[potentialParentIndex];
					const canBeChild =
						potentialParent &&
						!potentialParent.path.startsWith(dragged.path + '.') && // Not dragging into own descendant
						!dragged.path.startsWith(potentialParent.path + '.') && // Not already a descendant
						potentialParent.category.id !== dragged.category.id; // Not same category

					if (canBeChild) {
						shouldMakeChild = true;
						newParent = potentialParent;
					}
				}
			}
			// User dragged to the left - try to un-nest
			// Check if mouse is at or left of where the parent level starts
			else if (dragged.level > 0 && currentMouseX <= parentLevelLeft + UNNEST_BUFFER) {
				shouldUnNest = true;
			}
		}

		// If no valid destination and not un-nesting, return early
		if (!destination && !shouldUnNest) return;

		// Early return only if no movement AND no nesting change
		if (destination && source.index === destination.index && !shouldMakeChild && !shouldUnNest) return;

		// Check if we're trying to make a category a child of itself or its descendants (only for regular moves)
		if (!shouldMakeChild && !shouldUnNest && destination) {
			const draggedTarget = destination.index < flattened.length ? flattened[destination.index] : null;
			const isDraggedIntoDescendant =
				draggedTarget && (draggedTarget.path === dragged.path || draggedTarget.path.startsWith(dragged.path + '.'));

			if (isDraggedIntoDescendant) {
				addNotification('Cannot make a category a child of itself or its descendants', 'warning');
				return;
			}
		}

		let reordered: PortalCategoryType[];

		if (shouldUnNest) {
			// Un-nest the dragged item (move it up one level)
			const subtree = flattened.filter(
				(item) => item.path === dragged.path || item.path.startsWith(dragged.path + '.')
			);
			const remaining = flattened.filter(
				(item) => !(item.path === dragged.path || item.path.startsWith(dragged.path + '.'))
			);

			// Decrease the level by 1 for the dragged item and its children
			const updatedSubtree = subtree.map((item) => ({
				...item,
				level: Math.max(0, item.level - 1),
			}));

			// When un-nesting, keep the item in the same position (or use source position if no destination)
			let insertIdx = destination ? destination.index : source.index;
			if (destination && destination.index > source.index) {
				insertIdx = destination.index + 1;
			}

			const newFlattened = [...remaining.slice(0, insertIdx), ...updatedSubtree, ...remaining.slice(insertIdx)];

			reordered = reconstructHierarchy(newFlattened);
		} else if (shouldMakeChild && newParent) {
			// Make the dragged item a child of the new parent
			const subtree = flattened.filter(
				(item) => item.path === dragged.path || item.path.startsWith(dragged.path + '.')
			);
			const remaining = flattened.filter(
				(item) => !(item.path === dragged.path || item.path.startsWith(dragged.path + '.'))
			);

			// Update the dragged item's level to be child of new parent
			const updatedSubtree = subtree.map((item) => ({
				...item,
				level: item.level - dragged.level + newParent.level + 1,
			}));

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

			const newFlattened = [...remaining.slice(0, insertIdx), ...updatedSubtree, ...remaining.slice(insertIdx)];

			reordered = reconstructHierarchy(newFlattened);
		} else if (destination && source.index !== destination.index) {
			// Regular reordering logic - only if position actually changed
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
		} else {
			// No changes were made
			return;
		}

		setCategoryOptions(reordered);

		if (arProvider.wallet && props.portalId) {
			setCategoryLoading(true);
			try {
				const categoryUpdateId = await permawebProvider.libs.updateZone(
					{ Categories: permawebProvider.libs.mapToProcessCase(reordered) },
					props.portalId,
					arProvider.wallet
				);

				console.log(`Categories update: ${categoryUpdateId}`);

				props.refreshCurrentPortal(PortalPatchMapEnum.Navigation);
				addNotification(`${language?.categoriesUpdated}!`, 'success');
			} catch (e: any) {
				addNotification(e.message ?? 'Error reordering categories', 'warning');
			}
			setCategoryLoading(false);
		}
	};

	function handleDragStart(start: any) {
		const draggedId = start.draggableId;
		const flat = flattenCategories(categoryOptions);
		const dragged = flat.find((item) => item.category.id === draggedId)!;

		const subtreeIds = flat
			.filter((item) => item.path === dragged.path || item.path.startsWith(dragged.path + '.'))
			.map((item) => item.category.id);

		// Capture the dragged element ref, ID, and original position
		const draggedEl = categoryElementRefs.current.get(draggedId);
		if (draggedEl) {
			draggedElementRef.current = draggedEl;
			originalDraggedRect.current = draggedEl.getBoundingClientRect();
		}
		draggedIdRef.current = draggedId;

		// Reset all drag-related state
		setDragOverId(null);
		setShowChildDropZone(false);
		setShowUnNestIndicator(false);
		setSelectedIds(new Set(subtreeIds));
		setIsDragging(true);
		setMouseX(0);
		currentDestinationRef.current = null;

		// Update element rects immediately when drag starts
		setTimeout(() => {
			updateElementRects();
		}, 50);
	}

	function handleDragUpdate(update: any) {
		if (!update.destination) {
			currentDestinationRef.current = null;
			// Don't clear indicators here - let the useEffect handle it based on mouseX
			return;
		}

		// @ts-ignore
		const { destination, source } = update;

		// Store the current destination index for the useEffect to use
		currentDestinationRef.current = destination.index;

		// Don't override drag indicators here - the useEffect based on mouseX is more accurate
		// This function only updates when destination changes (vertical movement)
		// The useEffect updates on every mouseX change (horizontal movement)
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
		showUnNestIndicator,
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
		updateCategory,
	};
}
