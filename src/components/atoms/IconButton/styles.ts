import styled from 'styled-components';

export const Tooltip = styled.div<{ position: string }>`
	position: absolute;
	z-index: 2;
	display: none;
	white-space: nowrap;

	${(props) => {
		switch (props.position) {
			case 'top':
				return `
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-bottom: 5px;
        `;
			case 'bottom':
				return `
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-top: 5px;
        `;
			case 'left':
				return `
          right: 100%;
          top: 50%;
          transform: translateY(-50%);
          margin-right: 5px;
        `;
			case 'right':
				return `
          left: 100%;
          top: 50%;
          transform: translateY(-50%);
          margin-left: 5px;
        `;
			case 'top-left':
				return `
          bottom: 100%;
          left: 0;
          margin-bottom: 5px;
        `;
			case 'top-right':
				return `
          bottom: 100%;
          right: 0;
          margin-bottom: 5px;
        `;
			case 'bottom-left':
				return `
          top: 100%;
          left: 0;
          margin-top: 5px;
        `;
			case 'bottom-right':
				return `
          top: 100%;
          right: 0;
          margin-top: 5px;
        `;
			default:
				return `
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-top: 5px;
        `;
		}
	}}

	span {
		display: block !important;
		line-height: 1.65 !important;
		color: ${(props) => props.theme.colors.contrast.color} !important;
		font-size: ${(props) => props.theme.typography.size.xxxSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		white-space: nowrap !important;
		text-decoration: none !important;
	}
`;

export const Wrapper = styled.div`
	position: relative;
	height: fit-content;
	width: fit-content;
	&:hover {
		${Tooltip} {
			display: block;
		}
	}
`;

export const Primary = styled.button<{
	dimensions: { wrapper: number; icon: number } | undefined;
	sm: boolean | undefined;
	warning: boolean | undefined;
	disabled: boolean | undefined;
	active: boolean | undefined;
}>`
	height: ${(props) => (props.dimensions ? `${props.dimensions.wrapper.toString()}px` : `42.5px`)} !important;
	width: ${(props) => (props.dimensions ? `${props.dimensions.wrapper.toString()}px` : `42.5px`)} !important;
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 4.5px 0 0 0 !important;
	pointer-events: ${(props) => (props.disabled ? 'none' : 'all')};
	border-radius: 50%;

	background: ${(props) =>
		props.active
			? props.theme.colors.button.primary.active.background
			: props.disabled
			? props.theme.colors.button.primary.disabled.background
			: 'transparent'};
	border: 1px solid
		${(props) =>
			props.active
				? props.theme.colors.button.primary.active.border
				: props.disabled
				? props.theme.colors.button.primary.disabled.border
				: 'transparent'};

	svg {
		height: ${(props) => (props.dimensions ? `${props.dimensions.icon.toString()}px` : `24.5px`)} !important;
		width: ${(props) => (props.dimensions ? `${props.dimensions.icon.toString()}px` : `24.5px`)} !important;
		margin: auto !important;
		color: ${(props) =>
			props.disabled
				? props.theme.colors.button.primary.disabled.color
				: props.active
				? props.theme.colors.button.primary.active.color
				: props.theme.colors.button.primary.color};
		fill: ${(props) =>
			props.disabled
				? props.theme.colors.button.primary.disabled.color
				: props.active
				? props.theme.colors.button.primary.active.color
				: props.theme.colors.button.primary.color};
	}
	&:hover {
		background: ${(props) => props.theme.colors.button.primary.active.background};
	}
`;

export const Alt1 = styled(Primary)`
	background: ${(props) =>
		props.active
			? props.theme.colors.button.primary.active.background
			: props.disabled
			? props.theme.colors.button.primary.disabled.background
			: props.theme.colors.button.primary.background};
	border: 1px solid
		${(props) =>
			props.active
				? props.theme.colors.button.primary.active.border
				: props.disabled
				? props.theme.colors.button.primary.disabled.border
				: props.theme.colors.button.primary.border};
	svg {
		height: ${(props) => (props.dimensions ? `${props.dimensions.icon.toString()}px` : `24.5px`)};
		width: ${(props) => (props.dimensions ? `${props.dimensions.icon.toString()}px` : `24.5px`)};
		color: ${(props) =>
			props.active
				? props.theme.colors.font.light1
				: props.disabled
				? props.theme.colors.button.primary.disabled.color
				: props.theme.colors.button.primary.color};
		fill: ${(props) =>
			props.active
				? props.theme.colors.font.light1
				: props.disabled
				? props.theme.colors.button.primary.disabled.color
				: props.theme.colors.button.primary.color};
	}

	box-shadow: ${(props) => props.theme.colors.shadow.primary} 0px 1px 2px 0.5px;

	&:hover {
		background: ${(props) =>
			props.disabled
				? props.theme.colors.button.primary.disabled.background
				: props.theme.colors.button.primary.active.background};
	}
`;

export const Alt2 = styled(Primary)`
	background: ${(props) =>
		props.active
			? props.theme.colors.button.alt1.active.background
			: props.disabled
			? props.theme.colors.button.alt1.disabled.background
			: props.theme.colors.button.alt1.background};
	border: 1px solid
		${(props) =>
			props.active
				? props.theme.colors.button.alt1.active.border
				: props.disabled
				? props.theme.colors.button.alt1.disabled.border
				: props.theme.colors.button.alt1.border};
	svg {
		height: ${(props) => (props.dimensions ? `${props.dimensions.icon.toString()}px` : `24.5px`)};
		width: ${(props) => (props.dimensions ? `${props.dimensions.icon.toString()}px` : `24.5px`)};
		color: ${(props) =>
			props.active
				? props.theme.colors.font.light1
				: props.disabled
				? props.theme.colors.button.alt1.disabled.color
				: props.theme.colors.button.alt1.color};
		fill: ${(props) =>
			props.active
				? props.theme.colors.font.light1
				: props.disabled
				? props.theme.colors.button.alt1.disabled.color
				: props.theme.colors.button.alt1.color};
	}

	box-shadow: ${(props) => props.theme.colors.shadow.primary} 0px 1px 2px 0.5px;

	&:hover {
		background: ${(props) =>
			props.disabled
				? props.theme.colors.button.alt1.disabled.background
				: props.theme.colors.button.alt1.active.background};
	}
`;
