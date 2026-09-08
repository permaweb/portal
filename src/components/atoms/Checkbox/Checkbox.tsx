import { ReactSVG } from 'components/atoms/GatewaySVG';
import { ICONS } from 'helpers/config';

import * as S from './styles';

export default function Checkbox(props: { checked: boolean; handleSelect: () => void; disabled: boolean }) {
	return (
		<S.Wrapper disabled={props.disabled}>
			<S.Input checked={props.checked} disabled={props.disabled} type={'checkbox'} onChange={props.handleSelect} />
			{props.checked && <ReactSVG src={ICONS.checkmark} />}
		</S.Wrapper>
	);
}
