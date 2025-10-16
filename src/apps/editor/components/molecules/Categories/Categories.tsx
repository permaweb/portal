import React from 'react';
import { ReactSVG } from 'react-svg';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { useTheme } from 'styled-components';

import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
import { Checkbox } from 'components/atoms/Checkbox';
import { FormField } from 'components/atoms/FormField';
import { Modal } from 'components/atoms/Modal';
import { ICONS, STYLING } from 'helpers/config';
import { PortalCategoryType } from 'helpers/types';
import { useCategoriesWithReorder } from 'hooks/useCategoriesWithReorder';
import { useLanguageProvider } from 'providers/LanguageProvider';

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
	inlineAdd?: boolean;
}) {
	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];
	const theme = useTheme();
	const unauthorized = !portalProvider.permissions?.updatePortalMeta && !props.skipAuthCheck;
	const [openMetadata, setOpenMetadata] = React.useState<{
		open: boolean;
		categoryId: string | null;
		description?: string;
		template?: string;
		hidden?: boolean;
	}>({ open: false, categoryId: null });

	type TemplateOption = { label: string; value: string };

	const templateOptions: TemplateOption[] = [];

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
		updateCategory,
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
		selectOnAdd: props.selectOnAdd,
		allowReorder: props.allowReorder,
		unauthorized,
		portalId: portalProvider.current?.id || null,
		portalCategories: portalProvider.current?.categories || [],
		refreshCurrentPortal: portalProvider.refreshCurrentPortal,
	});

	function openCategorySettings(category: PortalCategoryType) {
		setOpenMetadata({
			open: true,
			categoryId: category.id,
			description: category?.metadata?.description,
			template: category?.metadata?.template,
			hidden: category?.metadata?.hidden,
		});
	}

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
									<ReactSVG src={ICONS.drag} />
								</S.CategoryDragHandle>
								<S.CategoryContent>
									<Button
										type={'alt3'}
										label={category.name}
										handlePress={() => handleSelectCategory(category.id)}
										active={active}
										disabled={unauthorized || categoryLoading || isDragging}
										icon={active ? ICONS.close : ICONS.add}
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
						icon={active ? ICONS.close : ICONS.add}
					/>
				</S.CategoryOption>
				{category.children && category.children.length > 0 && (
					<CategoryOptions categories={category.children} level={level + 1} />
				)}
			</React.Fragment>
		);
	};

	const CategoryOptions = ({ categories, level = 0 }: { categories: PortalCategoryType[]; level?: number }) => {
		const isDragEnabled = props.allowReorder && portalProvider.permissions?.updatePortalMeta;

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

		if (props.allowReorder && portalProvider.permissions?.updatePortalMeta) {
			const flattened = flattenCategories(categoryOptions);

			return (
				<S.CategoryOptionsWrapper>
					<Droppable droppableId={'categories-root'}>
						{(provided) => (
							<div ref={provided.innerRef} {...provided.droppableProps}>
								<S.CategoriesList>
									{flattened.map((item, index) => {
										console.log('Rendering category item:', item);
										const active =
											props.categories?.find((c: PortalCategoryType) => item.category.id === c.id) !== undefined;
										const isSelected = selectedIds.has(item.category.id);
										const disabled = unauthorized || categoryLoading || isDragging;
										const addDisabled = unauthorized || categoryLoading || isDragging || item.category.metadata?.hidden;

										const onChipClick = () => {
											if (!addDisabled) handleSelectCategory(item.category.id);
										};

										const onChipKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
											if (disabled) return;
											if (e.key === 'Enter' || e.key === ' ') {
												e.preventDefault();
												handleSelectCategory(item.category.id);
											}
										};

										const onOpenSettings: React.MouseEventHandler<HTMLButtonElement> = (e) => {
											e.stopPropagation();
											if (disabled) return;
											openCategorySettings(item.category); // wire to your modal later
										};

										const fieldsDisabled = item?.category?.metadata?.hidden || categoryLoading;

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
																		<ReactSVG src={ICONS.drag} />
																	</S.CategoryDragHandle>
																	<S.CategoryContent>
																		<S.CategoryPill
																			role="button"
																			tabIndex={disabled ? -1 : 0}
																			aria-pressed={active}
																			aria-disabled={disabled}
																			$active={!!active}
																			$disabled={!!addDisabled}
																			onClick={onChipClick}
																			onKeyDown={onChipKeyDown}
																		>
																			<S.CategoryIcon src={active ? ICONS.close : ICONS.add} />
																			<S.CategoryLabel>{item.category.name}</S.CategoryLabel>
																			<S.CategorySettingsBtn
																				type="button"
																				aria-label="Category settings"
																				title="Settings"
																				onClick={onOpenSettings}
																				$disabled={!!disabled}
																			>
																				<S.CategoryIcon src={ICONS.settings} />
																			</S.CategorySettingsBtn>
																		</S.CategoryPill>
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
												{openMetadata.open && (
													<Modal
														header={'Category Metadata'}
														handleClose={() =>
															setOpenMetadata({
																open: false,
																categoryId: null,
																description: undefined,
																template: undefined,
																hidden: undefined,
															})
														}
													>
														<S.ModalWrapper>
															<S.ModalBodyWrapper>
																<S.ModalForm>
																	<S.FieldRow>
																		<S.FieldLabel htmlFor="field-description">
																			{language?.description ?? 'Description'}
																		</S.FieldLabel>
																		<S.TextInput
																			id="field-description"
																			placeholder={
																				language?.descriptionPlaceholder ??
																				'Add a short description to display on hover'
																			}
																			value={openMetadata.description ?? item.category?.metadata?.description ?? ''}
																			onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
																				setOpenMetadata((prev) => ({
																					...prev,
																					description: e.target.value,
																				}));
																			}}
																			disabled={fieldsDisabled}
																		/>
																	</S.FieldRow>
																	<S.FieldRow>
																		<S.FieldLabel htmlFor="field-template">
																			{language?.template ?? 'Template'}
																		</S.FieldLabel>
																		<S.Select
																			id="field-template"
																			value={openMetadata.template ?? item.category?.metadata?.template ?? ''}
																			onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
																				setOpenMetadata((prev) => ({ ...prev, template: e.target.value }));
																			}}
																			disabled={fieldsDisabled || !templateOptions.length}
																		>
																			<option value="" disabled>
																				{language?.templatePlaceholder ?? 'Select a template'}
																			</option>
																			{templateOptions.map((opt) => (
																				<option key={opt.value} value={opt.value}>
																					{opt.label}
																				</option>
																			))}
																		</S.Select>
																	</S.FieldRow>
																	<S.FieldRow>
																		<S.FieldLabel htmlFor="field-hidden">{language?.hidden ?? 'Hidden'}</S.FieldLabel>
																		<S.Inline>
																			<Checkbox
																				checked={openMetadata.hidden ?? item.category?.metadata?.hidden ?? false}
																				disabled={false}
																				handleSelect={() =>
																					setOpenMetadata((prev) => ({
																						...prev,
																						hidden: !(prev?.hidden ?? item.category?.metadata?.hidden),
																					}))
																				}
																			/>
																			<span id="field-hidden-help">
																				{language?.hiddenHelp ?? 'If checked, this category won’t be visible.'}
																			</span>
																		</S.Inline>
																	</S.FieldRow>
																</S.ModalForm>
															</S.ModalBodyWrapper>
															<S.ModalActionsWrapper>
																<Button
																	type={'primary'}
																	label={language?.cancel}
																	handlePress={() =>
																		setOpenMetadata({
																			open: false,
																			categoryId: null,
																		})
																	}
																	disabled={categoryLoading}
																/>
																<Button
																	type={'primary'}
																	label={'Save Changes'}
																	handlePress={() =>
																		updateCategory(openMetadata.categoryId, {
																			description: openMetadata.description,
																			template: openMetadata.template,
																			hidden: openMetadata.hidden,
																		})
																	}
																	disabled={categoryLoading}
																	loading={categoryLoading}
																/>
															</S.ModalActionsWrapper>
														</S.ModalWrapper>
													</Modal>
												)}
												{(() => {
													const shouldShow = showChildDropZone && dragOverId === item.category.id;
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
						icon={ICONS.add}
						iconLeftAlign
						formSubmit
					/>
					<FormField
						value={newCategoryName}
						onChange={(e: any) => setNewCategoryName(e.target.value)}
						invalid={{ status: false, message: null }}
						disabled={
							!portalProvider.permissions?.updatePortalMeta || !portalProvider.current?.categories || categoryLoading
						}
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
										icon={ICONS.close}
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
								icon={ICONS.add}
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
							icon={ICONS.delete}
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
								icon={ICONS.delete}
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
