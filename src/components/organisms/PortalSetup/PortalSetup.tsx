import React from 'react';

import { IconButton } from 'components/atoms/IconButton';
import { CategoryList } from 'components/molecules/CategoryList';
import { LinkList } from 'components/molecules/LinkList';
import { TopicList } from 'components/molecules/TopicList';
import { ASSETS } from 'helpers/config';
import { PortalCategoryType } from 'helpers/types';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePortalProvider } from 'providers/PortalProvider';

import * as S from './styles';
import { IProps } from './types';

// TODO: Topic edit / delete
// TODO: Category edit / delete
// TODO: Link edit / delete
export default function PortalSetup(props: IProps) {
	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [selectedCategories, setSelectedCategories] = React.useState<PortalCategoryType[]>([]);
	const [selectedTopics, setSelectedTopics] = React.useState<string[]>([]);
	const [showCategoryAction, setShowCategoryAction] = React.useState<boolean>(false);
	const [showTopicAction, setShowTopicAction] = React.useState<boolean>(false);
	const [showLinkAction, setShowLinkAction] = React.useState<boolean>(false);

	function getTotalCategoryCount(categories: PortalCategoryType[]) {
		let count = 0;

		function countChildren(categories: PortalCategoryType[]) {
			for (const category of categories) {
				count++;
				if (category.children && category.children.length > 0) {
					countChildren(category.children);
				}
			}
		}

		countChildren(categories);
		return count;
	}

	function handleSetCategories(categories: PortalCategoryType[]) {
		const updatedCategories: PortalCategoryType[] = [];
		const categoryIds = new Set<string>();

		function addCategories(categories: PortalCategoryType[]) {
			for (const category of categories) {
				if (!categoryIds.has(category.id)) {
					updatedCategories.push(category);
					categoryIds.add(category.id);
				}
				if (category.children && category.children.length > 0) {
					addCategories(category.children);
				}
			}
		}

		addCategories(categories);

		setSelectedCategories(updatedCategories);
	}

	function getCategoryAction() {
		return (
			<S.BodyWrapper>
				<CategoryList
					categories={selectedCategories}
					setCategories={(categories: PortalCategoryType[]) => handleSetCategories(categories)}
					includeChildrenOnSelect
					showActions
					closeAction={props.type === 'header' ? () => setShowCategoryAction(false) : null}
				/>
			</S.BodyWrapper>
		);
	}

	function getTopicAction() {
		return (
			<S.TopicsBodyWrapper>
				<TopicList
					topics={selectedTopics}
					setTopics={(topics: string[]) => setSelectedTopics(topics)}
					showActions
					closeAction={props.type === 'header' ? () => setShowTopicAction(false) : null}
				/>
			</S.TopicsBodyWrapper>
		);
	}

	function getLinkAction() {
		return (
			<S.LinksBodyWrapper>
				<LinkList type={props.type} />
			</S.LinksBodyWrapper>
		);
	}

	function linkSection() {
		return (
			<S.LinksSection type={props.type} className={props.type === 'header' ? '' : 'border-wrapper-alt2'}>
				<S.LinksHeader type={props.type}>
					<p>{`${language.siteLinks}${
						portalProvider.current?.links ? ` (${portalProvider.current.links.length})` : ''
					}`}</p>
					{props.type === 'header' && (
						<IconButton
							type={'primary'}
							active={false}
							src={showLinkAction ? ASSETS.close : ASSETS.write}
							handlePress={() => setShowLinkAction(!showLinkAction)}
							dimensions={{ wrapper: 23.5, icon: 13.5 }}
							tooltip={showLinkAction ? language.close : language.editSiteLinks}
							tooltipPosition={'bottom-right'}
							noFocus
						/>
					)}
				</S.LinksHeader>
				{(props.type === 'detail' || (props.type === 'header' && showLinkAction)) && getLinkAction()}
			</S.LinksSection>
		);
	}

	function categorySection() {
		return (
			<S.CategoriesSection type={props.type} className={props.type === 'header' ? '' : 'border-wrapper-alt2'}>
				<S.CategoriesHeader>
					<p>{`${language.siteCategories}${
						portalProvider.current?.categories ? ` (${getTotalCategoryCount(portalProvider.current.categories)})` : ''
					}`}</p>
					{props.type === 'header' && (
						<IconButton
							type={'primary'}
							active={false}
							src={showCategoryAction ? ASSETS.close : ASSETS.write}
							handlePress={() => setShowCategoryAction(!showCategoryAction)}
							dimensions={{ wrapper: 23.5, icon: 13.5 }}
							tooltip={showCategoryAction ? language.close : language.editSiteCategories}
							tooltipPosition={'bottom-right'}
							noFocus
						/>
					)}
				</S.CategoriesHeader>
				{(props.type === 'detail' || (props.type === 'header' && showCategoryAction)) && getCategoryAction()}
			</S.CategoriesSection>
		);
	}

	function topicSection() {
		return (
			<S.TopicsSection type={props.type} className={props.type === 'header' ? '' : 'border-wrapper-alt2'}>
				<S.SectionHeader>
					<p>{`${language.postTopics}${
						portalProvider.current?.topics ? ` (${portalProvider.current.topics.length})` : ''
					}`}</p>
					{props.type === 'header' && (
						<IconButton
							type={'primary'}
							active={false}
							src={showTopicAction ? ASSETS.close : ASSETS.write}
							handlePress={() => setShowTopicAction(!showTopicAction)}
							dimensions={{ wrapper: 23.5, icon: 13.5 }}
							tooltip={showTopicAction ? language.close : language.editPostTopics}
							tooltipPosition={'bottom-right'}
							noFocus
						/>
					)}
				</S.SectionHeader>
				{(props.type === 'detail' || (props.type === 'header' && showTopicAction)) && getTopicAction()}
			</S.TopicsSection>
		);
	}

	return (
		<>
			<S.Wrapper type={props.type}>
				<S.SectionWrapper type={props.type}>
					{linkSection()}
					{props.type === 'header' ? categorySection() : topicSection()}
				</S.SectionWrapper>
				{props.type === 'header' && <S.Divider />}
				<S.SectionWrapper type={props.type}>
					{props.type === 'header' ? topicSection() : categorySection()}
				</S.SectionWrapper>
			</S.Wrapper>
		</>
	);
}
