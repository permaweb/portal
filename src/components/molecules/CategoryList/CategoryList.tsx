import React from 'react';

import { updateZone } from '@permaweb/libs';

import { Button } from 'components/atoms/Button';
import { Checkbox } from 'components/atoms/Checkbox';
import { FormField } from 'components/atoms/FormField';
import { ASSETS } from 'helpers/config';
import { CategoryType } from 'helpers/types';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePortalProvider } from 'providers/PortalProvider';
import { CloseHandler } from 'wrappers/CloseHandler';

import * as S from './styles';
import { IProps } from './types';

export default function CategoryList(props: IProps) {
	const arProvider = useArweaveProvider();
	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [categoryOptions, setCategoryOptions] = React.useState<CategoryType[]>([]);
	const [newCategoryName, setNewCategoryName] = React.useState<string>('');
	const [parentCategory, setParentCategory] = React.useState<string | null>(null);
	const [showParentOptions, setShowParentOptions] = React.useState<boolean>(false);
	const [categoryLoading, setCategoryLoading] = React.useState<boolean>(false);

	React.useEffect(() => {
		if (portalProvider.current?.id) {
			if (portalProvider.current.categories) setCategoryOptions(portalProvider.current.categories);
		}
	}, [portalProvider.current?.id]);

	// TODO: Handle duplicates
	const addCategory = async () => {
		if (newCategoryName && portalProvider.current?.id && arProvider.wallet) {
			setCategoryLoading(true);
			try {
				const newCategory: CategoryType = {
					id: Date.now().toString(),
					name: newCategoryName,
					parent: parentCategory,
					children: [],
				};

				const addToParent = (categories: CategoryType[]): CategoryType[] => {
					return categories.map((category) => {
						if (category.id === parentCategory) {
							return {
								...category,
								children: [...(category.children || []), newCategory],
							};
						} else if (category.children) {
							return { ...category, children: addToParent(category.children) };
						}
						return category;
					});
				};

				const updatedCategories = parentCategory ? addToParent(categoryOptions) : [...categoryOptions, newCategory];

				const categoryUpdateId = await updateZone(
					{
						categories: updatedCategories,
					},
					portalProvider.current.id,
					arProvider.wallet
				);

				portalProvider.refreshCurrentPortal();

				console.log(`Category update: ${categoryUpdateId}`);

				props.setCategories([...props.categories, newCategory]);
				setCategoryOptions(updatedCategories);
				setNewCategoryName('');
				setParentCategory(null);
			} catch (e: any) {
				console.error(e);
			}
			setCategoryLoading(false);
		}
	};

	const handleSelectCategory = (categoryId: string) => {
		const isSelected = props.categories.some((category) => category.id === categoryId);
		let updatedCategories: CategoryType[];
		if (isSelected) {
			updatedCategories = props.categories.filter((category) => category.id !== categoryId);
		} else {
			const categoryToAdd = findCategoryById(categoryOptions, categoryId);
			updatedCategories = categoryToAdd ? [...props.categories, categoryToAdd] : props.categories;
		}
		props.setCategories(updatedCategories);
	};

	const CategoryOptions = ({ categories, level = 0 }: { categories: CategoryType[]; level?: number }) => (
		<S.CategoriesList>
			{categories.map((category) => (
				<React.Fragment key={category.id}>
					<S.CategoryOption level={level}>
						<Checkbox
							checked={props.categories?.find((c: CategoryType) => category.id === c.id) !== undefined}
							handleSelect={() => handleSelectCategory(category.id)}
							disabled={categoryLoading}
						/>
						<span>{category.name}</span>
					</S.CategoryOption>
					{category.children && category.children.length > 0 && (
						<CategoryOptions categories={category.children} level={level + 1} />
					)}
				</React.Fragment>
			))}
		</S.CategoriesList>
	);

	const renderParentCategoryOptions = (categories: CategoryType[], level = 1) =>
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

	function findCategoryById(categories: CategoryType[], id: string): CategoryType | undefined {
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

	return (
		<S.Wrapper>
			<S.CategoriesAction>
				<S.CategoriesAddAction>
					<Button
						type={'alt3'}
						label={language.add}
						handlePress={addCategory}
						disabled={!newCategoryName || categoryLoading}
						loading={categoryLoading}
						icon={ASSETS.add}
						iconLeftAlign
					/>
				</S.CategoriesAddAction>
				<FormField
					value={newCategoryName}
					onChange={(e: any) => setNewCategoryName(e.target.value)}
					invalid={{ status: false, message: null }}
					disabled={categoryLoading}
					hideErrorMessage
					sm
				/>
				<S.CategoriesParentAction>
					<CloseHandler
						callback={() => {
							setShowParentOptions(false);
						}}
						active={showParentOptions}
						disabled={!showParentOptions}
					>
						<S.CategoriesParentSelectAction>
							<Button
								type={'primary'}
								label={getParentDisplayLabel()}
								handlePress={() => setShowParentOptions(!showParentOptions)}
								disabled={!newCategoryName || !categoryOptions?.length || categoryLoading}
								icon={ASSETS.arrow}
								height={42.5}
								fullWidth
							/>
						</S.CategoriesParentSelectAction>
						{showParentOptions && (
							<S.ParentCategoryDropdown className={'border-wrapper-alt1 fade-in scroll-wrapper'}>
								<S.ParentCategoryOptions>{renderParentCategoryOptions(categoryOptions)}</S.ParentCategoryOptions>
							</S.ParentCategoryDropdown>
						)}
					</CloseHandler>
				</S.CategoriesParentAction>
			</S.CategoriesAction>
			<S.CategoriesBody>
				{categoryOptions?.length > 0 ? (
					<CategoryOptions categories={categoryOptions} />
				) : (
					<S.WrapperEmpty>
						<p>{language.addCategory}</p>
					</S.WrapperEmpty>
				)}
			</S.CategoriesBody>
		</S.Wrapper>
	);
}
