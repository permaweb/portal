import React from 'react';

import { buildStoreNamespace, updateZone } from '@permaweb/libs';

import { Button } from 'components/atoms/Button';
import { Checkbox } from 'components/atoms/Checkbox';
import { FormField } from 'components/atoms/FormField';
import { ASSETS } from 'helpers/config';
import { PortalTopicType } from 'helpers/types';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePortalProvider } from 'providers/PortalProvider';
import { CloseHandler } from 'wrappers/CloseHandler';

import * as S from './styles';
import { IProps } from './types';

type Category = {
	id: string;
	name: string;
	parent?: string;
	children?: Category[];
};

export default function ArticleToolbarPost(props: IProps) {
	const arProvider = useArweaveProvider();
	const portalProvider = usePortalProvider();

	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [categories, setCategories] = React.useState<Category[]>([
		{
			id: '1731509563391',
			name: 'test1',
			parent: null,
			children: [
				{
					id: '1731509573972',
					name: 'test1child1',
					parent: '1731509563391',
					children: [
						{
							id: '1731509592854',
							name: 'test1child1child',
							parent: '1731509573972',
							children: [],
						},
					],
				},
			],
		},
		{
			id: '1731509565168',
			name: 'test2',
			parent: null,
			children: [],
		},
		{
			id: '1731509567425',
			name: 'test3',
			parent: null,
			children: [
				{
					id: '1731509606993',
					name: 'test3child1',
					parent: '1731509567425',
					children: [],
				},
			],
		},
		{
			id: '1731509581549',
			name: 'test2child1',
			parent: null,
			children: [],
		},
	]);
	const [newCategoryName, setNewCategoryName] = React.useState<string>('');
	const [parentCategory, setParentCategory] = React.useState<string | null>(null);
	const [showParentOptions, setShowParentOptions] = React.useState<boolean>(false);

	const [topicOptions, setTopicOptions] = React.useState<string[]>([]);
	const [newTopic, setNewTopic] = React.useState<string>('');
	const [topicLoading, setTopicLoading] = React.useState<boolean>(false);

	React.useEffect(() => {
		if (portalProvider.current?.id && portalProvider.current?.topics) {
			setTopicOptions(portalProvider.current.topics.map((topic: PortalTopicType) => topic.value));
		}
	}, [portalProvider.current]);

	const addCategory = () => {
		if (newCategoryName) {
			const newCategory: Category = {
				id: Date.now().toString(),
				name: newCategoryName,
				parent: parentCategory,
				children: [],
			};

			const addToParent = (categories: Category[]): Category[] => {
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

			setCategories((prevCategories) => {
				if (parentCategory) {
					return addToParent(prevCategories);
				}
				return [...prevCategories, newCategory];
			});

			setNewCategoryName('');
			setParentCategory(null);
		}
	};

	const addTopic = async () => {
		if (newTopic && !props.topics.includes(newTopic) && portalProvider.current?.id && arProvider.wallet) {
			setTopicLoading(true);
			try {
				const topicUpdateId = await updateZone(
					{
						[buildStoreNamespace('topic', newTopic)]: { value: newTopic },
					},
					portalProvider.current.id,
					arProvider.wallet
				);

				console.log(`Topic update: ${topicUpdateId}`);

				setTopicOptions((prevOptions) => [...prevOptions, newTopic]);
				props.setTopics([...props.topics, newTopic]);
				setNewTopic('');
			} catch (e: any) {
				console.error(e);
			}
			setTopicLoading(false);
		}
	};

	const removeTopic = (topic: string) => {
		props.setTopics(props.topics.filter((t) => t !== topic));
	};

	const topicActionDisabled =
		!arProvider.wallet || !portalProvider.current?.id || !newTopic || topicOptions.includes(newTopic) || topicLoading;

	const CategoryOptions = ({ categories, level = 0 }: { categories: Category[]; level?: number }) => (
		<S.CategoriesList>
			{categories.map((category) => (
				<React.Fragment key={category.id}>
					<S.CategoryOption level={level}>
						<Checkbox checked={true} handleSelect={() => {}} disabled={false} />
						<span>{category.name}</span>
					</S.CategoryOption>
					{category.children && category.children.length > 0 && (
						<CategoryOptions categories={category.children} level={level + 1} />
					)}
				</React.Fragment>
			))}
		</S.CategoriesList>
	);

	const renderParentCategoryOptions = (categories: Category[], level = 1) =>
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

	return (
		<S.Wrapper>
			<S.Section>
				<S.SectionHeader>
					<p>{language.categories}</p>
				</S.SectionHeader>
				<S.SectionBody>
					<S.CategoriesWrapper>
						<S.CategoriesAction>
							<S.CategoriesAddAction>
								<Button
									type={'alt3'}
									label={language.add}
									handlePress={addCategory}
									disabled={!newCategoryName}
									loading={false}
								/>
							</S.CategoriesAddAction>
							<FormField
								value={newCategoryName}
								onChange={(e: any) => setNewCategoryName(e.target.value)}
								invalid={{ status: false, message: null }}
								disabled={false}
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
											label={parentCategory ?? language.selectParentCategory}
											handlePress={() => setShowParentOptions(!showParentOptions)}
											disabled={!newCategoryName}
											icon={ASSETS.arrow}
											height={42.5}
											fullWidth
										/>
									</S.CategoriesParentSelectAction>
									{showParentOptions && (
										<S.ParentCategoryDropdown className={'border-wrapper-alt3 fade-in scroll-wrapper'}>
											<S.ParentCategoryOptions>{renderParentCategoryOptions(categories)}</S.ParentCategoryOptions>
										</S.ParentCategoryDropdown>
									)}
								</CloseHandler>
							</S.CategoriesParentAction>
						</S.CategoriesAction>
						<S.CategoriesBody>
							<CategoryOptions categories={categories} />
						</S.CategoriesBody>
					</S.CategoriesWrapper>
				</S.SectionBody>
			</S.Section>
			<S.TopicsSection>
				<S.SectionHeader>
					<p>{language.topics}</p>
				</S.SectionHeader>
				<S.SectionBody>
					<S.TopicsWrapper>
						<S.TopicsAction>
							<Button
								type={'alt3'}
								label={language.add}
								handlePress={addTopic}
								disabled={topicActionDisabled}
								loading={topicLoading}
								formSubmit
							/>
							<FormField
								value={newTopic}
								onChange={(e: any) => setNewTopic(e.target.value)}
								invalid={{ status: topicOptions.includes(newTopic), message: null }}
								disabled={topicLoading}
								hideErrorMessage
								sm
							/>
						</S.TopicsAction>
						<S.TopicsBody>
							{topicOptions?.length > 0 ? (
								<>
									{topicOptions.map((topic: string) => {
										const active = props.topics ? props.topics.includes(topic) : false;
										return (
											<Button
												key={topic}
												type={'alt3'}
												label={topic}
												handlePress={() => (active ? removeTopic(topic) : props.setTopics([...props.topics, topic]))}
												active={active}
												icon={active ? ASSETS.close : ASSETS.add}
											/>
										);
									})}
								</>
							) : (
								<S.WrapperEmpty>
									<p>{language.addTopic}</p>
								</S.WrapperEmpty>
							)}
						</S.TopicsBody>
					</S.TopicsWrapper>
				</S.SectionBody>
			</S.TopicsSection>
		</S.Wrapper>
	);
}
