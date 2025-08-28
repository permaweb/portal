import { Button } from '../Button';

import * as S from './styles';

export default function Toggle(props: {
	label?: string;
	options: string[];
	activeOption: string;
	handleToggle: (option: string) => void;
	disabled: boolean;
}) {
	return (
		<S.Wrapper>
			{props.label && (
				<S.Label>
					<p>{props.label}</p>
				</S.Label>
			)}
			<S.Options>
				{props.options.map((option: string, index: number) => {
					return (
						<Button
							key={index}
							type={'alt3'}
							label={option}
							handlePress={() => props.handleToggle(option)}
							disabled={props.disabled}
							active={option.toLowerCase() === props.activeOption.toLowerCase()}
						/>
					);
				})}
			</S.Options>
		</S.Wrapper>
	);
}
