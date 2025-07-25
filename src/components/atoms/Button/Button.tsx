import { Link } from 'react-router-dom';
import { ReactSVG } from 'react-svg';

import { ButtonType } from 'helpers/types';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';

export default function Button(props: {
	type: ButtonType;
	label: string | number | React.ReactNode;
	handlePress?: (e: React.MouseEvent) => void;
	disabled?: boolean;
	active?: boolean;
	loading?: boolean;
	icon?: string;
	iconLeftAlign?: boolean;
	formSubmit?: boolean;
	noFocus?: boolean;
	useMaxWidth?: boolean;
	noMinWidth?: boolean;
	width?: number;
	height?: number;
	fullWidth?: boolean;
	tooltip?: string;
	warning?: boolean;
	className?: string;
	link?: string;
	target?: '_blank';
}) {
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const buttonStyle = getType();
	const StyledButton = buttonStyle.wrapper;
	const StyledIcon = buttonStyle.icon;

	function getType() {
		let buttonObj: {
			wrapper: any;
			icon: any;
		};

		switch (props.type) {
			case 'primary':
				buttonObj = {
					wrapper: S.Primary,
					icon: S.IconPrimary,
				};
				break;
			case 'alt1':
				buttonObj = {
					wrapper: S.Alt1,
					icon: S.IconAlt1,
				};
				break;
			case 'alt2':
				buttonObj = {
					wrapper: S.Alt2,
					icon: S.IconAlt2,
				};
				break;
			case 'alt3':
				buttonObj = {
					wrapper: S.Alt3,
					icon: S.IconAlt3,
				};
				break;
			case 'alt4':
				buttonObj = {
					wrapper: S.Alt4,
					icon: S.IconAlt4,
				};
				break;
			case 'indicator':
				buttonObj = {
					wrapper: S.Indicator,
					icon: S.IconIndicator,
				};
				break;
			case 'warning':
				buttonObj = {
					wrapper: S.Warning,
					icon: S.IconWarning,
				};
				break;
			default:
				buttonObj = {
					wrapper: S.Primary,
					icon: S.IconPrimary,
				};
				break;
		}
		return buttonObj;
	}

	function getLabel() {
		return (
			<>
				{props.icon && props.iconLeftAlign && (
					<StyledIcon
						warning={props.warning || false}
						disabled={props.disabled}
						active={props.active}
						leftAlign={props.iconLeftAlign}
					>
						<ReactSVG src={props.icon} />
					</StyledIcon>
				)}
				<span>{props.loading ? `${language?.loading}...` : props.label}</span>
				{props.icon && !props.iconLeftAlign && (
					<StyledIcon
						warning={props.warning || false}
						disabled={props.disabled}
						active={props.active}
						leftAlign={props.iconLeftAlign}
					>
						<ReactSVG src={props.icon} />
					</StyledIcon>
				)}
			</>
		);
	}

	function handlePress(e: React.MouseEvent) {
		e.stopPropagation();
		e.preventDefault();
		props.handlePress(e);
	}

	function getAction() {
		if (props.link) {
			return (
				<StyledButton
					as={Link}
					to={props.link}
					tabIndex={props.noFocus ? -1 : 0}
					onClick={props.handlePress}
					onKeyPress={handlePress}
					active={props.active}
					width={props.width}
					height={props.height}
					className={props.className || ''}
					target={props.target ?? ''}
					style={{ pointerEvents: props.disabled ? 'none' : 'auto', opacity: props.disabled ? 0.6 : 1 }}
				>
					{getLabel()}
				</StyledButton>
			);
		} else {
			return (
				<StyledButton
					tabIndex={props.noFocus ? -1 : 0}
					type={props.formSubmit ? 'submit' : 'button'}
					onClick={props.handlePress}
					onKeyPress={handlePress}
					disabled={props.disabled}
					active={props.active}
					useMaxWidth={props.useMaxWidth}
					noMinWidth={props.noMinWidth}
					fullWidth={props.fullWidth}
					width={props.width}
					height={props.height}
					warning={props.warning || false}
					className={props.className || ''}
				>
					{getLabel()}
				</StyledButton>
			);
		}
	}

	function getButton() {
		if (props.tooltip) {
			return (
				<S.Wrapper>
					<S.Tooltip className={'info'} useBottom={true}>
						<span>{props.tooltip}</span>
					</S.Tooltip>
					{getAction()}
				</S.Wrapper>
			);
		} else {
			return getAction();
		}
	}

	return getButton();
}
