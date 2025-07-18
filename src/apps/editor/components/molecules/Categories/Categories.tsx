import React from 'react';
import { ReactSVG } from 'react-svg';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { useTheme } from 'styled-components';

import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
import { FormField } from 'components/atoms/FormField';
import { Modal } from 'components/atoms/Modal';
import { ASSETS, STYLING } from 'helpers/config';
import { PortalCategoryType } from 'helpers/types';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { useNotifications } from 'providers/NotificationProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';
import { CloseHandler } from 'wrappers/CloseHandler';

import * as S from './styles';

export default function Categories(props: {
	categories: PortalCategoryType[];
	setCategories: (categories: PortalCategoryType[]) => void;
	includeChildrenOnSelect?: boolean;
	selectOnAdd?: boolean;
	showActions?: boolean;
	closeAction?: () => void;
	skipAuthCheck?: boolean;
	allowReorder?: boolean;
}) {
	const arProvider = useArweaveProvider();
	const permawebProvider = usePermawebProvider();
	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const { addNotification } = useNotifications();
	const language = languageProvider.object[languageProvider.current];
	const theme = useTheme();

	const [categoryOptions, setCategoryOptions] = React.useState<PortalCategoryType[] | null>(null);
	const [newCategoryName, setNewCategoryName] = React.useState<string>('');
	const [parentCategory, setParentCategory] = React.useState<string | null>(null);
	const [showParentOptions, setShowParentOptions] = React.useState<boolean>(false);
	const [showDeleteConfirmation, setShowDeleteConfirmation] = React.useState<boolean>(false);
	const [categoryLoading, setCategoryLoading] = React.useState<boolean>(false);
	const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
	const [isDragging, setIsDragging] = React.useState<boolean>(false);
	const draggedElementRef = React.useRef<HTMLElement | null>(null);

	React.useEffect(() => {
		if (portalProvider.current?.id) {
			if (portalProvider.current.categories) setCategoryOptions(portalProvider.current.categories);
		}
	}, [portalProvider.current]);

	const unauthorized = !portalProvider.permissions?.updatePortalMeta && !props.skipAuthCheck;

	const addCategory = async () => {
		if (!unauthorized && newCategoryName && portalProvider.current?.id && arProvider.wallet) {
			setCategoryLoading(true);
			try {
				const newCategory: PortalCategoryType = {
					id: Date.now().toString(),
					name: newCategoryName,
					parent: parentCategory,
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
						if (category.id === parentCategory) {
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

				const updatedCategories = parentCategory ? addToParent(categoryOptions) : [...categoryOptions, newCategory];

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
				setParentCategory(null);
			} catch (e: any) {
				addNotification(e.message ?? 'Error adding category', 'warning');
			}
			setCategoryLoading(false);
		}
	};

	const deleteCategories = async () => {
		if (!unauthorized && arProvider.wallet && portalProvider.current?.categories && props.categories?.length) {
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
		setIsDragging(false);
		setSelectedIds(new Set());
		draggedElementRef.current = null;

		if (!result.destination || unauthorized) return;
		const { source, destination } = result;
		if (source.index === destination.index) return;

		const flattened = flattenCategories(categoryOptions);

		const dragged = flattened[source.index];
		const subtree = flattened.filter((item) => item.path === dragged.path || item.path.startsWith(dragged.path + '.'));

		const remaining = flattened.filter(
			(item) => !(item.path === dragged.path || item.path.startsWith(dragged.path + '.'))
		);

		let insertIdx = destination.index;
		if (destination.index > source.index) {
			insertIdx = destination.index + 1;
		}

		const newFlattened = [...remaining.slice(0, insertIdx), ...subtree, ...remaining.slice(insertIdx)];

		const reordered = reconstructHierarchy(newFlattened);

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

		setSelectedIds(new Set(subtreeIds));
		setIsDragging(true);
	}

	const CategoryItem = ({
		category,
		index,
		level,
		isDragEnabled,
	}: {
		category: PortalCategoryType;
		index: number;
		level: number;
		isDragEnabled: boolean;
	}) => {
		const active = props.categories?.find((c: PortalCategoryType) => category.id === c.id) !== undefined;
		if (isDragEnabled) {
			return (
				<Draggable key={category.id} draggableId={category.id} index={index}>
					{(provided, snapshot) => (
						<S.CategoryDragWrapper
							ref={provided.innerRef}
							{...provided.draggableProps}
							level={level}
							isDragging={snapshot.isDragging}
							parentDragging={false}
						>
							<S.CategoryDrag level={level} isDragging={snapshot.isDragging}>
								<S.CategoryDragHandle {...provided.dragHandleProps}>
									<ReactSVG src={ASSETS.drag} />
								</S.CategoryDragHandle>
								<S.CategoryContent>
									<Button
										type={'alt3'}
										label={category.name}
										handlePress={() => handleSelectCategory(category.id)}
										active={active}
										disabled={unauthorized || categoryLoading || isDragging}
										icon={active ? ASSETS.close : ASSETS.add}
									/>
								</S.CategoryContent>
							</S.CategoryDrag>
							{category.children && category.children.length > 0 && (
								<CategoryOptions categories={category.children} level={level + 1} />
							)}
						</S.CategoryDragWrapper>
					)}
				</Draggable>
			);
		}

		return (
			<React.Fragment key={category.id}>
				<S.CategoryOption level={level}>
					<Button
						type={'alt3'}
						label={category.name}
						handlePress={() => handleSelectCategory(category.id)}
						active={active}
						disabled={unauthorized || categoryLoading}
						icon={active ? ASSETS.close : ASSETS.add}
					/>
				</S.CategoryOption>
				{category.children && category.children.length > 0 && (
					<CategoryOptions categories={category.children} level={level + 1} />
				)}
			</React.Fragment>
		);
	};

	const CategoryOptions = ({ categories, level = 0 }: { categories: PortalCategoryType[]; level?: number }) => {
		const isDragEnabled = props.allowReorder;

		return (
			<S.CategoriesList>
				{categories.map((category, index) => (
					<CategoryItem
						key={category.id}
						category={category}
						index={index}
						level={level}
						isDragEnabled={isDragEnabled}
					/>
				))}
			</S.CategoriesList>
		);
	};

	const renderParentCategoryOptions = (categories: PortalCategoryType[], level = 1) =>
		categories.map((category) => (
			<React.Fragment key={category.id}>
				<S.ParentCategoryOption
					level={level}
					onClick={() => {
						setParentCategory(category.id);
						setShowParentOptions(false);
					}}
				>
					<span>{category.name}</span>
				</S.ParentCategoryOption>
				{category.children && renderParentCategoryOptions(category.children, level + 1)}
			</React.Fragment>
		));

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

	function getParentDisplayLabel() {
		if (parentCategory && categoryOptions) {
			const parent = findCategoryById(categoryOptions, parentCategory);
			return parent ? parent.name : language?.selectParentCategory;
		}
		return language?.selectParentCategory;
	}

	function getCategories() {
		if (!categoryOptions) {
			return (
				<S.LoadingWrapper>
					<p>{`${language?.gettingCategories}...`}</p>
				</S.LoadingWrapper>
			);
		} else if (categoryOptions.length <= 0) {
			return (
				<S.WrapperEmpty>
					<p>{language?.noCategoriesFound}</p>
				</S.WrapperEmpty>
			);
		}

		if (props.allowReorder) {
			const flattened = flattenCategories(categoryOptions);

			return (
				<S.CategoryOptionsWrapper>
					<Droppable droppableId={'categories-root'}>
						{(provided) => (
							<div ref={provided.innerRef} {...provided.droppableProps}>
								<S.CategoriesList>
									{flattened.map((item, index) => {
										const active =
											props.categories?.find((c: PortalCategoryType) => item.category.id === c.id) !== undefined;
										const isSelected = selectedIds.has(item.category.id);

										return (
											<Draggable key={item.category.id} draggableId={item.category.id} index={index}>
												{(provided, snapshot) => {
													const dragging = snapshot.isDragging || isSelected;

													return (
														<S.CategoryDragWrapper
															ref={provided.innerRef}
															{...provided.draggableProps}
															{...(snapshot.isDragging && provided.dragHandleProps)}
															level={item.level}
															isDragging={dragging}
															parentDragging={isSelected && !snapshot.isDragging && isDragging}
															style={{
																...provided.draggableProps.style,
																...(isSelected && !snapshot.isDragging && isDragging
																	? {
																			transform: 'scale(1)',
																			backgroundColor: theme.colors.container.primary.active,
																			borderRadius: STYLING.dimensions.radius.alt2,
																			transition: 'all 200ms ease',
																			zIndex: 999,
																			pointerEvents: 'none',
																	  }
																	: {}),
															}}
														>
															<S.CategoryDrag level={item.level} isDragging={snapshot.isDragging}>
																<S.CategoryDragHandle {...provided.dragHandleProps}>
																	<ReactSVG src={ASSETS.drag} />
																</S.CategoryDragHandle>
																<S.CategoryContent>
																	<Button
																		type={'alt3'}
																		label={item.category.name}
																		handlePress={() => handleSelectCategory(item.category.id)}
																		active={active}
																		disabled={unauthorized || categoryLoading || isDragging}
																		icon={active ? ASSETS.close : ASSETS.add}
																	/>
																	{snapshot.isDragging && selectedIds.size > 1 && (
																		<div className={'notification'}>
																			<span>{selectedIds.size}</span>
																		</div>
																	)}
																</S.CategoryContent>
															</S.CategoryDrag>
														</S.CategoryDragWrapper>
													);
												}}
											</Draggable>
										);
									})}
								</S.CategoriesList>
								{provided.placeholder}
							</div>
						)}
					</Droppable>
				</S.CategoryOptionsWrapper>
			);
		}

		return (
			<S.CategoryOptionsWrapper>
				<CategoryOptions categories={categoryOptions} />
			</S.CategoryOptionsWrapper>
		);
	}

	const content = (
		<>
			<S.Wrapper>
				<S.CategoriesAction>
					<S.CategoriesParentAction>
						<CloseHandler
							callback={() => setShowParentOptions(false)}
							active={showParentOptions}
							disabled={!showParentOptions}
						>
							<S.CategoriesParentSelectAction>
								<Button
									type={'primary'}
									label={getParentDisplayLabel()}
									handlePress={() => setShowParentOptions(!showParentOptions)}
									disabled={unauthorized || !categoryOptions?.length || categoryLoading}
									icon={ASSETS.arrow}
									height={42.5}
									fullWidth
								/>
							</S.CategoriesParentSelectAction>
							{showParentOptions && (
								<S.ParentCategoryDropdown className={'border-wrapper-alt1 fade-in scroll-wrapper-hidden'}>
									<S.ParentCategoryOptions>
										<S.ParentCategoryOption
											level={1}
											onClick={() => {
												setParentCategory(null);
												setShowParentOptions(false);
											}}
										>
											<span>{language?.none}</span>
										</S.ParentCategoryOption>
										<S.Divider />
										{renderParentCategoryOptions(categoryOptions)}
									</S.ParentCategoryOptions>
								</S.ParentCategoryDropdown>
							)}
						</CloseHandler>
					</S.CategoriesParentAction>
					<S.CategoriesAddAction>
						<Button
							type={'alt4'}
							label={language?.add}
							handlePress={addCategory}
							disabled={unauthorized || !newCategoryName || categoryLoading}
							loading={categoryLoading}
							icon={ASSETS.add}
							iconLeftAlign
						/>
						<FormField
							value={newCategoryName}
							onChange={(e: any) => setNewCategoryName(e.target.value)}
							invalid={{ status: false, message: null }}
							disabled={!portalProvider.permissions?.updatePortalMeta || categoryLoading}
							hideErrorMessage
							sm
						/>
					</S.CategoriesAddAction>
				</S.CategoriesAction>
				<S.CategoriesBody>{getCategories()}</S.CategoriesBody>
				{props.showActions && (
					<S.CategoriesFooter>
						{props.closeAction && (
							<Button type={'alt3'} label={language?.close} handlePress={() => props.closeAction()} />
						)}
						<Button
							type={'alt3'}
							label={language?.remove}
							handlePress={() => setShowDeleteConfirmation(true)}
							disabled={unauthorized || !props.categories?.length || categoryLoading}
							loading={false}
							icon={ASSETS.delete}
							iconLeftAlign
							warning
						/>
					</S.CategoriesFooter>
				)}
			</S.Wrapper>
			{showDeleteConfirmation && (
				<Modal header={language?.confirmDeletion} handleClose={() => setShowDeleteConfirmation(false)}>
					<S.ModalWrapper>
						<S.ModalBodyWrapper>
							<p>{language?.categoryDeleteConfirmationInfo}</p>
							<S.ModalBodyElements>
								{props.categories.map((category: PortalCategoryType, index: number) => {
									return (
										<S.ModalBodyElement key={index}>
											<span>{`· ${category.name}`}</span>
										</S.ModalBodyElement>
									);
								})}
							</S.ModalBodyElements>
						</S.ModalBodyWrapper>
						<S.ModalActionsWrapper>
							<Button
								type={'primary'}
								label={language?.cancel}
								handlePress={() => setShowDeleteConfirmation(false)}
								disabled={categoryLoading}
							/>
							<Button
								type={'primary'}
								label={language?.categoryDeleteConfirmation}
								handlePress={() => deleteCategories()}
								disabled={!props.categories?.length || categoryLoading}
								loading={categoryLoading}
								icon={ASSETS.delete}
								iconLeftAlign
								warning
							/>
						</S.ModalActionsWrapper>
					</S.ModalWrapper>
				</Modal>
			)}
		</>
	);

	if (props.allowReorder) {
		return (
			<DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
				{content}
			</DragDropContext>
		);
	}

	return content;
}
