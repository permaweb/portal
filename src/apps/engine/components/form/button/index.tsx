import * as S from './styles';

type Props = {
	label: string;
	type: string;
	icon?: string;
	disabled?: boolean;
	onClick: (e: React.MouseEvent) => void;
};

export default function Button(props: Props) {
	const { label, type, disabled, onClick } = props;

	return (
		<S.Button
			title={label}
			aria-label={label}
			$variant={type}
			onClick={(e) => {
				if (onClick) {
					e.stopPropagation();
					onClick(e);
				}
			}}
			disabled={disabled}
		>
			{label}
		</S.Button>
	);
}
