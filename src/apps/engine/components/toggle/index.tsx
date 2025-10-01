import { ReactSVG } from 'react-svg';
import { ICONS } from 'helpers/config';
import * as S from './styles';

export default function Toggle(props: any) {
	return (
		<S.Toggle $state={props.state} onClick={() => props.setState()}>
			{props.theme && (
				<>
					<S.Icon $state={props.state}>
						<ReactSVG src={ICONS.light} />
					</S.Icon>
					<S.Icon $state={props.state}>
						<ReactSVG src={ICONS.dark} />
					</S.Icon>
				</>
			)}
			<S.Marker $state={props.state} />
		</S.Toggle>
	);
}
