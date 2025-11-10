import React from 'react';

import { ViewHeader } from 'editor/components/atoms/ViewHeader';
import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
import { Checkbox } from 'components/atoms/Checkbox';
import { Drawer } from 'components/atoms/Drawer';
import { Loader } from 'components/atoms/Loader';
import { getTxEndpoint } from 'helpers/endpoints';
import { cacheModeration, formatAddress, getCachedModeration } from 'helpers/utils';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';

import * as S from './styles';

export default function Moderation() {
	const portalProvider = usePortalProvider();
	const permawebProvider = usePermawebProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [loadingSubscriptions, setLoadingSubscriptions] = React.useState(false);
	const [loadingUsers, setLoadingUsers] = React.useState(false);
	const [loadingComments, setLoadingComments] = React.useState(false);
	const [inactiveComments, setInactiveComments] = React.useState<any[]>([]);
	const [profiles, setProfiles] = React.useState<{ [key: string]: any }>({});
	const [updatingComment, setUpdatingComment] = React.useState<string | null>(null);
	const [externalPortals, setExternalPortals] = React.useState<{ id: string; name: string }[]>([]);
	const [selectedPortals, setSelectedPortals] = React.useState<Set<string>>(new Set());
	const [moderatedUsers, setModeratedUsers] = React.useState<any[]>([]);
	const [moderatedComments, setModeratedComments] = React.useState<any[]>([]);

	React.useEffect(() => {
		fetchInactiveComments();
		extractExternalPortals();
		fetchModerationEntries();
	}, [portalProvider.current?.assets, portalProvider.current?.id]);

	React.useEffect(() => {
		if (portalProvider.current?.id && permawebProvider.libs) {
			const cached = getCachedModeration(portalProvider.current.id);
			if (cached) {
				fetchInactiveComments(true);
			}
		}
	}, [portalProvider.current?.id]);

	async function fetchInactiveComments(backgroundRefresh = false) {
		if (!portalProvider.current?.assets || !permawebProvider.libs || !portalProvider.current?.id) {
			return;
		}

		if (!backgroundRefresh) {
			const cached = getCachedModeration(portalProvider.current.id);
			if (cached) {
				setInactiveComments(cached.inactiveComments || []);
				setProfiles(cached.profiles || {});
				return;
			}
		}

		if (!backgroundRefresh) {
			setLoadingComments(true);
		}
		const allInactiveComments = [];

		try {
			for (const post of portalProvider.current.assets) {
				if (post.metadata?.comments) {
					try {
						const comments = await permawebProvider.libs.getComments({
							commentsId: post.metadata.comments,
						});

						if (comments && Array.isArray(comments)) {
							const inactive = comments.filter((comment) => comment.status === 'inactive');

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

			setInactiveComments(allInactiveComments);

			if (allInactiveComments.length > 0) {
				fetchProfiles(allInactiveComments);
			} else {
				cacheModeration(portalProvider.current.id, {
					inactiveComments: allInactiveComments,
					profiles: {},
				});
			}
		} catch (error) {
			console.error('Error fetching comments:', error);
		} finally {
			if (!backgroundRefresh) {
				setLoadingComments(false);
			}
		}
	}

	async function fetchProfiles(comments: any[]) {
		const uniqueCreators = [...new Set(comments.map((c) => c.creator).filter(Boolean))];
		const profileMap: { [key: string]: any } = {};

		for (const creator of uniqueCreators) {
			try {
				const profile = await permawebProvider.libs.getProfileByWalletAddress(creator);
				if (profile) {
					profileMap[creator] = profile;
				}
			} catch (e) {
				// Profile fetch failed, will use address
			}
		}

		setProfiles(profileMap);

		cacheModeration(portalProvider.current.id, {
			inactiveComments: comments,
			profiles: profileMap,
		});
	}

	async function fetchModerationEntries() {
		if (!portalProvider.current?.moderation || !permawebProvider.libs) return;

		setLoadingUsers(true);
		setLoadingComments(true);

		try {
			// Fetch profile entries
			const userEntries = await permawebProvider.libs.getModerationEntries({
				moderationId: portalProvider.current.moderation,
				targetType: 'profile',
				status: 'blocked',
			});

			// Filter to only include actual profile entries (API sometimes returns mixed types)
			const profileEntries = (userEntries || []).filter(
				(entry: any) => entry.targetType === 'profile' || entry.TargetType === 'profile'
			);

			if (profileEntries && profileEntries.length > 0) {
				const userProfiles = await Promise.all(
					profileEntries.map(async (entry: any) => {
						const targetId = entry.targetId || entry.TargetId;
						const moderator = entry.moderator || entry.Moderator;
						try {
							const profile = await permawebProvider.libs.getProfileByWalletAddress(targetId);

							// Fetch moderator profile
							let moderatorProfile = null;
							if (moderator) {
								try {
									moderatorProfile = await permawebProvider.libs.getProfileByWalletAddress(moderator);
								} catch (e) {
									// Profile fetch failed
								}
							}

							return {
								...entry,
								targetId: targetId,
								profile: profile || { address: targetId },
								moderatorProfile: moderatorProfile,
							};
						} catch (e) {
							return {
								...entry,
								targetId: targetId,
								profile: { address: targetId },
								moderatorProfile: null,
							};
						}
					})
				);
				setModeratedUsers(userProfiles);
			} else {
				setModeratedUsers([]);
			}
			setLoadingUsers(false);

			// Fetch comment entries
			const commentEntries = await permawebProvider.libs.getModerationEntries({
				moderationId: portalProvider.current.moderation,
				targetType: 'comment',
				status: 'blocked',
			});

			// Filter to only include actual comment entries (API sometimes returns mixed types)
			const actualCommentEntries = (commentEntries || []).filter(
				(entry: any) => entry.targetType === 'comment' || entry.TargetType === 'comment'
			);

			if (actualCommentEntries && actualCommentEntries.length > 0) {
				const commentsWithContent = await Promise.all(
					actualCommentEntries.map(async (entry: any) => {
						try {
							const targetContext = entry.targetContext || entry.TargetContext;
							const targetId = entry.targetId || entry.TargetId;
							const moderator = entry.moderator || entry.Moderator;

							if (targetContext) {
								const comments = await permawebProvider.libs.getComments({
									commentsId: targetContext,
								});
								const comment = comments?.find((c: any) => c.id === targetId);
								if (comment) {
									// Fetch author profile
									let authorProfile = null;
									if (comment.creator) {
										try {
											authorProfile = await permawebProvider.libs.getProfileByWalletAddress(comment.creator);
										} catch (e) {
											// Profile fetch failed
										}
									}

									// Fetch moderator profile (who blocked it)
									let moderatorProfile = null;
									if (moderator) {
										try {
											moderatorProfile = await permawebProvider.libs.getProfileByWalletAddress(moderator);
										} catch (e) {
											// Profile fetch failed
										}
									}

									return {
										...entry,
										comment: comment,
										authorProfile: authorProfile,
										moderatorProfile: moderatorProfile,
										postTitle: portalProvider.current?.assets?.find((a: any) => a.metadata?.comments === targetContext)
											?.name,
									};
								}
							}
							return entry;
						} catch (e) {
							console.error('Error fetching comment content:', e);
							return entry;
						}
					})
				);
				setModeratedComments(commentsWithContent);
			} else {
				setModeratedComments([]);
			}
			setLoadingComments(false);
		} catch (e) {
			console.error('Error fetching moderation entries:', e);
			setModeratedUsers([]);
			setModeratedComments([]);
			setLoadingUsers(false);
			setLoadingComments(false);
		}
	}

	async function extractExternalPortals() {
		if (!portalProvider.current?.assets || !permawebProvider.libs) return;

		setLoadingSubscriptions(true);

		const portalIds = new Set<string>();

		// Find all unique external portals from post metadata
		for (const asset of portalProvider.current.assets) {
			const metadata = asset.metadata as any;
			if (metadata?.originPortal) {
				if (metadata.originPortal !== portalProvider.current.id) {
					portalIds.add(metadata.originPortal);
				}
			}
		}

		const portalsWithNames: { id: string; name: string }[] = [];

		// Fetch portal names
		for (const portalId of portalIds) {
			try {
				const portalData = permawebProvider.libs.mapFromProcessCase(
					await permawebProvider.libs.readState({ processId: portalId, path: 'overview' })
				);

				portalsWithNames.push({
					id: portalId,
					name: portalData?.name || portalData?.store?.name || portalId,
				});
			} catch (e) {
				portalsWithNames.push({
					id: portalId,
					name: formatAddress(portalId, false),
				});
			}
		}

		setExternalPortals(portalsWithNames);
		setLoadingSubscriptions(false);
	}

	function togglePortalSelection(portalId: string) {
		setSelectedPortals((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(portalId)) {
				newSet.delete(portalId);
			} else {
				newSet.add(portalId);
			}
			return newSet;
		});
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

			const updatedComments = inactiveComments.filter((c) => c.id !== comment.id);
			setInactiveComments(updatedComments);

			if (portalProvider.current?.id) {
				cacheModeration(portalProvider.current.id, {
					inactiveComments: updatedComments,
					profiles,
				});
			}
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
				<>
					<S.SectionWrapper>
						{/* Subscriptions Section */}
						<S.SubscriptionsSection>
							<Drawer
								drawerKey="moderation-subscriptions"
								title={`Subscriptions (${externalPortals.length})`}
								content={
									loadingSubscriptions ? (
										<Loader sm relative />
									) : externalPortals.length > 0 ? (
										<div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
											{externalPortals.map((portal) => (
												<div key={portal.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
													<Checkbox
														checked={selectedPortals.has(portal.id)}
														handleSelect={() => togglePortalSelection(portal.id)}
														disabled={false}
													/>
													<span>{portal.name}</span>
												</div>
											))}
										</div>
									) : (
										<S.InfoMessage>
											<p>No subscriptions found</p>
										</S.InfoMessage>
									)
								}
								padContent
							/>
						</S.SubscriptionsSection>

						{/* Users Section */}
						<S.UsersSection>
							<Drawer
								drawerKey="moderation-users"
								title={`Users (${moderatedUsers.length})`}
								content={
									loadingUsers ? (
										<Loader sm relative />
									) : moderatedUsers.length > 0 ? (
										<div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
											{moderatedUsers.map((user) => {
												const moderator = user.moderator || user.Moderator;
												const moderatorName =
													user.moderatorProfile?.displayName ||
													(moderator ? formatAddress(moderator, false) : 'Unknown');
												const dateCreated = user.dateCreated || user.DateCreated;
												const reason = user.reason || user.Reason;
												return (
													<div
														key={user.targetId}
														style={{
															display: 'flex',
															alignItems: 'flex-start',
															justifyContent: 'space-between',
															padding: '12px',
															background: 'var(--theme-container-primary-background)',
															border: '1px solid var(--theme-border-primary)',
															borderRadius: '8px',
															gap: '12px',
														}}
													>
														<div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', flex: 1 }}>
															{user.profile?.thumbnail && (
																<img
																	src={getTxEndpoint(user.profile.thumbnail)}
																	alt=""
																	style={{ width: '40px', height: '40px', borderRadius: '50%', minWidth: '40px' }}
																/>
															)}
															<div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
																<strong>{user.profile?.displayName || formatAddress(user.targetId, false)}</strong>
																<div
																	style={{
																		display: 'flex',
																		gap: '6px',
																		alignItems: 'center',
																		flexWrap: 'wrap',
																		fontSize: 'var(--theme-typography-size-small)',
																		color: 'var(--theme-font-primary-alt2)',
																	}}
																>
																	{dateCreated && <span>{new Date(dateCreated).toLocaleDateString()}</span>}
																	<span>•</span>
																	<span style={{ fontStyle: 'italic' }}>Blocked by {moderatorName}</span>
																	{reason && (
																		<>
																			<span>•</span>
																			<span style={{ fontStyle: 'italic' }}>Reason: {reason}</span>
																		</>
																	)}
																</div>
															</div>
														</div>
														<Button
															type={'alt3'}
															label={'Unblock'}
															handlePress={async () => {
																try {
																	console.log('user: ', user);
																	const targetId = user.targetId;
																	await permawebProvider.libs.removeModerationEntry({
																		moderationId: portalProvider.current.moderation,
																		targetType: 'profile',
																		targetId: targetId,
																	});
																	fetchModerationEntries();
																} catch (e) {
																	console.error('Error unblocking user:', e);
																}
															}}
														/>
													</div>
												);
											})}
										</div>
									) : (
										<S.InfoMessage>
											<p>No moderated users</p>
										</S.InfoMessage>
									)
								}
								padContent
							/>
						</S.UsersSection>
					</S.SectionWrapper>

					<S.SectionWrapper>
						{/* Comments Section */}
						<S.CommentsSection>
							<Drawer
								drawerKey="moderation-comments"
								title={`Comments (${inactiveComments.length + moderatedComments.length})`}
								content={
									loadingComments ? (
										<Loader sm relative />
									) : inactiveComments.length > 0 || moderatedComments.length > 0 ? (
										<S.CommentsList>
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
																			•{' '}
																			{comment.dateCreated ? new Date(comment.dateCreated).toLocaleDateString() : 'N/A'}
																		</S.CommentDate>
																	</S.AuthorInfo>
																</S.CommentMeta>
																<S.CommentText>{comment.content}</S.CommentText>
															</S.CommentContent>
															<S.CommentActions>
																<Button
																	type={'primary'}
																	label={language.activate}
																	handlePress={() => activateComment(comment)}
																	disabled={updatingComment === comment.id}
																	loading={updatingComment === comment.id}
																/>
															</S.CommentActions>
														</S.CommentRow>
													</S.CommentItem>
												);
											})}
											{/* Moderated/Blocked Comments */}
											{moderatedComments.map((comment, index) => {
												const displayName =
													comment.authorProfile?.displayName || formatAddress(comment.comment?.creator, false);
												const reason = comment.reason || comment.Reason;
												const moderator = comment.moderator || comment.Moderator;
												const moderatorName =
													comment.moderatorProfile?.displayName ||
													(moderator ? formatAddress(moderator, false) : 'Unknown');
												return (
													<S.CommentItem key={`moderated-${index}`} $blocked={true}>
														<S.CommentRow>
															<S.Avatar>
																{comment.authorProfile?.thumbnail && (
																	<img src={getTxEndpoint(comment.authorProfile.thumbnail)} alt={displayName} />
																)}
															</S.Avatar>
															<S.CommentContent>
																<S.CommentMeta>
																	<S.AuthorInfo>
																		<strong>{displayName}</strong>
																		{comment.postTitle && <span>commented on {comment.postTitle}</span>}
																	</S.AuthorInfo>
																</S.CommentMeta>
																<S.CommentMeta>
																	<S.AuthorInfo>
																		<span
																			style={{
																				color: 'var(--theme-font-primary-alt2)',
																				fontSize: 'var(--theme-typography-size-small)',
																			}}
																		>
																			{comment.comment?.dateCreated &&
																				new Date(comment.comment.dateCreated).toLocaleDateString()}
																		</span>
																		<span>•</span>
																		<S.BlockedReason>Blocked by {moderatorName}</S.BlockedReason>
																		{reason && (
																			<>
																				<span>•</span>
																				<S.BlockedReason>Reason: {reason}</S.BlockedReason>
																			</>
																		)}
																	</S.AuthorInfo>
																</S.CommentMeta>
																<S.CommentText>
																	{comment.comment?.content || 'Comment content not available'}
																</S.CommentText>
															</S.CommentContent>
															<S.CommentActions>
																<Button
																	type={'alt3'}
																	label={'Block Author'}
																	handlePress={async () => {
																		try {
																			const authorId = comment.comment?.creator;
																			if (authorId && permawebProvider.profile?.id) {
																				console.log('authorId: ', authorId);
																				await permawebProvider.libs.addModerationEntry({
																					moderationId: portalProvider.current.moderation,
																					targetType: 'profile',
																					targetId: authorId,
																					status: 'blocked',
																					moderator: permawebProvider.profile.id,
																					reason: 'default',
																				});
																				fetchModerationEntries();
																			}
																		} catch (e) {
																			console.error('Error blocking user:', e);
																		}
																	}}
																	disabled={!comment.comment?.creator}
																/>
																<Button
																	type={'alt3'}
																	label={'Unblock Comment'}
																	handlePress={async () => {
																		try {
																			const targetId = comment.targetId || comment.TargetId;
																			await permawebProvider.libs.removeModerationEntry({
																				moderationId: portalProvider.current.moderation,
																				targetType: 'comment',
																				targetId: targetId,
																			});
																			fetchModerationEntries();
																		} catch (e) {
																			console.error('Error unblocking comment:', e);
																		}
																	}}
																/>
															</S.CommentActions>
														</S.CommentRow>
													</S.CommentItem>
												);
											})}
										</S.CommentsList>
									) : (
										<S.InfoMessage>
											<p>{language?.noCommentsToModerate || 'No comments to moderate'}</p>
										</S.InfoMessage>
									)
								}
								padContent
							/>
						</S.CommentsSection>
					</S.SectionWrapper>
				</>
			</S.BodyWrapper>
		</S.Wrapper>
	);
}
