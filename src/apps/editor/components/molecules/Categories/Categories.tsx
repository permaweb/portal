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
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';
import { useCategoriesWithReorder } from 'hooks/useCategoriesWithReorder';

export default function Categories(props: {
	categories: PortalCategoryType[];
	setCategories: (categories: PortalCategoryType[]) => void;
	includeChildrenOnSelect?: boolean;
	selectOnAdd?: boolean;
	showActions?: boolean;
	closeAction?: () => void;
	skipAuthCheck?: boolean;
	allowReorder?: boolean;
	inlineAdd?: boolean;
}) {
	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];
	const theme = useTheme();
	const unauthorized = !portalProvider.permissions?.updatePortalMeta && !props.skipAuthCheck;

	const {
		addCategory,
		categoryOptions,
		setCategoryOptions,
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
		findCategoryById,
		getEffectiveParentId,
	} = useCategoriesWithReorder({
		categories: props.categories,
		setCategories: props.setCategories,
		skipAuthCheck: props.skipAuthCheck,
		allowReorder: props.allowReorder,
		unauthorized,
		portalId: portalProvider.current?.id || null,
		portalCategories: portalProvider.current?.categories || [],
		refreshCurrentPortal: portalProvider.refreshCurrentPortal,
	});
	React.useEffect(() => {
		if (portalProvider.current?.id) {
			if (portalProvider.current.categories) setCategoryOptions(portalProvider.current.categories);
		}
	}, [portalProvider.current]);
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
											<React.Fragment key={item.category.id}>
												<Draggable draggableId={item.category.id} index={index}>
													{(provided, snapshot) => {
														const dragging = snapshot.isDragging || isSelected;

														return (
															<S.CategoryDragWrapper
																ref={(el) => {
																	provided.innerRef(el);
																	if (el) {
																		categoryElementRefs.current.set(item.category.id, el);
																	}
																}}
																{...provided.draggableProps}
																{...(snapshot.isDragging && provided.dragHandleProps)}
																level={item.level}
																isDragging={dragging}
																parentDragging={isSelected && !snapshot.isDragging && isDragging}
																style={{
																	...provided.draggableProps.style,
																	...(isSelected && !snapshot.isDragging && isDragging
																		? {
																				// transform: 'scale(1)',
																				backgroundColor: theme.colors.container.primary.active,
																				borderRadius: STYLING.dimensions.radius.alt2,
																				transition: 'all 200ms ease',
																				zIndex: 999,
																				pointerEvents: 'none',
																		  }
																		: {}),
																}}
															>
																<S.CategoryDrag
																	level={item.level}
																	isDragging={snapshot.isDragging}
																	className={dragOverId === item.category.id ? 'can-be-parent' : ''}
																>
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
												{(() => {
													const shouldShow = showChildDropZone && dragOverId === item.category.id;
													if (shouldShow) {
														console.log('Showing ChildDropZone for:', item.category.name);
													}
													return shouldShow ? <S.ChildDropZone visible={true} level={item.level} /> : null;
												})()}
											</React.Fragment>
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

	function getCategoryAdd() {
		return (
			<S.CategoriesAction>
				<S.CategoriesAddAction
					onSubmit={addCategory}
					onKeyDownCapture={(e) => {
						if (e.key === 'Enter') {
							e.nativeEvent.stopImmediatePropagation();
						}
					}}
				>
					<Button
						type={'alt4'}
						label={
							getEffectiveParentId()
								? `${language?.addTo ?? 'Add to'} ${
										findCategoryById(categoryOptions ?? [], getEffectiveParentId())?.name ?? ''
								  }`
								: language?.add
						}
						handlePress={addCategory}
						disabled={unauthorized || !newCategoryName || categoryLoading}
						loading={categoryLoading}
						icon={ASSETS.add}
						iconLeftAlign
						formSubmit
					/>
					<FormField
						value={newCategoryName}
						onChange={(e: any) => setNewCategoryName(e.target.value)}
						invalid={{ status: false, message: null }}
						disabled={!portalProvider.permissions?.updatePortalMeta || categoryLoading}
						autoFocus={showCategoryAdd}
						hideErrorMessage
						sm
					/>
				</S.CategoriesAddAction>
			</S.CategoriesAction>
		);
	}

	const content = (
		<>
			<S.Wrapper>
				{props.inlineAdd && getCategoryAdd()}
				<S.CategoriesBody>{getCategories()}</S.CategoriesBody>
				{!props.inlineAdd && (
					<S.CategoriesAdd>
						{showCategoryAdd ? (
							<>
								{getCategoryAdd()}
								<S.CategoriesClose>
									<Button
										type={'primary'}
										label={language.close}
										handlePress={() => setShowCategoryAdd(false)}
										icon={ASSETS.close}
										iconLeftAlign
										height={40}
										fullWidth
									/>
								</S.CategoriesClose>
							</>
						) : (
							<Button
								type={'primary'}
								label={language.addCategory}
								handlePress={() => setShowCategoryAdd(true)}
								disabled={!portalProvider.permissions?.updatePortalMeta}
								icon={ASSETS.add}
								iconLeftAlign
								height={40}
								fullWidth
							/>
						)}
					</S.CategoriesAdd>
				)}
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
			<DragDropContext onDragStart={handleDragStart} onDragUpdate={handleDragUpdate} onDragEnd={handleDragEnd}>
				{content}
			</DragDropContext>
		);
	}

	return content;
}
