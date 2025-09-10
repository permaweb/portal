import * as S from './styles';
import { RequestStatus } from 'editor/components/organisms/UserReqUndernames/UserReqUndernames';

export default function StatusBadge(props: { status: RequestStatus }) {
	const tone =
		props.status === 'approved'
			? 'success'
			: props.status === 'pending'
			? 'warning'
			: props.status === 'rejected'
			? 'danger'
			: 'neutral';

	const label = props.status.charAt(0).toUpperCase() + props.status.slice(1);
	return <S.Badge tone={tone}>{label}</S.Badge>;
}
