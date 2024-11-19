import React from 'react';
import { ReactSVG } from 'react-svg';

import { mapToProcessCase } from '@permaweb/libs';

import { Button } from 'components/atoms/Button';
import { IconButton } from 'components/atoms/IconButton';
import { CategoryList } from 'components/molecules/CategoryList';
import { Modal } from 'components/molecules/Modal';
import { TopicList } from 'components/molecules/TopicList';
import { ASSETS } from 'helpers/config';
import { PortalCategoryType } from 'helpers/types';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePortalProvider } from 'providers/PortalProvider';

import * as S from './styles';
import { IProps } from './types';

// TODO: Topic add / save / delete
// TODO: Category delete
// TODO: Links
export default function PortalSetup(props: IProps) {
	const portalProvider = usePortalProvider();

	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [selectedCategories, setSelectedCategories] = React.useState<PortalCategoryType[]>([]);
	const [selectedTopics, setSelectedTopics] = React.useState<string[]>([]);
	const [showCategoryAction, setShowCategoryAction] = React.useState<boolean>(false);
	const [showTopicAction, setShowTopicAction] = React.useState<boolean>(false);

	const links = [
		{ id: 'facebook', href: '#', icon: ASSETS.facebook },
		{ id: 'x', href: '#', icon: ASSETS.x },
		{ id: 'youtube', href: '#', icon: ASSETS.youtube },
		{ id: 'odysee', href: '#' },
		{ id: 'linkedin', href: '#', icon: ASSETS.linkedin },
		{ id: 'discord', href: '#', icon: ASSETS.discord },
		{ id: 'telegram', href: '#', icon: ASSETS.telegram },
	];

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

	return (
		<>
			<S.Wrapper type={props.type}>
				<S.SectionWrapper type={props.type}>
					<S.CategoriesSection type={props.type} className={props.type === 'header' ? '' : 'border-wrapper-alt2'}>
						<S.CategoriesHeader>
							<p>{`${language.siteCategories}${
								portalProvider.current?.categories
									? ` (${getTotalCategoryCount(portalProvider.current.categories)})`
									: ''
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
					<S.Section type={props.type} className={props.type === 'header' ? '' : 'border-wrapper-alt2'}>
						<S.SectionHeader>
							<p>{language.siteLinks}</p>
						</S.SectionHeader>
						<S.LinksSection>
							{links?.length > 0 && (
								<>
									{links.map((link: any, index: number) => {
										return (
											<S.LinkWrapper key={index}>
												<a href={link.href} target={'_blank'}>
													<ReactSVG src={link.icon ?? ASSETS.link} />
												</a>
												<S.LinkTooltip className={'info'}>
													<span>{link.id}</span>
												</S.LinkTooltip>
											</S.LinkWrapper>
										);
									})}
								</>
							)}
							<S.LinkWrapper>
								<button>
									<ReactSVG src={ASSETS.add} />
								</button>
								<S.LinkTooltip className={'info'}>
									<span>{'Add a new link'}</span>
								</S.LinkTooltip>
							</S.LinkWrapper>
						</S.LinksSection>
					</S.Section>
				</S.SectionWrapper>
				<S.SectionWrapper type={props.type} className={props.type === 'header' ? '' : 'border-wrapper-alt2'}>
					<S.TopicsSection type={props.type}>
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
		</>
	);
}
