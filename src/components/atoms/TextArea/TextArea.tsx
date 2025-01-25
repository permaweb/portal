import { formatRequiredField } from 'helpers/utils';

import * as S from './styles';
import { IProps } from './types';

export default function TextArea(props: IProps) {
	return (
		<S.Wrapper>
			{props.label && <S.Label>{props.required ? formatRequiredField(props.label) : props.label}</S.Label>}
			<S.TextArea
				value={props.value}
				onChange={props.onChange}
				onFocus={() => (props.onFocus ? props.onFocus() : {})}
				disabled={props.disabled}
				invalid={props.invalid.status}
				placeholder={props.placeholder ? props.placeholder : ''}
				data-testid={props.testingCtx}
			/>
			{!props.hideErrorMessage && (
				<S.ErrorContainer>{props.invalid.message && <S.Error>{props.invalid.message}</S.Error>}</S.ErrorContainer>
			)}
		</S.Wrapper>
	);
}
