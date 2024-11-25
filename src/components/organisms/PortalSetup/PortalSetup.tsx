import React from 'react';

import { mapToProcessCase } from '@permaweb/libs';

import { Button } from 'components/atoms/Button';
import { IconButton } from 'components/atoms/IconButton';
import { CategoryList } from 'components/molecules/CategoryList';
import { LinkList } from 'components/molecules/LinkList';
import { Modal } from 'components/molecules/Modal';
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

	function handleDeleteCategories() {
		console.log(mapToProcessCase(selectedCategories));
	}

	function handleDeleteTopics() {
		console.log(mapToProcessCase(selectedTopics));
	}

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

	function getCategoryAction() {
		return (
			<S.BodyWrapper>
				<CategoryList
					categories={selectedCategories}
					setCategories={(categories: PortalCategoryType[]) => setSelectedCategories(categories)}
				/>
				<S.CategoryActionsWrapper>
					{props.type === 'header' && (
						<Button
							type={'alt3'}
							label={language.close}
							handlePress={() => setShowCategoryAction(false)}
							disabled={false}
						/>
					)}
					<Button
						type={'alt3'}
						label={language.delete}
						handlePress={() => handleDeleteCategories()}
						disabled={!selectedCategories?.length}
						icon={ASSETS.delete}
						iconLeftAlign
					/>
				</S.CategoryActionsWrapper>
			</S.BodyWrapper>
		);
	}

	function getTopicAction() {
		return (
			<S.TopicsBodyWrapper>
				<TopicList topics={selectedTopics} setTopics={(topics: string[]) => setSelectedTopics(topics)} />
				<S.BodyActionsWrapper>
					{props.type === 'header' && (
						<Button
							type={'alt3'}
							label={language.close}
							handlePress={() => setShowTopicAction(false)}
							disabled={false}
						/>
					)}
					<Button
						type={'alt3'}
						label={language.delete}
						handlePress={() => handleDeleteTopics()}
						disabled={!selectedTopics?.length}
						icon={ASSETS.delete}
						iconLeftAlign
					/>
				</S.BodyActionsWrapper>
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
			<S.Section type={props.type} className={props.type === 'header' ? '' : 'border-wrapper-alt2'}>
				<S.SectionHeader>
					<p>{`${language.siteLinks}${
						portalProvider.current?.links ? ` (${portalProvider.current.links.length})` : ''
					}`}</p>
					{props.type === 'header' && (
						<IconButton
							type={'primary'}
							active={false}
							src={ASSETS.write}
							handlePress={() => setShowLinkAction(true)}
							dimensions={{ wrapper: 23.5, icon: 13.5 }}
							tooltip={language.editSiteLinks}
							tooltipPosition={'bottom-right'}
							noFocus
						/>
					)}
				</S.SectionHeader>
				{props.type === 'detail' && getLinkAction()}
			</S.Section>
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
							src={ASSETS.write}
							handlePress={() => setShowCategoryAction(true)}
							dimensions={{ wrapper: 23.5, icon: 13.5 }}
							tooltip={language.editSiteCategories}
							tooltipPosition={'bottom-right'}
							noFocus
						/>
					)}
				</S.CategoriesHeader>
				{props.type === 'detail' && getCategoryAction()}
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
							src={ASSETS.write}
							handlePress={() => setShowTopicAction(true)}
							dimensions={{ wrapper: 23.5, icon: 13.5 }}
							tooltip={language.editPostTopics}
							tooltipPosition={'bottom-right'}
							noFocus
						/>
					)}
				</S.SectionHeader>
				{props.type === 'detail' && getTopicAction()}
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
			{showCategoryAction && (
				<Modal header={language.editSiteCategories} handleClose={() => setShowCategoryAction(false)}>
					<S.CategoryModalWrapper>{getCategoryAction()}</S.CategoryModalWrapper>
				</Modal>
			)}
			{showTopicAction && (
				<Modal header={language.editPostTopics} handleClose={() => setShowTopicAction(false)}>
					<S.TopicModalWrapper>{getTopicAction()}</S.TopicModalWrapper>
				</Modal>
			)}
			{showLinkAction && (
				<Modal header={language.editSiteLinks} handleClose={() => setShowLinkAction(false)} allowOverflow>
					<S.LinkModalWrapper>{getLinkAction()}</S.LinkModalWrapper>
				</Modal>
			)}
		</>
	);
}
