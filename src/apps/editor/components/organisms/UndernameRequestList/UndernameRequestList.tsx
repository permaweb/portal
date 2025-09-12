import React from 'react';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { Pagination } from 'components/atoms/Pagination';
import { Button } from 'components/atoms/Button';
import { Panel } from 'components/atoms/Panel';
import * as S from './styles';
import { UndernameRequestRow } from 'editor/components/molecules/UndernameRequestRow';
import { useUndernamesProvider } from 'providers/UndernameProvider';
import { IS_TESTNET } from 'helpers/config';
import { ANT, ArconnectSigner, ARIO } from '@ar.io/sdk';
import { getPortalIdFromURL } from 'helpers/utils';
import { useNotifications } from 'providers/NotificationProvider';

export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export type UndernameRequest = {
	id: number;
	name: string;
	requester: string;
	status: RequestStatus;
	createdAt?: number;
	decidedAt?: number;
	decidedBy?: string;
	reason?: string;
	[key: string]: any;
};

const PAGE_SIZE = 10;
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

export default function UndernameRequestsList(props: { filterByRequester?: string; showRequesterColumn?: boolean }) {
	const { checkAvailability, request, requests, approve, reject } = useUndernamesProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	// pagination
	const { addNotification } = useNotifications();
	const [currentPage, setCurrentPage] = React.useState(1);

	// claim panel state
	const [openClaim, setOpenClaim] = React.useState(false);
	const [name, setName] = React.useState('');
	const [error, setError] = React.useState<string | null>(null);
	const [loading, setLoading] = React.useState(false);
	const handleChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const next = e.target.value.toLowerCase();
		setName(next);
		setError(validateUndername(next));
	}, []);

	const handleRequest = React.useCallback(async () => {
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
	}, [name, props]);

	// data shaping
	const processed = React.useMemo(() => {
		let rows = requests;
		if (props.filterByRequester) rows = rows.filter((r) => r.requester === props.filterByRequester);
		return [...rows].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
	}, [requests, props.filterByRequester]);

	const totalPages = React.useMemo(() => Math.max(1, Math.ceil(processed.length / PAGE_SIZE)), [processed.length]);

	React.useEffect(() => {
		setCurrentPage((prev) => (prev > totalPages ? totalPages : prev < 1 ? 1 : prev));
	}, [totalPages]);

	const handleAdminApprove = async (id: number) => {
		setLoading(true);
		const ario = IS_TESTNET ? ARIO.testnet() : ARIO.mainnet();
		const arnsRecord = await ario.getArNSRecord({ name: 'bhavya-gor-experiments' });
		const signer = new ArconnectSigner(window.arweaveWallet);
		const portalId = getPortalIdFromURL();
		const ant = ANT.init({
			processId: arnsRecord.processId,
			signer,
		});
		const undernameRow = requests.find((r) => r.id === id);
		console.log('Approving request for', undernameRow, arnsRecord, ant);
		if (!undernameRow) return;
		const { id: txId } = await ant.setUndernameRecord(
			{
				undername: undernameRow.name,
				transactionId: portalId,
				ttlSeconds: 900,
			},
			{ tags: [{ name: 'PortalNewUndername', value: undernameRow.name }] }
		);
		console.log('Undername set in transaction', txId);
		setLoading(false);
		await approve(id);
		addNotification(`Undername ${undernameRow.name} approved`, 'success');
	};

	const handleAdminReject = async (id: number, reason: string) => {
		setLoading(true);
		await reject(id, reason);
		setLoading(false);
		addNotification('Undername request rejected', 'success');
	};

	const startIndex = (currentPage - 1) * PAGE_SIZE;
	const endIndex = Math.min(startIndex + PAGE_SIZE, processed.length);
	const pageRows = React.useMemo(() => processed.slice(startIndex, endIndex), [processed, startIndex, endIndex]);

	const currentRange = React.useMemo(
		() => ({
			start: processed.length ? startIndex + 1 : 0,
			end: processed.length ? endIndex : 0,
			total: processed.length,
		}),
		[processed.length, startIndex, endIndex]
	);

	const content = React.useMemo(() => {
		if (processed.length === 0) {
			return (
				<>
					<S.Toolbar>
						<div />
						<Button
							type={'alt1'}
							label={language?.claimUndername || 'Claim undername'}
							handlePress={() => setOpenClaim(true)}
						/>
					</S.Toolbar>
					<S.WrapperEmpty>
						<p>{language?.noRequestsFound || 'No requests found'}</p>
					</S.WrapperEmpty>
				</>
			);
		}
		return (
			<>
				<S.Toolbar>
					<div />
					<Button
						type={'alt1'}
						label={language?.claimUndername || 'Claim undername'}
						handlePress={() => setOpenClaim(true)}
						disabled={loading}
					/>
				</S.Toolbar>

				<S.ListWrapper>
					<S.HeaderRow showRequester={!!props.showRequesterColumn}>
						<S.HeaderCell>Id</S.HeaderCell>
						<S.HeaderCell>Undername</S.HeaderCell>
						{props.showRequesterColumn && <S.HeaderCell>Requester</S.HeaderCell>}
						<S.HeaderCell>Status</S.HeaderCell>
						<S.HeaderCell>Created</S.HeaderCell>
						<S.HeaderCell>Decision</S.HeaderCell>
					</S.HeaderRow>

					{pageRows.map((r) => (
						<S.RowWrapper key={r.id}>
							<UndernameRequestRow
								row={r}
								onApprove={async (id) => await handleAdminApprove(id)}
								onReject={async (id, reason) => await handleAdminReject(id, reason)}
								showRequester={!!props.showRequesterColumn}
							/>
						</S.RowWrapper>
					))}
				</S.ListWrapper>
			</>
		);
	}, [processed.length, pageRows, language]);

	return (
		<S.Wrapper>
			{content}

			<S.Footer>
				<Pagination
					totalItems={processed.length}
					totalPages={totalPages}
					currentPage={currentPage}
					currentRange={currentRange}
					setCurrentPage={setCurrentPage}
					showRange
					showControls
					iconButtons
				/>
			</S.Footer>

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
		</S.Wrapper>
	);
}
