import React from 'react';

import { globalLog, updateZone } from '@permaweb/libs';

import { Button } from 'components/atoms/Button';
import { FormField } from 'components/atoms/FormField';
import { Notification } from 'components/atoms/Notification';
import { ASSETS } from 'helpers/config';
import { NotificationType, PortalTopicType } from 'helpers/types';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePortalProvider } from 'providers/PortalProvider';

import { Modal } from '../Modal';

import * as S from './styles';
import { IProps } from './types';

export default function TopicList(props: IProps) {
	const arProvider = useArweaveProvider();
	const portalProvider = usePortalProvider();

	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [topicOptions, setTopicOptions] = React.useState<string[] | null>(null);
	const [newTopic, setNewTopic] = React.useState<string>('');

	const [showDeleteConfirmation, setShowDeleteConfirmation] = React.useState<boolean>(false);

	const [topicLoading, setTopicLoading] = React.useState<boolean>(false);
	const [topicResponse, setTopicResponse] = React.useState<NotificationType | null>(null);

	React.useEffect(() => {
		if (portalProvider.current?.id) {
			if (portalProvider.current.topics)
				setTopicOptions(portalProvider.current.topics.map((topic: PortalTopicType) => topic.value));
		}
	}, [portalProvider.current]);

	const addTopic = async () => {
		if (newTopic && !props.topics.includes(newTopic) && portalProvider.current?.id && arProvider.wallet) {
			setTopicLoading(true);
			try {
				const updatedTopicOptions = [...topicOptions, newTopic];

				const topicUpdateId = await updateZone(
					{ Topics: updatedTopicOptions.map((topic: string) => ({ Value: topic })) },
					portalProvider.current.id,
					arProvider.wallet
				);

				portalProvider.refreshCurrentPortal();

				globalLog(`Topic update: ${topicUpdateId}`);

				if (props.selectOnAdd) props.setTopics([...props.topics, newTopic]);

				setTopicOptions(updatedTopicOptions);
				setTopicResponse({ status: 'success', message: `${language.topicAdded}!` });
				setNewTopic('');
			} catch (e: any) {
				setTopicResponse({ status: 'warning', message: e.message ?? 'Error adding topic' });
			}
			setTopicLoading(false);
		}
	};

	async function deleteTopics() {
		if (arProvider.wallet && portalProvider.current?.topics && props.topics?.length) {
			setTopicLoading(true);
			try {
				const currentTopicOptions = portalProvider.current.topics.map((topic: PortalTopicType) => topic.value);
				const updatedTopicOptions = currentTopicOptions.filter((topic: string) => !props.topics.includes(topic));
				const topicUpdateId = await updateZone(
					{ Topics: updatedTopicOptions.map((topic: string) => ({ Value: topic })) },
					portalProvider.current.id,
					arProvider.wallet
				);

				props.setTopics([]);

				portalProvider.refreshCurrentPortal();

				globalLog(`Topic update: ${topicUpdateId}`);

				setTopicResponse({ status: 'success', message: `${language.topicsUpdated}!` });
				setShowDeleteConfirmation(false);
			} catch (e: any) {
				setTopicResponse({ status: 'warning', message: e.message ?? 'Error updating topics' });
			}
			setTopicLoading(false);
		}
	}

	const removeTopic = (topic: string) => {
		props.setTopics(props.topics.filter((t) => t !== topic));
	};

	const topicActionDisabled =
		!arProvider.wallet ||
		!portalProvider.current?.id ||
		!newTopic ||
		(topicOptions?.length && topicOptions.includes(newTopic)) ||
		topicLoading;

	function getTopics() {
		if (!topicOptions) {
			return (
				<S.WrapperEmpty>
					<p>{`${language.gettingTopics}...`}</p>
				</S.WrapperEmpty>
			);
		} else if (topicOptions.length <= 0) {
			return (
				<S.WrapperEmpty>
					<p>{language.noTopicsFound}</p>
				</S.WrapperEmpty>
			);
		}

		return (
			<>
				{topicOptions.map((topic: string) => {
					const active = props.topics?.includes(topic);

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
		);
	}

	return (
		<>
			<S.Wrapper>
				<S.TopicsAction>
					<Button
						type={'alt3'}
						label={language.add}
						handlePress={addTopic}
						disabled={topicActionDisabled}
						loading={topicLoading}
						icon={ASSETS.add}
						iconLeftAlign
					/>
					<FormField
						value={newTopic}
						onChange={(e: any) => setNewTopic(e.target.value)}
						invalid={{ status: topicOptions?.length && topicOptions.includes(newTopic), message: null }}
						disabled={topicLoading}
						hideErrorMessage
						sm
					/>
				</S.TopicsAction>
				<S.TopicsBody>{getTopics()}</S.TopicsBody>
				{props.showActions && (
					<S.TopicsFooter>
						{props.closeAction && (
							<Button type={'alt3'} label={language.close} handlePress={() => props.closeAction()} />
						)}
						<Button
							type={'alt3'}
							label={language.delete}
							handlePress={() => setShowDeleteConfirmation(true)}
							disabled={!props.topics?.length || topicLoading}
							loading={false}
							icon={ASSETS.delete}
							iconLeftAlign
							warning
						/>
					</S.TopicsFooter>
				)}
			</S.Wrapper>
			{showDeleteConfirmation && (
				<Modal header={language.confirmDeletion} handleClose={() => setShowDeleteConfirmation(false)}>
					<S.TopicModalWrapper>
						<S.TopicModalBodyWrapper>
							<p>{language.topicDeleteConfirmationInfo}</p>
							<S.TopicModalBodyElements>
								{props.topics.map((topic: string, index: number) => {
									return (
										<S.TopicModalBodyElement key={index}>
											<span>{`· ${topic}`}</span>
										</S.TopicModalBodyElement>
									);
								})}
							</S.TopicModalBodyElements>
						</S.TopicModalBodyWrapper>
						<S.TopicModalActionsWrapper>
							<Button
								type={'primary'}
								label={language.cancel}
								handlePress={() => setShowDeleteConfirmation(false)}
								disabled={topicLoading}
							/>
							<Button
								type={'primary'}
								label={language.topicDeleteConfirmation}
								handlePress={() => deleteTopics()}
								disabled={!props.topics?.length || topicLoading}
								loading={topicLoading}
								icon={ASSETS.delete}
								iconLeftAlign
								warning
							/>
						</S.TopicModalActionsWrapper>
					</S.TopicModalWrapper>
				</Modal>
			)}
			{topicResponse && (
				<Notification
					type={topicResponse.status}
					message={topicResponse.message}
					callback={() => setTopicResponse(null)}
				/>
			)}
		</>
	);
}
