import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Builder from 'engine/builder';

import { JsonEditor } from 'editor/components/molecules/JsonEditor';
import { usePortalProvider } from 'editor/providers/PortalProvider';

import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { useNotifications } from 'providers/NotificationProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';

import * as S from './styles';

export default function PageEditor() {
	const navigate = useNavigate();
	const arProvider = useArweaveProvider();
	const permawebProvider = usePermawebProvider();
	const { pageId } = useParams<{ pageId?: string }>();
	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];
	const { addNotification } = useNotifications();
	const pageLayout = portalProvider.current.pages[pageId];

	const [loading, setLoading] = React.useState(false);

	const handleSubmit = async (parsedValue: any) => {
		if (!arProvider.wallet) {
			addNotification('Please connect your wallet to save changes', 'warning');
			throw new Error('Wallet not connected');
		}

		if (!portalProvider.current?.id) {
			addNotification('No portal ID found', 'warning');
			throw new Error('No portal ID');
		}

		if (!pageId) {
			addNotification('No page ID found', 'warning');
			throw new Error('No page ID');
		}

		try {
			setLoading(true);

			// Create an update that only modifies this specific page
			// We need to send the full Pages object to preserve other pages
			const currentPages = portalProvider.current.pages || {};
			const updatedPages = {
				...currentPages,
				[pageId]: parsedValue,
			};

			// Format for the process
			const updateValue = permawebProvider.libs.mapToProcessCase(updatedPages);

			const updateData = { Pages: updateValue };

			const updateId = await permawebProvider.libs.updateZone(updateData, portalProvider.current.id, arProvider.wallet);

			console.log('Page update:', updateId);
			addNotification('Page saved successfully!', 'success');

			// Refresh the portal data
			portalProvider.refreshCurrentPortal();
		} catch (error) {
			console.error('Error saving page:', error);
			addNotification('Error saving page', 'warning');
			throw error;
		} finally {
			setLoading(false);
		}
	};

	return (
		<S.Wrapper>
			<JsonEditor
				title={pageId ? pageId.charAt(0).toUpperCase() + pageId.slice(1) : ''}
				initialValue={pageLayout}
				onSave={handleSubmit}
				loading={loading}
			/>
			<S.Preview className="border-wrapper-alt1">Preview...</S.Preview>
			{/* <Builder layout={pageLayout} preview={true} /> */}
		</S.Wrapper>
	);
}
