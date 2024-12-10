import React from 'react';
import { useNavigate } from 'react-router-dom';

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
				<S.BodyWrapper>
					<PostList />
				</S.BodyWrapper>
			</S.Wrapper>
			{showTopicAction && (
				<Modal header={language.editPostTopics} handleClose={() => setShowTopicAction(false)}>
					<S.TopicModalWrapper>
						<TopicList
							topics={selectedTopics}
							setTopics={(topics: string[]) => setSelectedTopics(topics)}
							showActions
						/>
					</S.TopicModalWrapper>
				</Modal>
			)}
		</>
	);
}
