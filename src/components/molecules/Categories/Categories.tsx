import React from 'react';

import { Button } from 'components/atoms/Button';
import { FormField } from 'components/atoms/FormField';
import { Notification } from 'components/atoms/Notification';
import { ASSETS } from 'helpers/config';
import { NotificationType, PortalCategoryType } from 'helpers/types';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';
import { usePortalProvider } from 'providers/PortalProvider';
import { CloseHandler } from 'wrappers/CloseHandler';

import { Modal } from '../../atoms/Modal';

import * as S from './styles';
import { IProps } from './types';

export default function Categories(props: IProps) {
	const arProvider = useArweaveProvider();
	const permawebProvider = usePermawebProvider();
	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [categoryOptions, setCategoryOptions] = React.useState<PortalCategoryType[] | null>(null);
	const [newCategoryName, setNewCategoryName] = React.useState<string>('');
	const [parentCategory, setParentCategory] = React.useState<string | null>(null);
	const [showParentOptions, setShowParentOptions] = React.useState<boolean>(false);
	const [showDeleteConfirmation, setShowDeleteConfirmation] = React.useState<boolean>(false);
	const [categoryLoading, setCategoryLoading] = React.useState<boolean>(false);
	const [categoryResponse, setCategoryResponse] = React.useState<NotificationType | null>(null);

	React.useEffect(() => {
		if (portalProvider.current?.id) {
			if (portalProvider.current.categories) setCategoryOptions(portalProvider.current.categories);
		}
	}, [portalProvider.current]);

	const addCategory = async () => {
		if (newCategoryName && portalProvider.current?.id && arProvider.wallet) {
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
					setCategoryResponse({ status: 'warning', message: language.categoryDuplicateError });
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
				setCategoryResponse({ status: 'success', message: `${language.categoryAdded}!` });
				setNewCategoryName('');
				setParentCategory(null);
			} catch (e: any) {
				setCategoryResponse({ status: 'warning', message: e.message ?? 'Error adding category' });
			}
			setCategoryLoading(false);
		}
	};

	const deleteCategories = async () => {
		if (arProvider.wallet && portalProvider.current?.categories && props.categories?.length) {
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
				setCategoryResponse({ status: 'success', message: `${language.categoriesUpdated}!` });
				setShowDeleteConfirmation(false);
			} catch (e: any) {
				setCategoryResponse({ status: 'warning', message: e.message ?? 'Error deleting categories' });
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

	const CategoryOptions = ({ categories, level = 0 }: { categories: PortalCategoryType[]; level?: number }) => (
		<S.CategoriesList>
			{categories.map((category) => {
				const active = props.categories?.find((c: PortalCategoryType) => category.id === c.id) !== undefined;
				return (
					<React.Fragment key={category.id}>
						<S.CategoryOption level={level}>
							<Button
								type={'alt3'}
								label={category.name}
								handlePress={() => handleSelectCategory(category.id)}
								active={active}
								disabled={categoryLoading}
								icon={active ? ASSETS.close : ASSETS.add}
							/>
						</S.CategoryOption>
						{category.children && category.children.length > 0 && (
							<CategoryOptions categories={category.children} level={level + 1} />
						)}
					</React.Fragment>
				);
			})}
		</S.CategoriesList>
	);

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
			return parent ? parent.name : language.selectParentCategory;
		}
		return language.selectParentCategory;
	}

	function getCategories() {
		if (!categoryOptions) {
			return (
				<S.LoadingWrapper>
					<p>{`${language.gettingCategories}...`}</p>
				</S.LoadingWrapper>
			);
		} else if (categoryOptions.length <= 0) {
			return (
				<S.WrapperEmpty>
					<p>{language.noCategoriesFound}</p>
				</S.WrapperEmpty>
			);
		}

		return (
			<S.CategoryOptionsWrapper>
				<CategoryOptions categories={categoryOptions} />
			</S.CategoryOptionsWrapper>
		);
	}

	return (
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
									disabled={!categoryOptions?.length || categoryLoading}
									icon={ASSETS.arrow}
									height={42.5}
									fullWidth
								/>
							</S.CategoriesParentSelectAction>
							{showParentOptions && (
								<S.ParentCategoryDropdown className={'border-wrapper-alt1 fade-in scroll-wrapper'}>
									<S.ParentCategoryOptions>
										<S.ParentCategoryOption
											level={1}
											onClick={() => {
												setParentCategory(null);
												setShowParentOptions(false);
											}}
										>
											<span>{language.none}</span>
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
							label={language.add}
							handlePress={addCategory}
							disabled={!newCategoryName || categoryLoading}
							loading={categoryLoading}
							icon={ASSETS.add}
							iconLeftAlign
						/>
						<FormField
							value={newCategoryName}
							onChange={(e: any) => setNewCategoryName(e.target.value)}
							invalid={{ status: false, message: null }}
							disabled={categoryLoading}
							hideErrorMessage
							sm
						/>
					</S.CategoriesAddAction>
				</S.CategoriesAction>
				<S.CategoriesBody>{getCategories()}</S.CategoriesBody>
				{props.showActions && (
					<S.CategoriesFooter>
						{props.closeAction && (
							<Button type={'alt3'} label={language.close} handlePress={() => props.closeAction()} />
						)}
						<Button
							type={'alt3'}
							label={language.remove}
							handlePress={() => setShowDeleteConfirmation(true)}
							disabled={!props.categories?.length || categoryLoading}
							loading={false}
							icon={ASSETS.delete}
							iconLeftAlign
							warning
						/>
					</S.CategoriesFooter>
				)}
			</S.Wrapper>
			{showDeleteConfirmation && (
				<Modal header={language.confirmDeletion} handleClose={() => setShowDeleteConfirmation(false)}>
					<S.ModalWrapper>
						<S.ModalBodyWrapper>
							<p>{language.categoryDeleteConfirmationInfo}</p>
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
								label={language.cancel}
								handlePress={() => setShowDeleteConfirmation(false)}
								disabled={categoryLoading}
							/>
							<Button
								type={'primary'}
								label={language.categoryDeleteConfirmation}
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
			{categoryResponse && (
				<Notification
					type={categoryResponse.status}
					message={categoryResponse.message}
					callback={() => setCategoryResponse(null)}
				/>
			)}
		</>
	);
}
