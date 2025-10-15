import React from 'react';
import { usePortalProvider } from 'engine/providers/portalProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';

export const useModeration = () => {
	const { portal } = usePortalProvider();
	const { libs, profile } = usePermawebProvider();
	const [blockedComments, setBlockedComments] = React.useState<Set<string>>(new Set());
	const [blockedUsers, setBlockedUsers] = React.useState<Set<string>>(new Set());
	const [isLoading, setIsLoading] = React.useState(false);

	const isModerator = profile?.owner && profile?.roles && ['Admin', 'Moderator'].some((r) => profile.roles.includes(r));
	const moderationId = portal?.Moderation;

	const fetchModerationEntries = React.useCallback(() => {
		if (!libs || !moderationId) {
			return;
		}

		setIsLoading(true);

		const commentPromise = libs.getModerationEntries({ moderationId, targetType: 'comment', status: 'blocked' })
			.then(entries => entries)
			.catch(err => {
				console.error('Error fetching comment entries:', err);
				return [];
			});

		const userPromise = libs.getModerationEntries({ moderationId, targetType: 'profile', status: 'blocked' })
			.then(entries => entries)
			.catch(err => {
				console.error('Error fetching user entries:', err);
				return [];
			});			

		Promise.all([commentPromise, userPromise])
			.then(([commentEntries, userEntries]) => {
				const blockedCommentIds = (commentEntries || []).map((e: any) => e.targetId || e.TargetId);
				const blockedUserIds = (userEntries || []).map((e: any) => e.targetId || e.TargetId);

				setBlockedComments(new Set(blockedCommentIds));
				setBlockedUsers(new Set(blockedUserIds));
				setIsLoading(false);
			})
			.catch((err: any) => {
				console.error('Error fetching moderation entries:', err);
				setBlockedComments(new Set());
				setBlockedUsers(new Set());
				setIsLoading(false);
			});
	}, [libs, moderationId, isModerator]);

	React.useEffect(() => {
		fetchModerationEntries();
	}, [fetchModerationEntries]);

	React.useEffect(() => {
		const handleModerationChange = () => {
			fetchModerationEntries();
		};
		window.addEventListener('commentAdded', handleModerationChange);
		return () => window.removeEventListener('commentAdded', handleModerationChange);
	}, [fetchModerationEntries]);

	return {
		blockedComments,
		blockedUsers,
		isModerator,
		isLoading,
	};
};
