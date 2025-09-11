import { UndernamesList } from '../UndernamesList';
import { UndernameRequestList } from '../UndernameRequestList';
import { useUndernamesProvider } from 'providers/UndernameProvider';
import { ARIO, ANT, ArconnectSigner } from '@ar.io/sdk';
import { IS_TESTNET } from 'helpers/config';

export default function PortalFlowDemo() {
	const { requests, owners, approve, reject, request } = useUndernamesProvider();
	// Mock state

	const handleUserSubmit = async (name: string) => {
		try {
			await request(name);
		} catch (e) {
			console.error('Request failed', e);
		}
	};

	const handleAdminApprove = async (id: number) => {
		const ario = IS_TESTNET ? ARIO.testnet() : ARIO.mainnet();
		const arnsRecord = await ario.getArNSRecord({ name: 'portal' });
		const signer = new ArconnectSigner(window.arweaveWallet);
		const ant = ANT.init({
			processId: arnsRecord.processId,
			signer,
		});
		const undernameRow = requests.find((r) => r.id === id);
		if (!undernameRow) return;

		const { id: txId } = await ant.setUndernameRecord(
			{
				undername: undernameRow.name,
				transactionId: '432l1cy0aksiL_x9M359faGzM_yjralacHIUo8_nQXM', // what is this?
				ttlSeconds: 900,
			},
			{ tags: [{ name: 'PortalNewUndername', value: undernameRow.name }] }
		);
	};

	const handleAdminReject = async (id: number, reason: string) => {
		await reject(id, reason);
	};

	return (
		<div style={{ display: 'grid', gap: '32px', padding: '32px' }}>
			<UndernameRequestList
				requests={requests}
				onApprove={handleAdminApprove}
				onReject={handleAdminReject}
				onRequest={handleUserSubmit}
				showRequesterColumn
			/>
			<UndernamesList owners={owners} />
		</div>
	);
}
