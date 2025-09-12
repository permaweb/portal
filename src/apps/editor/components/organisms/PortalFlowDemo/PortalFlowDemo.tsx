import { UndernamesList } from '../UndernamesList';
import { UndernameRequestList } from '../UndernameRequestList';

export default function PortalFlowDemo() {
	return (
		<div style={{ display: 'grid', gap: '32px', padding: '32px' }}>
			<UndernameRequestList showRequesterColumn />
			<UndernamesList />
		</div>
	);
}
