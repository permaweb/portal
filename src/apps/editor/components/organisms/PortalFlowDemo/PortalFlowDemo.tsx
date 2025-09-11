import { UndernamesList } from '../UndernamesList';
import { UndernameRequestList } from '../UndernameRequestList';
import { useUndernamesProvider } from 'providers/UndernameProvider';
import { ARIO, ANT, ArconnectSigner } from '@ar.io/sdk';
import { IS_TESTNET } from 'helpers/config';

const owners = {
	helloworld: {
		owner: 'QOOdRA37tOkge37z80UlvyvMEv3E5p_cb4uJ12lSTuw',
		requestedAt: 1757435959985,
		approvedAt: 1757437301912,
		approvedBy: 'jAZKAHOGeus7CUJlJqAAqn3Aj8GjdZOnIfb8qHwBOM0',
		requestId: 1,
		source: 'approval',
		auto: false,
	},
	gor: {
		owner: 'QOOdRA37tOkge37z80UlvyvMEv3E5p_cb4uJ12lSTuw',
		requestedAt: 1757438000000,
		approvedAt: 1757438000000,
		approvedBy: 'QOOdRA37tOkge37z80UlvyvMEv3E5p_cb4uJ12lSTuw',
		requestId: null,
		source: 'reserved',
		auto: true,
	},
	bhavya: {
		owner: 'YKuKb41Mi6ccb-NmgZwjxnBA42DGCUYDvqIGYjLMve4',
		requestedAt: 1757440000000,
		approvedAt: 1757440000000,
		approvedBy: 'YKuKb41Mi6ccb-NmgZwjxnBA42DGCUYDvqIGYjLMve4',
		requestId: null,
		source: 'self',
		auto: true,
	},
} as const;

export default function PortalFlowDemo() {
	const { requests, approve, reject, request } = useUndernamesProvider();
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
