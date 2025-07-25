import React from 'react';
import { useNavigate } from 'react-router-dom';

import { ViewHeader } from 'editor/components/atoms/ViewHeader';
import { Topics } from 'editor/components/molecules/Topics';
import { PostList } from 'editor/components/organisms/PostList';
import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
import { Modal } from 'components/atoms/Modal';
import { ASSETS, URLS } from 'helpers/config';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';

export default function Posts() {
	const navigate = useNavigate();

	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [selectedTopics, setSelectedTopics] = React.useState<string[]>([]);
	const [showTopicAction, setShowTopicAction] = React.useState<boolean>(false);

	/* User is a moderator and can only review existing posts, not create new ones */
	const unauthorizedCreate =
		!portalProvider.permissions?.postAutoIndex && !portalProvider.permissions?.postRequestIndex;

	const unauthorizedMeta = !portalProvider.permissions?.updatePortalMeta;

	return (
		<>
			<S.Wrapper className={'fade-in'}>
				<ViewHeader
					header={language?.posts}
					actions={[
						<Button
							type={'primary'}
							label={language?.editPostTopics}
							handlePress={() => setShowTopicAction(true)}
							disabled={unauthorizedMeta || !portalProvider.current}
							icon={ASSETS.write}
							iconLeftAlign
						/>,
						<Button
							type={'alt1'}
							label={language?.createPost}
							handlePress={() => navigate(URLS.postCreateArticle(portalProvider.current.id))}
							disabled={unauthorizedCreate || !portalProvider.current}
							icon={ASSETS.add}
							iconLeftAlign
						/>,
					]}
				/>
				<S.BodyWrapper>
					<PostList type={'detail'} />
				</S.BodyWrapper>
			</S.Wrapper>
			{showTopicAction && (
				<Modal header={language?.editPostTopics} handleClose={() => setShowTopicAction(false)}>
					<S.TopicModalWrapper>
						<Topics
							topics={selectedTopics}
							setTopics={(topics: string[]) => setSelectedTopics(topics)}
							showActions
							inlineAdd
						/>
					</S.TopicModalWrapper>
				</Modal>
			)}
		</>
	);
}
