import React from 'react';
import { useNavigate } from 'react-router-dom';

import { mapToProcessCase } from '@permaweb/libs';

import { Button } from 'components/atoms/Button';
import { ViewHeader } from 'components/atoms/ViewHeader';
import { Modal } from 'components/molecules/Modal';
import { TopicList } from 'components/molecules/TopicList';
import { PostList } from 'components/organisms/PostList';
import { ASSETS, URLS } from 'helpers/config';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePortalProvider } from 'providers/PortalProvider';

import * as S from './styles';

export default function Posts() {
	const navigate = useNavigate();

	const portalProvider = usePortalProvider();

	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [selectedTopics, setSelectedTopics] = React.useState<string[]>([]);
	const [showTopicAction, setShowTopicAction] = React.useState<boolean>(false);

	// TODO
	function handleDeleteTopics() {
		console.log(mapToProcessCase(selectedTopics));
	}

	function getTopicAction() {
		return (
			<S.TopicsBodyWrapper>
				<TopicList topics={selectedTopics} setTopics={(topics: string[]) => setSelectedTopics(topics)} />
				<S.BodyActionsWrapper>
					<Button type={'alt3'} label={language.close} handlePress={() => setShowTopicAction(false)} disabled={false} />

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
			<S.Wrapper className={'fade-in'}>
				<ViewHeader
					header={language.posts}
					actions={[
						<Button
							type={'primary'}
							label={language.editPostTopics}
							handlePress={() => setShowTopicAction(true)}
							disabled={!portalProvider.current}
							icon={ASSETS.write}
							iconLeftAlign
						/>,
						<Button
							type={'alt1'}
							label={language.createPost}
							handlePress={() => navigate(URLS.postCreateArticle(portalProvider.current.id))}
							disabled={!portalProvider.current}
							icon={ASSETS.add}
							iconLeftAlign
						/>,
					]}
				/>
				<S.BodyWrapper className={'border-wrapper-primary'}>
					<PostList />
				</S.BodyWrapper>
			</S.Wrapper>
			{showTopicAction && (
				<Modal header={language.editPostTopics} handleClose={() => setShowTopicAction(false)}>
					<S.TopicModalWrapper>{getTopicAction()}</S.TopicModalWrapper>
				</Modal>
			)}
		</>
	);
}
