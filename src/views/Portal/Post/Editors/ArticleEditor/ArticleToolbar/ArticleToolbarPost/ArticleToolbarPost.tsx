import React from 'react';

import { Button } from 'components/atoms/Button';
import { FormField } from 'components/atoms/FormField';
import { ASSETS } from 'helpers/config';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';

// TODO: Save topics in portal for future options
// TODO: Save in post
export default function ArticleToolbarPost() {
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [options, setOptions] = React.useState<string[]>([
		'music',
		'politics',
		'gaming',
		'crypto',
		'finance',
		'sports',
		'universe',
		'art',
		'education',
		'history',
	]);

	const [topics, setTopics] = React.useState<string[]>(['music', 'politics', 'gaming', 'art', 'education', 'history']);
	const [newTopic, setNewTopic] = React.useState<string>('');

	const addTopic = () => {
		if (newTopic && !topics.includes(newTopic)) {
			setTopics((prevTopics) => [...prevTopics, newTopic]);
			// setNewTopic('');
		}
	};

	const removeTopic = (topic: string) => {
		setTopics((prevTopics) => prevTopics.filter((t) => t !== topic));
	};

	return (
		<S.Wrapper>
			<S.Section>
				<S.SectionHeader>
					<p>{language.topics}</p>
				</S.SectionHeader>
				<S.SectionBody>
					<S.TopicsWrapper>
						<S.TopicsAction>
							<Button type={'alt3'} label={'Add'} handlePress={addTopic} disabled={!newTopic} />
							<FormField
								value={newTopic}
								onChange={(e: any) => setNewTopic(e.target.value)}
								invalid={{ status: false, message: null }}
								disabled={false}
								hideErrorMessage
								sm
							/>
						</S.TopicsAction>
						<S.TopicsBody>
							{options.map((topic: string) => {
								const active = topics.includes(topic);
								return (
									<Button
										key={topic}
										type={'alt3'}
										label={topic}
										handlePress={() => (active ? removeTopic(topic) : setTopics([...topics, topic]))}
										active={active}
										icon={active ? ASSETS.close : ASSETS.add}
									/>
								);
							})}
						</S.TopicsBody>
					</S.TopicsWrapper>
				</S.SectionBody>
			</S.Section>
		</S.Wrapper>
	);
}
