import Icon from 'engine/components/icon';
import * as ICONS from 'engine/constants/icons';
import * as S from './styles';

export default function Toggle(props: any) {
	return (
		<S.Toggle $state={props.state} onClick={() => props.setState()}>
			{props.theme && (
				<>
					<S.Icon $state={props.state}>
						<Icon icon={ICONS.LIGHT} />
					</S.Icon>
					<S.Icon $state={props.state}>
						<Icon icon={ICONS.DARK} />
					</S.Icon>
				</>
			)}
			<S.Marker $state={props.state} />
		</S.Toggle>
	);
}
