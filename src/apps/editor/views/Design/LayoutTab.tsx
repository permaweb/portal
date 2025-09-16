import React from 'react';

import { JsonEditor } from 'editor/components/molecules/JsonEditor';
import { usePortalProvider } from 'editor/providers/PortalProvider';

import { PortalPatchMapEnum } from 'helpers/types';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { useNotifications } from 'providers/NotificationProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';

import * as S from './styles';

export default function LayoutTab() {
	const arProvider = useArweaveProvider();
	const permawebProvider = usePermawebProvider();
	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];
	const { addNotification } = useNotifications();

	const [loading, setLoading] = React.useState(false);

	// Get the current layout from the portal
	const currentLayout = portalProvider.current?.layout;

	console.log('Portal data:', portalProvider.current);
	console.log('Current layout:', currentLayout);

	const handleSubmit = async (parsedValue: any) => {
		console.log('Attempting to save layout:', parsedValue);

		if (!arProvider.wallet) {
			addNotification('Please connect your wallet to save changes', 'warning');
			throw new Error('Wallet not connected');
		}

		if (!portalProvider.current?.id) {
			addNotification('No portal ID found', 'warning');
			throw new Error('No portal ID');
		}

		try {
			setLoading(true);

			// Format for the process
			const updateValue = permawebProvider.libs.mapToProcessCase(parsedValue);
			console.log('Update value after mapToProcessCase:', updateValue);

			const updateData = { Layout: updateValue };
			console.log('Final update data:', updateData);

			const updateId = await permawebProvider.libs.updateZone(updateData, portalProvider.current.id, arProvider.wallet);

			console.log('Layout update transaction ID:', updateId);
			addNotification('Layout saved successfully!', 'success');

			// Refresh the portal data
			portalProvider.refreshCurrentPortal(PortalPatchMapEnum.Presentation);
		} catch (error) {
			console.error('Error saving layout:', error);
			addNotification('Error saving layout', 'warning');
			throw error;
		} finally {
			setLoading(false);
		}
	};

	return (
		<S.BodyWrapper>
			<JsonEditor initialValue={currentLayout} onSave={handleSubmit} loading={loading} />
		</S.BodyWrapper>
	);
}
