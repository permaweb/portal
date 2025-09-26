import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const DomainWrapper = styled.div`
	position: relative;
`;

export const DomainContent = styled.div<{ isOpen: boolean }>`
	width: 100%;
	display: flex;
	padding: 15px;
	justify-content: space-between;
	align-items: center;
	flex-wrap: wrap;
	gap: 20px;
	background: ${(props) =>
		props.isOpen
			? props.theme.colors.button.primary.active.background
			: props.theme.colors.container.primary.background};
	cursor: pointer;
	transition: all 100ms;
	position: relative;

	&:hover {
		background: ${(props) => props.theme.colors.button.primary.active.background};
	}

	@media (max-width: ${STYLING.cutoffs.secondary}) {
		flex-direction: column;
		align-items: flex-start;
	}
`;

export const Wrapper = styled.div<{ type: 'header' | 'detail' }>`
	width: 100%;
	display: flex;
	flex-direction: column;

	> * {
		&:not(:last-child) {
			border-bottom: 1px solid ${(props) => props.theme.colors.border.primary};
		}
	}

	> :first-child ${DomainContent} {
		border-top-right-radius: ${(props) => (props.type === 'detail' ? STYLING.dimensions.radius.alt1 : '0')};
		border-top-left-radius: ${(props) => (props.type === 'detail' ? STYLING.dimensions.radius.alt1 : '0')};
	}

	> :last-child ${DomainContent} {
		border-bottom-right-radius: ${STYLING.dimensions.radius.alt1};
		border-bottom-left-radius: ${STYLING.dimensions.radius.alt1};
	}
`;

export const DomainHeader = styled.div`
	max-width: 60%;
	flex: 1;

	a {
		display: flex;
		align-items: center;
		gap: 5px;

		&:hover {
			svg {
				color: ${(props) => props.theme.colors.font.alt1};
				fill: ${(props) => props.theme.colors.font.alt1};
			}
			p {
				color: ${(props) => props.theme.colors.font.alt1};
			}
		}

		svg {
			color: ${(props) => props.theme.colors.font.primary};
			fill: ${(props) => props.theme.colors.font.primary};
		}
	}

	h4 {
		color: ${(props) => props.theme.colors.font.primary};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-size: ${(props) => props.theme.typography.size.small};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		margin: 0;
		line-height: 1; /* tighten to keep single line */
		display: inline-flex;
		align-items: center;
	}

	p {
		color: ${(props) => props.theme.colors.font.alt1};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-size: ${(props) => props.theme.typography.size.xxSmall};
		font-weight: ${(props) => props.theme.typography.weight.medium};
		margin: 2px 0;
		overflow-x: hidden;
		text-overflow: ellipsis;
	}

	@media (max-width: ${STYLING.cutoffs.secondary}) {
		max-width: 100%;
	}
`;

export const DomainHeaderContent = styled.div`
	display: flex;
	align-items: center;
	gap: 12.5px;
`;

export const DomainArrow = styled.div<{ isOpen: boolean }>`
	svg {
		height: 15px;
		width: 15px;
		margin: 5px 0 0 0;
		color: ${(props) => props.theme.colors.font.primary};
		fill: ${(props) => props.theme.colors.font.primary};
		transform: rotate(${(props) => (props.isOpen ? '0' : '270deg')});
	}
`;

export const DomainName = styled.h4``;

export const DomainDetail = styled.div`
	display: flex;
	align-items: center;
	gap: 12.5px;

	@media (max-width: ${STYLING.cutoffs.secondary}) {
		align-items: flex-start;
	}
`;

export const DomainBadge = styled.div`
	display: inline-flex;
	align-items: center;
	gap: 6px;
	height: 23.5px;
	padding: 2px 8px;
	border-radius: 16px;
	font-size: ${(props) => props.theme.typography.size.xxxSmall};
	font-weight: ${(props) => props.theme.typography.weight.bold};
	color: ${(props) => props.theme.colors.font.light1};
	background: ${(props) => props.theme.colors.roles.alt3};
`;

export const DomainActions = styled.div`
	display: flex;
	align-items: center;
	gap: 15px;
	flex-wrap: wrap;
	position: relative;
`;

export const DomainActionsDropdown = styled.div`
	width: 250px;
	position: absolute;
	z-index: 1;
	top: 47.5px;
	right: 10px;
	padding: 7.5px;

	button {
		height: 40px;
		width: 100%;
		display: flex;
		align-items: center;
		gap: 12.5px;
		cursor: pointer;
		background: transparent;
		border-radius: ${STYLING.dimensions.radius.alt4};
		transition: all 100ms;
		padding: 0 10px;
		p {
			color: ${(props) => props.theme.colors.font.primary} !important;
			font-size: ${(props) => props.theme.typography.size.xSmall} !important;
			font-weight: ${(props) => props.theme.typography.weight.bold} !important;
			font-family: ${(props) => props.theme.typography.family.primary} !important;
			display: block;
			white-space: nowrap;
			text-overflow: ellipsis;
			max-width: 85%;
			overflow: hidden;
		}
		svg {
			height: 17.5px;
			width: 17.5px;
			margin: 2.5px 0 0 0;
			color: ${(props) => props.theme.colors.font.alt1};
			fill: ${(props) => props.theme.colors.font.alt1};
		}
		img {
			height: 22.5px;
			width: 22.5px;
			margin: 0 12.5px 0 0;
		}
		&:hover {
			background: ${(props) => props.theme.colors.container.primary.active};
		}
	}
`;

export const LoadingWrapper = styled.div`
	width: 100%;
	padding: 15px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 10px;

	p {
		color: ${(props) => props.theme.colors.font.alt1};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-size: ${(props) => props.theme.typography.size.xSmall};
		font-weight: ${(props) => props.theme.typography.weight.medium};
	}
`;

export const WrapperEmpty = styled(LoadingWrapper)``;
