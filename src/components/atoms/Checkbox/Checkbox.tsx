import { ReactSVG } from 'react-svg';

import { ASSETS } from 'helpers/config';

import * as S from './styles';

export default function Checkbox(props: { checked: boolean; handleSelect: () => void; disabled: boolean }) {
	return (
		<S.Wrapper disabled={props.disabled}>
			<S.Input checked={props.checked} disabled={props.disabled} type={'checkbox'} onChange={props.handleSelect} />
			{props.checked && <ReactSVG src={ASSETS.checkmark} />}
		</S.Wrapper>
	);
}
