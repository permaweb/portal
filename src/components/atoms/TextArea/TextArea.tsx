import React from 'react';

import { ValidationType } from 'helpers/types';
import { formatRequiredField } from 'helpers/utils';

import * as S from './styles';

export default function TextArea(props: {
	label?: string;
	value: number | string;
	onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
	onFocus?: () => void;
	invalid: ValidationType;
	disabled: boolean;
	placeholder?: string;
	endText?: string;
	error?: string | null;
	testingCtx?: string;
	required?: boolean;
	hideErrorMessage?: boolean;
}) {
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
