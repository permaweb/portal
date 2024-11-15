import React from 'react';
import { ReactSVG } from 'react-svg';

import { Button } from 'components/atoms/Button';
import { Checkbox } from 'components/atoms/Checkbox';
import { IconButton } from 'components/atoms/IconButton';
import { CategoryList } from 'components/molecules/CategoryList';
import { ASSETS } from 'helpers/config';
import { CategoryType, PortalTopicType } from 'helpers/types';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePortalProvider } from 'providers/PortalProvider';

import * as S from './styles';
import { IProps } from './types';

// TODO
export default function PortalSetup(props: IProps) {
	const portalProvider = usePortalProvider();

	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const links = [
		{ id: 'facebook', href: '#', icon: ASSETS.facebook },
		{ id: 'x', href: '#', icon: ASSETS.x },
		{ id: 'youtube', href: '#', icon: ASSETS.youtube },
		{ id: 'odysee', href: '#' },
		{ id: 'linkedin', href: '#', icon: ASSETS.linkedin },
		{ id: 'discord', href: '#', icon: ASSETS.discord },
		{ id: 'telegram', href: '#', icon: ASSETS.telegram },
	];

	// React.useEffect(() => {
	// 	if (portalProvider.current?.id) {
	// 		if (portalProvider.current.topics)
	// 			setTopics(portalProvider.current.topics.map((topic: PortalTopicType) => topic.value));
	// 		// if (portalProvider.current.categories) setCategoryOptions(portalProvider.current.categories);
	// 	}
	// }, [portalProvider.current?.id, portalProvider.current?.topics, portalProvider.current?.categories]);

	const topics = React.useMemo(() => {
		if (!portalProvider.current?.topics) {
			return (
				<S.LoadingWrapper>
					<p>{`${language.gettingTopics}...`}</p>
				</S.LoadingWrapper>
			);
		} else if (portalProvider.current?.topics.length === 0) {
			return (
				<S.WrapperEmpty>
					<p>{language.noTopicsFound}</p>
				</S.WrapperEmpty>
			);
		}

		return portalProvider.current?.id ? (
			<S.TopicList>
				{portalProvider.current.topics.map((topic: PortalTopicType, index: number) => {
					return (
						<S.TopicWrapper key={index}>
							<Checkbox checked={true} handleSelect={null} disabled={false} />
							<p>{topic.value}</p>
						</S.TopicWrapper>
					);
				})}
			</S.TopicList>
		) : null;
	}, [portalProvider, languageProvider, portalProvider.current?.id, portalProvider.current?.topics, language]);

	function getTotalCategoryCount(categories: CategoryType[]) {
		let count = 0;

		function countChildren(categories: CategoryType[]) {
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

	return (
		<S.Wrapper type={props.type}>
			<S.SectionWrapper type={props.type}>
				<S.CategoriesSection type={props.type} className={props.type === 'header' ? '' : 'border-wrapper-alt2'}>
					<S.CategoriesHeader>
						<p>{`${language.siteCategories}${
							portalProvider.current?.categories ? ` (${getTotalCategoryCount(portalProvider.current.categories)})` : ''
						}`}</p>
						<IconButton
							type={'primary'}
							active={false}
							src={ASSETS.write}
							handlePress={() => console.log('Edit site categories')}
							dimensions={{ wrapper: 23.5, icon: 13.5 }}
							tooltip={language.editSiteCategories}
							tooltipPosition={'bottom-right'}
							noFocus
						/>
					</S.CategoriesHeader>
					{props.type === 'detail' && <CategoryList categories={[]} setCategories={null} />}
				</S.CategoriesSection>
				<S.Section type={props.type} className={props.type === 'header' ? '' : 'border-wrapper-alt2'}>
					<S.SectionHeader>
						<p>{language.siteLinks}</p>
						<IconButton
							type={'primary'}
							active={false}
							src={ASSETS.write}
							handlePress={() => console.log('Edit site categories')}
							dimensions={{ wrapper: 23.5, icon: 13.5 }}
							tooltip={language.editSiteLinks}
							tooltipPosition={'bottom-right'}
							noFocus
						/>
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
			<S.SectionWrapper type={props.type} className={props.type === 'header' ? '' : 'border-wrapper-alt3'}>
				<S.TopicsSection type={props.type}>
					<S.SectionHeader>
						<p>{`${language.postTopics}${
							portalProvider.current?.topics ? ` (${portalProvider.current.topics.length})` : ''
						}`}</p>
						<IconButton
							type={'primary'}
							active={false}
							src={ASSETS.write}
							handlePress={() => console.log('Edit post topics')}
							dimensions={{ wrapper: 23.5, icon: 13.5 }}
							tooltip={language.editPostTopics}
							tooltipPosition={'bottom-right'}
							noFocus
						/>
					</S.SectionHeader>
					{props.type === 'detail' && <S.SectionBody>{topics}</S.SectionBody>}
				</S.TopicsSection>
			</S.SectionWrapper>
		</S.Wrapper>
	);
}
