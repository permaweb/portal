import React from 'react';

import { buildStoreNamespace, updateZone } from '@permaweb/libs';

import { Button } from 'components/atoms/Button';
import { FormField } from 'components/atoms/FormField';
import { ASSETS } from 'helpers/config';
import { PortalTopicType } from 'helpers/types';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePortalProvider } from 'providers/PortalProvider';

import * as S from './styles';
import { IProps } from './types';

export default function ArticleToolbarPost(props: IProps) {
	const arProvider = useArweaveProvider();
	const portalProvider = usePortalProvider();

	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [options, setOptions] = React.useState<string[]>([]);
	const [newTopic, setNewTopic] = React.useState<string>('');

	const [topicLoading, setTopicLoading] = React.useState<boolean>(false);

	React.useEffect(() => {
		if (portalProvider.current?.id && portalProvider.current?.topics) {
			setOptions(portalProvider.current.topics.map((topic: PortalTopicType) => topic.value));
		}
	}, [portalProvider.current]);

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

				setOptions((prevOptions) => [...prevOptions, newTopic]);
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
		!arProvider.wallet || !portalProvider.current?.id || !newTopic || options.includes(newTopic) || topicLoading;

	return (
		<S.Wrapper>
			<S.Section>
				<S.SectionHeader>
					<p>{language.topics}</p>
				</S.SectionHeader>
				<S.SectionBody>
					<S.TopicsWrapper>
						<S.TopicsAction>
							<Button
								type={'alt3'}
								label={'Add'}
								handlePress={addTopic}
								disabled={topicActionDisabled}
								loading={topicLoading}
							/>
							<FormField
								value={newTopic}
								onChange={(e: any) => setNewTopic(e.target.value)}
								invalid={{ status: options.includes(newTopic), message: null }}
								disabled={topicLoading}
								hideErrorMessage
								sm
							/>
						</S.TopicsAction>
						<S.TopicsBody>
							{options?.length > 0 ? (
								<>
									{options.map((topic: string) => {
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
			</S.Section>
		</S.Wrapper>
	);
}
