import React from 'react';
import { useParams } from 'react-router-dom';

import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
import { ICONS } from 'helpers/config';
import { useNotifications } from 'providers/NotificationProvider';

import * as S from '../styles';

export default function ArticlePostFeatured() {
	const { assetId } = useParams<{ assetId?: string }>();
	const portalProvider = usePortalProvider();
	const { addNotification } = useNotifications();
	const [loading, setLoading] = React.useState(false);

	if (!portalProvider.permissions?.updatePortalMeta) return null;

	const isFeatured = Boolean(assetId && portalProvider.current?.featuredPosts?.includes(assetId));

	const handleFeaturedPost = async () => {
		if (!assetId || loading) return;
		setLoading(true);
		try {
			await portalProvider.setFeaturedPost(assetId, !isFeatured);
			addNotification(isFeatured ? 'Featured post removed' : 'Featured post updated', 'success');
		} catch (e: any) {
			addNotification(e.message ?? 'Error updating featured post', 'warning');
		} finally {
			setLoading(false);
		}
	};

	return (
		<S.Section>
			<S.SectionHeaderInput>
				<p>Featured Post</p>
			</S.SectionHeaderInput>
			<S.SectionBody>
				<Button
					type={'alt1'}
					label={isFeatured ? 'Remove Featured Post' : 'Feature'}
					handlePress={() => void handleFeaturedPost()}
					disabled={!assetId || loading}
					loading={loading}
					active={isFeatured}
					icon={ICONS.featuredPost}
					iconLeftAlign
					height={40}
					fullWidth
				/>
				{!assetId && (
					<S.SectionHeader>
						<p>Save the post before featuring it</p>
					</S.SectionHeader>
				)}
			</S.SectionBody>
		</S.Section>
	);
}
