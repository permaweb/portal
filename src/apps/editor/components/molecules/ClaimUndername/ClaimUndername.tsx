import React from 'react';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { Button } from 'components/atoms/Button';
import { Panel } from 'components/atoms/Panel';
import * as S from './styles';
import { getPortalIdFromURL } from 'helpers/utils';
import { useNotifications } from 'providers/NotificationProvider';
import { useUndernamesProvider } from 'providers/UndernameProvider';

const MAX_UNDERNAME = 51;

function validateUndername(raw: string) {
	const name = (raw || '').toLowerCase();
	if (!name) return 'Name is required';
	if (name.length > MAX_UNDERNAME) return `Max ${MAX_UNDERNAME} characters`;
	if (name === 'www') return 'Cannot be "www"';
	if (!/^[a-z0-9_.-]+$/.test(name)) return 'Only a–z, 0–9, underscore (_), dot (.), and dash (-) allowed';
	if (/^-|-$/.test(name)) return 'No leading or trailing dashes';
	return null;
}

export default function ClaimUndername() {
	const { checkAvailability, request, owners } = useUndernamesProvider();
	const languageProvider = useLanguageProvider();
	const { addNotification } = useNotifications();

	const [openClaim, setOpenClaim] = React.useState(false);
	const [name, setName] = React.useState('');
	const [error, setError] = React.useState<string | null>(null);
	const [loading, setLoading] = React.useState(false);
	const portalId = getPortalIdFromURL();
	const language = languageProvider.object[languageProvider.current];

	const ownedByPortal = React.useMemo(() => {
		if (!owners || !portalId) return false;
		return Object.values(owners ?? {}).some((entry: any) => entry.owner === portalId);
	}, [owners, portalId]);

	const handleChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const next = e.target.value.toLowerCase();
		setName(next);
		setError(validateUndername(next));
	}, []);

	const handleRequest = React.useCallback(async () => {
		if (ownedByPortal) {
			addNotification('This portal already owns an undername', 'warning');
			return;
		}
		if (loading) return;
		const err = validateUndername(name);
		setError(err);
		if (err) return;
		setLoading(true);
		const availability = await checkAvailability(name);
		if (!availability) {
			setError('Name is already taken');
			addNotification('Name is already taken', 'warning');
			return;
		}
		if (availability.available && !availability.reserved) {
			await request(name.trim());
			setName('');
			setOpenClaim(false);
			addNotification('Undername request submitted', 'success');
			setLoading(false);
		}
	}, [name]);

	if (ownedByPortal) return null; // if portal already owns an undername, don't show the claim button

	return (
		<>
			<Button
				type={'alt1'}
				label={language?.claimUndername || 'Claim undername'}
				handlePress={() => setOpenClaim(true)}
				disabled={loading}
			/>
			<Panel
				open={openClaim}
				width={560}
				header={language?.claimUndername || 'Claim an undername'}
				handleClose={() => {
					setOpenClaim(false);
					setName('');
					setError(null);
				}}
				closeHandlerDisabled
			>
				<S.ClaimCard>
					<S.Row>
						<S.Input
							placeholder="Enter your undername"
							value={name}
							onChange={handleChange}
							maxLength={MAX_UNDERNAME}
						/>
						<Button
							type={'alt1'}
							label={language?.request || 'Request'}
							handlePress={handleRequest}
							disabled={!name.trim() || !!error}
						/>
					</S.Row>
					{error && <S.Error>{error}</S.Error>}
					<S.Helper>
						Max: 51 Characters · Allowed: a–z, 0–9, `_ . -` · No leading/trailing dashes · Cannot be “www”
					</S.Helper>
				</S.ClaimCard>
			</Panel>
		</>
	);
}
