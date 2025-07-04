import { Button } from '../Button';

import * as S from './styles';
import { IProps } from './types';

export default function Toggle(props: IProps) {
	return (
		<S.Wrapper>
			<S.Label>
				<p>{props.label}</p>
			</S.Label>
			<S.Options>
				{props.options.map((option: string, index: number) => {
					return (
						<Button
							key={index}
							type={'alt3'}
							label={option}
							handlePress={() => props.handleToggle(option)}
							active={option.toLowerCase() === props.activeOption.toLowerCase()}
						/>
					)
				})}
			</S.Options>
		</S.Wrapper>
	)
}