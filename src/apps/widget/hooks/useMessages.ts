import React from 'react';

import { usePermawebProvider } from '../providers/WidgetPermawebProvider';
import { useWidgetProvider } from '../providers/WidgetProvider';

export const useMessages = () => {
	const { libs } = usePermawebProvider();
	const { config } = useWidgetProvider();
	const [messages, setMessages] = React.useState<any[]>([]);
	const [isLoading, setIsLoading] = React.useState(false);
	const [error, setError] = React.useState<any>(null);

	const processId = config.processId;
	const defaultInterval = config.mode === 'chat' || config.mode === 'private' ? 5000 : 30000;
	const pollInterval = config.pollInterval || defaultInterval;

	const fetchMessages = React.useCallback(async () => {
		if (!processId || !libs) return;

		try {
			const fetched = await libs.getComments({ commentsId: processId });
			const sorted = (fetched || []).sort((a: any, b: any) => (a.dateCreated || 0) - (b.dateCreated || 0));
			setMessages(sorted);
			setError(null);
		} catch (err: any) {
			console.error('Error fetching messages:', err);
			setError(err);
		}
	}, [processId, libs]);

	// Initial fetch
	React.useEffect(() => {
		if (!processId || !libs) return;

		setIsLoading(true);
		fetchMessages().finally(() => setIsLoading(false));
	}, [processId, libs]);

	// Polling
	React.useEffect(() => {
		if (!processId || !libs) return;

		const interval = setInterval(fetchMessages, pollInterval);
		return () => clearInterval(interval);
	}, [processId, libs, pollInterval, fetchMessages]);

	// Listen for local comment events
	React.useEffect(() => {
		const handleCommentAdded = (e: any) => {
			if (e.detail.commentsId === processId) {
				fetchMessages();
			}
		};
		window.addEventListener('commentAdded', handleCommentAdded);
		return () => window.removeEventListener('commentAdded', handleCommentAdded);
	}, [processId, fetchMessages]);

	const sendMessage = React.useCallback(
		async (content: string, parentId?: string) => {
			if (!libs || !processId) return;

			try {
				const comment = await libs.createComment({
					commentsId: processId,
					parentId,
					content,
				});

				window.dispatchEvent(
					new CustomEvent('commentAdded', {
						detail: { comment, commentsId: processId },
					})
				);

				return comment;
			} catch (err) {
				console.error('Error sending message:', err);
				throw err;
			}
		},
		[libs, processId]
	);

	return { messages, isLoading, error, sendMessage, refetch: fetchMessages };
};
