import React from 'react';

import { usePermawebProvider } from 'providers/PermawebProvider';

import { useModeration } from './moderation';

export const useComments = (rootId: any, root: boolean = false) => {
	const { libs } = usePermawebProvider();
	const { blockedComments, blockedUsers, isModerator, isLoading: isModerationLoading } = useModeration();
	const [comments, setComments] = React.useState([]);
	const [isLoading, setIsLoading] = React.useState(false);
	const [error, setError] = React.useState(null);
	const [refetchTrigger, setRefetchTrigger] = React.useState(0);

	React.useEffect(() => {
		if (!rootId || !libs) {
			setComments([]);
			return;
		}

		if (!isModerator && isModerationLoading) {
			setIsLoading(true);
			return;
		}

		setIsLoading(true);
		setError(null);

		libs
			.getComments({ commentsId: rootId })
			.then((fetchedComments: any) => {
				let filteredComments = !root
					? fetchedComments || []
					: (fetchedComments || []).filter((comment: any) => comment.rootSource === comment.dataSource);

				if (!isModerator) {
					filteredComments = filteredComments.filter((comment: any) => {
						const commentBlocked = blockedComments.has(comment.id);
						const userBlocked = blockedUsers.has(comment.creator);
						const isBlocked = commentBlocked || userBlocked;
						return !isBlocked;
					});
				}
				setComments(filteredComments);
			})
			.catch((err: any) => {
				console.error('Error fetching comments:', err);
				setError(err);
				setComments([]);
			})
			.finally(() => {
				setIsLoading(false);
			});
	}, [rootId, libs, root, blockedComments, blockedUsers, isModerator, isModerationLoading, refetchTrigger]);

	React.useEffect(() => {
		const handleCommentAdded = (e: any) => {
			if (e.detail.commentsId === rootId) {
				setRefetchTrigger((prev) => prev + 1);
			}
		};
		window.addEventListener('commentAdded', handleCommentAdded);
		return () => window.removeEventListener('commentAdded', handleCommentAdded);
	}, [rootId]);

	return { comments, isLoading, error };
};

export const useCommentRules = (commentsId: string) => {
	const { libs } = usePermawebProvider();
	const [rules, setRules] = React.useState<any>(null);
	const [isLoading, setIsLoading] = React.useState(false);
	const [error, setError] = React.useState(null);

	React.useEffect(() => {
		if (!commentsId || !libs?.getRules) return;

		setIsLoading(true);
		libs
			.getRules({ commentsId })
			.then((fetchedRules: any) => {
				if (fetchedRules) {
					const requireProfileThumbnail = fetchedRules.requireProfileThumbnail ?? fetchedRules.RequireProfileThumbnail;
					const normalizedRules = {
						profileAgeRequired: fetchedRules.profileAgeRequired ?? fetchedRules.ProfileAgeRequired,
						mutedWords: fetchedRules.mutedWords ?? fetchedRules.MutedWords,
						requireProfileThumbnail: requireProfileThumbnail === 'true' || requireProfileThumbnail === true,
					};
					setRules(normalizedRules);
				}
			})
			.catch((err: any) => {
				console.error('Error fetching comment rules:', err);
				setError(err);
			})
			.finally(() => {
				setIsLoading(false);
			});
	}, [commentsId, libs]);

	return { rules, isLoading, error };
};
