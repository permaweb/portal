import React from 'react';
import { ReactSVG } from 'react-svg';

import { ICONS } from 'helpers/config';
import { SelectOptionType } from 'helpers/types';
import { capitalize } from 'helpers/utils';
import { CloseHandler } from 'wrappers/CloseHandler';

import * as S from './styles';

export default function Select(props: {
	label?: string;
	activeOption: SelectOptionType;
	setActiveOption: (option: SelectOptionType) => void;
	options: SelectOptionType[];
	disabled: boolean;
	icon?: string;
	hideActiveOption?: boolean;
	dropdownTop?: number;
	renderOption?: (option: SelectOptionType) => React.ReactNode;
}) {
	const [active, setActive] = React.useState<boolean>(false);

	return props.options && props.activeOption ? (
		<CloseHandler active={active} disabled={!active || props.disabled} callback={() => setActive(false)}>
			<S.Wrapper>
				{props.label && (
					<S.Label disabled={props.disabled}>
						<span>{props.label}</span>
					</S.Label>
				)}
				<S.Dropdown active={active} disabled={props.disabled} onClick={() => setActive(!active)}>
					{props.icon && <ReactSVG src={props.icon} />}
					{!props.hideActiveOption && <span>{capitalize(props.activeOption.label)}</span>}
					<ReactSVG src={ICONS.arrow} />
				</S.Dropdown>
				{active && (
					<S.Options
						className={'border-wrapper-alt1 scroll-wrapper-hidden'}
						top={props.dropdownTop ? props.dropdownTop : props.label ? 77.5 : 50}
					>
						{props.options.map((option: SelectOptionType, index: number) => {
							return (
								<S.Option
									key={index}
									active={option.id === props.activeOption.id}
									onClick={() => {
										props.setActiveOption(option);
										setActive(false);
									}}
								>
									{props.renderOption ? props.renderOption(option) : option.label}
								</S.Option>
							);
						})}
					</S.Options>
				)}
			</S.Wrapper>
		</CloseHandler>
	) : null;
}
