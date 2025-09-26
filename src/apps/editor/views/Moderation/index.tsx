import React from 'react';

import { ViewHeader } from 'editor/components/atoms/ViewHeader';
import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
import { Loader } from 'components/atoms/Loader';
import { getTxEndpoint } from 'helpers/endpoints';
import { formatAddress } from 'helpers/utils';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';

import * as S from './styles';

export default function Moderation() {
	const portalProvider = usePortalProvider();
	const permawebProvider = usePermawebProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [loading, setLoading] = React.useState(false);
	const [inactiveComments, setInactiveComments] = React.useState<any[]>([]);
	const [profiles, setProfiles] = React.useState<{ [key: string]: any }>({});
	const [updatingComment, setUpdatingComment] = React.useState<string | null>(null);

	React.useEffect(() => {
		fetchInactiveComments();
	}, [portalProvider.current?.assets]);

	async function fetchInactiveComments() {
		console.log('Starting fetchInactiveComments...');
		console.log('Portal assets:', portalProvider.current?.assets);
		console.log('Libs available:', !!permawebProvider.libs);

		if (!portalProvider.current?.assets || !permawebProvider.libs) {
			console.log('Missing requirements - assets or libs');
			return;
		}

		setLoading(true);
		const allInactiveComments = [];

		try {
			console.log(`Checking ${portalProvider.current.assets.length} posts...`);

			for (const post of portalProvider.current.assets) {
				console.log(`Post ${post.id}: has comments process = ${post.metadata?.comments}`);

				if (post.metadata?.comments) {
					// Fetch comments from the comment process using the correct method
					try {
						console.log(`Fetching comments for post ${post.id} from process ${post.metadata.comments}...`);
						const comments = await permawebProvider.libs.getComments({
							commentsId: post.metadata.comments,
						});

						console.log(`Got ${comments?.length || 0} comments for post ${post.id}:`, comments);

						if (comments && Array.isArray(comments)) {
							// Show all comments with their status for debugging
							comments.forEach((c) =>
								console.log(`Comment status: ${c.status}, content: ${c.content?.substring(0, 50)}`)
							);

							// Filter for inactive comments
							const inactive = comments.filter((comment) => comment.status === 'inactive');
							console.log(`Found ${inactive.length} inactive comments for post ${post.id}`);

							// Add post info to each comment
							inactive.forEach((comment) => {
								allInactiveComments.push({
									...comment,
									postId: post.id,
									postTitle: post.name,
									postCommentProcessId: post.metadata.comments,
								});
							});
						}
					} catch (e) {
						console.error(`Error fetching comments for post ${post.id}:`, e);
					}
				}
			}

			console.log(`Total inactive comments found: ${allInactiveComments.length}`, allInactiveComments);
			setInactiveComments(allInactiveComments);

			// Fetch profiles for comment authors
			if (allInactiveComments.length > 0) {
				fetchProfiles(allInactiveComments);
			}
		} catch (error) {
			console.error('Error fetching comments:', error);
		} finally {
			setLoading(false);
		}
	}

	async function fetchProfiles(comments: any[]) {
		const uniqueCreators = [...new Set(comments.map((c) => c.creator).filter(Boolean))];
		const profileMap: { [key: string]: any } = {};

		for (const creator of uniqueCreators) {
			try {
				// Try to get profile by wallet address first
				const profile = await permawebProvider.libs.getProfileByWalletAddress(creator);
				if (profile) {
					profileMap[creator] = profile;
				}
			} catch (e) {
				// If profile fetch fails, just use the address
				console.log(`Could not fetch profile for ${creator}, will show address`);
			}
		}

		setProfiles(profileMap);
	}

	async function activateComment(comment: any) {
		if (!comment || updatingComment) return;

		setUpdatingComment(comment.id);
		try {
			await permawebProvider.libs.updateCommentStatus({
				commentsId: comment.postCommentProcessId,
				commentId: comment.id,
				status: 'active',
			});

			// Remove from inactive list
			setInactiveComments((prev) => prev.filter((c) => c.id !== comment.id));
		} catch (error) {
			console.error('Error activating comment:', error);
		} finally {
			setUpdatingComment(null);
		}
	}

	return (
		<S.Wrapper className={'fade-in'}>
			<ViewHeader header={language?.moderation} />
			<S.BodyWrapper>
				{loading ? (
					<Loader />
				) : (
					<>
						{inactiveComments.length > 0 ? (
							<S.CommentsList>
								<h3>Inactive Comments ({inactiveComments.length})</h3>
								{inactiveComments.map((comment, index) => {
									const profile = profiles[comment.creator];
									const displayName = profile?.displayName || formatAddress(comment.creator, false);
									return (
										<S.CommentItem key={index}>
											<S.CommentRow>
												<S.Avatar>
													{profile?.thumbnail && <img src={getTxEndpoint(profile.thumbnail)} alt={displayName} />}
												</S.Avatar>
												<S.CommentContent>
													<S.CommentMeta>
														<S.AuthorInfo>
															<strong>{displayName}</strong>
															<span>commented on {comment.postTitle}</span>
															<S.CommentDate>
																• {comment.dateCreated ? new Date(comment.dateCreated).toLocaleDateString() : 'N/A'}
															</S.CommentDate>
														</S.AuthorInfo>
													</S.CommentMeta>
													<S.CommentText>{comment.content}</S.CommentText>
												</S.CommentContent>
												<S.CommentActions>
													<Button
														type={'primary'}
														label={'Activate'}
														handlePress={() => activateComment(comment)}
														disabled={updatingComment === comment.id}
														loading={updatingComment === comment.id}
													/>
												</S.CommentActions>
											</S.CommentRow>
										</S.CommentItem>
									);
								})}
							</S.CommentsList>
						) : (
							<S.InfoMessage>
								<p>No inactive comments found</p>
							</S.InfoMessage>
						)}
					</>
				)}
			</S.BodyWrapper>
		</S.Wrapper>
	);
}
