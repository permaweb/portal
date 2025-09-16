import React from 'react';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { Pagination } from 'components/atoms/Pagination';
import * as S from './styles';
import { UndernameRequestRow } from 'editor/components/molecules/UndernameRequestRow';
import { useUndernamesProvider } from 'providers/UndernameProvider';
import { IS_TESTNET } from 'helpers/config';
import { ANT, ArconnectSigner, ARIO } from '@ar.io/sdk';
import { getPortalIdFromURL } from 'helpers/utils';
import { useNotifications } from 'providers/NotificationProvider';
import { ClaimUndername } from 'editor/components/molecules/ClaimUndername';

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

export default function UndernameRequestsList(props: { filterByRequester?: string; showRequesterColumn?: boolean }) {
	const { requests, approve, reject } = useUndernamesProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	// pagination
	const { addNotification } = useNotifications();
	const [currentPage, setCurrentPage] = React.useState(1);

	const [loading, setLoading] = React.useState(false);

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
		// const ario = IS_TESTNET ? ARIO.testnet() : ARIO.mainnet();
		const ario = ARIO.mainnet();
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
						<ClaimUndername />
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
					<ClaimUndername />
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
								loading={loading}
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
		</S.Wrapper>
	);
}
