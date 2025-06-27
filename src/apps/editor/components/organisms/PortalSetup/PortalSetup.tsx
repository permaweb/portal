import React from 'react';

import { Categories } from 'editor/components/molecules/Categories';
import { Links } from 'editor/components/molecules/Links';
import { Topics } from 'editor/components/molecules/Topics';
import { usePortalProvider } from 'editor/providers/PortalProvider';
import { useSettingsProvider } from 'editor/providers/SettingsProvider';

import { IconButton } from 'components/atoms/IconButton';
import { ASSETS } from 'helpers/config';
import { PortalCategoryType } from 'helpers/types';
import { useLanguageProvider } from 'providers/LanguageProvider';

import { MediaLibrary } from '../MediaLibrary';

import * as S from './styles';
import { IProps } from './types';

export default function PortalSetup(props: IProps) {
	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const { settings, updateSettings } = useSettingsProvider();

	const toggleCategoryAction = () => {
		updateSettings('showCategoryAction', !settings.showCategoryAction);
	};

	const toggleTopicAction = () => {
		updateSettings('showTopicAction', !settings.showTopicAction);
	};

	const toggleLinkAction = () => {
		updateSettings('showLinkAction', !settings.showLinkAction);
	};

	const [selectedCategories, setSelectedCategories] = React.useState<PortalCategoryType[]>([]);
	const [selectedTopics, setSelectedTopics] = React.useState<string[]>([]);

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

	function getLinkAction() {
		return (
			<S.LinksBodyWrapper>
				<Links type={props.type} />
			</S.LinksBodyWrapper>
		);
	}

	function getCategoryAction() {
		return (
			<S.BodyWrapper>
				<Categories
					categories={selectedCategories}
					setCategories={(categories: PortalCategoryType[]) => handleSetCategories(categories)}
					includeChildrenOnSelect
					showActions
				/>
			</S.BodyWrapper>
		);
	}

	function getTopicAction() {
		return (
			<S.TopicsBodyWrapper>
				<Topics topics={selectedTopics} setTopics={(topics: string[]) => setSelectedTopics(topics)} showActions />
			</S.TopicsBodyWrapper>
		);
	}

	function getMediaAction() {
		return (
			<S.MediaBodyWrapper>
				<MediaLibrary type={'all'} />
			</S.MediaBodyWrapper>
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
							type={'alt1'}
							active={false}
							src={settings.showLinkAction ? ASSETS.close : ASSETS.write}
							handlePress={() => toggleLinkAction()}
							dimensions={{ wrapper: 23.5, icon: 13.5 }}
							tooltip={settings.showLinkAction ? language.close : language.editSiteLinks}
							tooltipPosition={'bottom-right'}
							noFocus
						/>
					)}
				</S.LinksHeader>
				{(props.type === 'detail' || (props.type === 'header' && settings.showLinkAction)) && getLinkAction()}
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
							type={'alt1'}
							active={false}
							src={settings.showCategoryAction ? ASSETS.close : ASSETS.write}
							handlePress={() => toggleCategoryAction()}
							dimensions={{ wrapper: 23.5, icon: 13.5 }}
							tooltip={settings.showCategoryAction ? language.close : language.editSiteCategories}
							tooltipPosition={'bottom-right'}
							noFocus
						/>
					)}
				</S.CategoriesHeader>
				{(props.type === 'detail' || (props.type === 'header' && settings.showCategoryAction)) && getCategoryAction()}
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
							type={'alt1'}
							active={false}
							src={settings.showTopicAction ? ASSETS.close : ASSETS.write}
							handlePress={() => toggleTopicAction()}
							dimensions={{ wrapper: 23.5, icon: 13.5 }}
							tooltip={settings.showTopicAction ? language.close : language.editPostTopics}
							tooltipPosition={'bottom-right'}
							noFocus
						/>
					)}
				</S.SectionHeader>
				{(props.type === 'detail' || (props.type === 'header' && settings.showTopicAction)) && getTopicAction()}
			</S.TopicsSection>
		);
	}

	function mediaSection() {
		return (
			<S.Section type={props.type} className={'border-wrapper-alt3'}>
				<S.SectionHeader>
					<p>{language.mediaLibrary}</p>
				</S.SectionHeader>
				{getMediaAction()}
			</S.Section>
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
					{props.type === 'detail' && mediaSection()}
				</S.SectionWrapper>
				{!portalProvider?.permissions?.updateUsers && (
					<S.InfoWrapper className={'info'}>
						<span>{language.unauthorizedPortalUpdate}</span>
					</S.InfoWrapper>
				)}
			</S.Wrapper>
		</>
	);
}
