import React from 'react';

import { Categories } from 'editor/components/molecules/Categories';
import { Links } from 'editor/components/molecules/Links';
import { Topics } from 'editor/components/molecules/Topics';
import { usePortalProvider } from 'editor/providers/PortalProvider';
import { useSettingsProvider } from 'editor/providers/SettingsProvider';

import { Button } from 'components/atoms/Button';
import { FormField } from 'components/atoms/FormField';
import { IconButton } from 'components/atoms/IconButton';
import { ICONS } from 'helpers/config';
import { PortalCategoryType, PortalPatchMapEnum, ViewLayoutType } from 'helpers/types';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { useNotifications } from 'providers/NotificationProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';

import { MediaLibrary } from '../MediaLibrary';

import * as S from './styles';

type MonetizationConfig = {
	enabled: boolean;
	walletAddress: string;
	tokenAddress: string;
};

export default function PortalSetup(props: { type: ViewLayoutType }) {
	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const { settings, updateSettings } = useSettingsProvider();
	const arProvider = useArweaveProvider();
	const permawebProvider = usePermawebProvider();
	const { addNotification } = useNotifications();
	const ownerWallet = (portalProvider.current as any)?.ownerWallet || (portalProvider.current as any)?.owner || '';
	const [savingMonetization, setSavingMonetization] = React.useState(false);
	const [monetization, setMonetization] = React.useState<MonetizationConfig>(() => {
		const existing = (portalProvider.current as any)?.monetization?.monetization as MonetizationConfig | undefined;
		if (existing) return existing;

		return {
			enabled: false,
			walletAddress: ownerWallet,
			tokenAddress: 'AR',
		};
	});

	React.useEffect(() => {
		const existing = (portalProvider.current as any)?.monetization?.monetization as MonetizationConfig | undefined;
		if (existing) {
			setMonetization(existing);
		} else {
			setMonetization((prev) => ({
				...prev,
				walletAddress: ownerWallet || prev.walletAddress,
			}));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [portalProvider.current?.id]);

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
			<S.CategoriesBodyWrapper>
				<Categories
					categories={selectedCategories}
					setCategories={(categories: PortalCategoryType[]) => handleSetCategories(categories)}
					includeChildrenOnSelect
					showActions
					allowReorder
					inlineAdd
				/>
			</S.CategoriesBodyWrapper>
		);
	}

	function getTopicAction() {
		return (
			<S.TopicsBodyWrapper>
				<Topics
					topics={selectedTopics}
					setTopics={(topics: string[]) => setSelectedTopics(topics)}
					showActions
					inlineAdd
				/>
			</S.TopicsBodyWrapper>
		);
	}

	function getMediaAction() {
		return (
			<S.MediaBodyWrapper>
				<MediaLibrary type={'all'} selectDisabled={!portalProvider.permissions?.updatePortalMeta} />
			</S.MediaBodyWrapper>
		);
	}

	function linkSection() {
		return (
			<S.LinksSection type={props.type} className={props.type === 'header' ? '' : 'border-wrapper-alt2'}>
				<S.LinksHeader type={props.type}>
					<p>{`${language?.socialLinks}${
						portalProvider.current?.links ? ` (${portalProvider.current.links.length})` : ''
					}`}</p>
					{props.type === 'header' && (
						<IconButton
							type={'alt1'}
							active={false}
							src={settings.showLinkAction ? ICONS.close : ICONS.write}
							handlePress={() => toggleLinkAction()}
							dimensions={{ wrapper: 23.5, icon: 13.5 }}
							tooltip={settings.showLinkAction ? language?.close : language?.editSocialLinks}
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
					<p>{`${language?.siteCategories}${
						portalProvider.current?.categories ? ` (${getTotalCategoryCount(portalProvider.current.categories)})` : ''
					}`}</p>
					{props.type === 'header' && (
						<IconButton
							type={'alt1'}
							active={false}
							src={settings.showCategoryAction ? ICONS.close : ICONS.write}
							handlePress={() => toggleCategoryAction()}
							dimensions={{ wrapper: 23.5, icon: 13.5 }}
							tooltip={settings.showCategoryAction ? language?.close : language?.editSiteCategories}
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
					<p>{`${language?.postTopics}${
						portalProvider.current?.topics ? ` (${portalProvider.current.topics.length})` : ''
					}`}</p>
					{props.type === 'header' && (
						<IconButton
							type={'alt1'}
							active={false}
							src={settings.showTopicAction ? ICONS.close : ICONS.write}
							handlePress={() => toggleTopicAction()}
							dimensions={{ wrapper: 23.5, icon: 13.5 }}
							tooltip={settings.showTopicAction ? language?.close : language?.editPostTopics}
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
			<S.Section type={props.type} className={'border-wrapper-alt2'}>
				<S.SectionHeader>
					<p>{language?.mediaLibrary}</p>
				</S.SectionHeader>
				{getMediaAction()}
			</S.Section>
		);
	}

	async function handleSaveMonetization() {
		if (!portalProvider.current?.id || !portalProvider.permissions?.updatePortalMeta) {
			return;
		}
		if (!arProvider.wallet || !permawebProvider.libs) {
			addNotification(language?.walletNotConnected ?? 'Connect a wallet to update monetization.', 'warning');
			return;
		}

		const payload: MonetizationConfig = {
			enabled: monetization.enabled,
			walletAddress: monetization.walletAddress.trim(),
			tokenAddress: monetization.tokenAddress || 'AR',
		};

		setSavingMonetization(true);

		try {
			const body: any = {
				Monetization: permawebProvider.libs.mapToProcessCase
					? permawebProvider.libs.mapToProcessCase(payload)
					: payload,
			};

			const updateId = await permawebProvider.libs.updateZone(body, portalProvider.current.id, arProvider.wallet);

			console.log('Monetization update:', updateId);

			// update in-memory portal
			(portalProvider.current as any).monetization = payload;

			if (portalProvider.refreshCurrentPortal) {
				portalProvider.refreshCurrentPortal(PortalPatchMapEnum.Monetization);
			}

			addNotification(language?.monetizationSaved ?? 'Monetization settings saved.', 'success');
		} catch (e: any) {
			console.error(e);
			addNotification(e?.message ?? 'Error saving monetization settings.', 'warning');
		} finally {
			setSavingMonetization(false);
		}
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
					{props.type === 'detail' && !portalProvider?.permissions?.updateUsers && (
						<S.InfoWrapper className={'warning'}>
							<span>{language?.unauthorizedPortalUpdate}</span>
						</S.InfoWrapper>
					)}
				</S.SectionWrapper>
			</S.Wrapper>
		</>
	);
}
