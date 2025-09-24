import { ReactSVG } from 'react-svg';
import { ICONS_UI } from 'helpers/config';
import * as S from './styles';

export default function Toggle(props: any) {
	return (
		<S.Toggle $state={props.state} onClick={() => props.setState()}>
			{props.theme && (
				<>
					<S.Icon $state={props.state}>
						<ReactSVG src={ICONS_UI.LIGHT} />
					</S.Icon>
					<S.Icon $state={props.state}>
						<ReactSVG src={ICONS_UI.DARK} />
					</S.Icon>
				</>
			)}
			<S.Marker $state={props.state} />
		</S.Toggle>
	);
}
