import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Wrapper = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;

	> * {
		&:not(:last-child) {
			border-bottom: 1px solid ${(props) => props.theme.colors.border.primary};
		}
	}
`;

export const LoadingBanner = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 15px;
    color: ${(props) => props.theme.colors.font.alt1};
    font-family: ${(props) => props.theme.typography.family.primary};
    font-size: ${(props) => props.theme.typography.size.xxSmall};
    opacity: 0.95;
    border-bottom: 1px solid ${(props) => props.theme.colors.border.primary};

    .label {
        color: ${(props) => props.theme.colors.font.primary};
        font-weight: ${(props) => props.theme.typography.weight.bold};
        font-size: ${(props) => props.theme.typography.size.small};
        margin-right: 4px;
        white-space: nowrap;
    }

    .chips {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px;
    }

    .chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        height: 22px;
        padding: 2px 8px;
        border: 1px solid ${(props) => props.theme.colors.border.primary};
        border-radius: 16px;
        color: ${(props) => props.theme.colors.font.primary};
        background: rgba(255, 255, 255, 0.04);
    }
`;

export const DomainWrapper = styled.div`
	display: flex;
	padding: 12.5px 15px;
	justify-content: space-between;
	align-items: center;
	flex-wrap: wrap;
	gap: 20px;

	.validating-dot {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: ${(props) => props.theme.typography.size.xxSmall};
		opacity: 0.8;
	}

	@media (max-width: ${STYLING.cutoffs.secondary}) {
		flex-direction: column;
		align-items: flex-start;
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

	/* Improve expand button alignment and size */
	.expand-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 16px;
		height: 16px;
		padding: 0;
		border: none;
		border-radius: 3px;
		background: transparent;
		transition: background 120ms ease-in-out, opacity 120ms ease-in-out;
		vertical-align: middle;
		margin-left: 6px; /* bring closer but avoid touching text */
		position: relative;
		top: -1px; /* slight nudge to center with text baseline */
		opacity: 0.95;

		&.is-open {
			transform: rotate(180deg);
		}
	}
    .expand-btn:hover { background: rgba(255, 255, 255, 0.06); opacity: 1; }
	.expand-btn img,
	.expand-btn svg {
		width: 14px;
		height: 14px;
        margin: 0;
        padding: 0;
        display: block;
    }

	@media (max-width: ${STYLING.cutoffs.secondary}) {
		max-width: 100%;
	}
`;

export const DomainDetail = styled.div`
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	gap: 12.5px;

	@media (max-width: ${STYLING.cutoffs.secondary}) {
		align-items: flex-start;
	}
`;

export const DomainActions = styled.div`
	display: flex;
	gap: 12.5px;
`;

export const WrapperEmpty = styled.div`
	padding: 12.5px 15px;

	p {
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xxSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
		text-transform: uppercase;
	}
`;

export const LoadingWrapper = styled(WrapperEmpty)`
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 10px;
	padding: 40px 15px;
`;

export const SectionHeader = styled.div`
	padding: 20px 15px 15px 15px;
	border-bottom: 2px solid ${(props) => props.theme.colors.border.primary};
	margin-bottom: 0;

	h3 {
		color: ${(props) => props.theme.colors.font.primary};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-size: ${(props) => props.theme.typography.size.base};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		margin: 0 0 5px 0;
	}

	p {
		color: ${(props) => props.theme.colors.font.alt1};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-size: ${(props) => props.theme.typography.size.xxSmall};
		font-weight: ${(props) => props.theme.typography.weight.medium};
		margin: 0;
		text-transform: none;
	}
    .inline-progress {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        margin-left: 8px;
        opacity: 0.8;
        font-size: ${(props) => props.theme.typography.size.xxSmall};
    }
`;

export const StatusBadge = styled.span`
	display: inline-block;
	padding: 4px 8px;
	border-radius: 4px;
	font-size: ${(props) => props.theme.typography.size.xxSmall};
	font-weight: ${(props) => props.theme.typography.weight.bold};
	font-family: ${(props) => props.theme.typography.family.primary};
	text-transform: uppercase;
	margin-top: 5px;

	&.redirected {
		background-color: #22c55e20;
		color: #22c55e;
		border: 1px solid #22c55e;
	}

	&.other-target {
		background-color: #3b82f620;
		color: #3b82f6;
		border: 1px solid #3b82f6;
	}
`;

export const DomainDetails = styled.div`
	margin-top: 12px;
	padding: 12px;
	background-color: rgba(255, 255, 255, 0.05);
	border-radius: 6px;
	border: 1px solid rgba(255, 255, 255, 0.1);
	/* Ensure details appear on their own row under the name */
	flex-basis: 100%;
	order: 2;

	.details-grid {
		display: grid;
		grid-template-columns: 120px 1fr;
		row-gap: 8px;
		column-gap: 16px;

		.label {
			opacity: 0.7;
			font-size: 13px;
			font-weight: 500;
			color: ${(props) => props.theme.colors.font.alt1};
		}

		.value {
			font-size: 13px;
			color: ${(props) => props.theme.colors.font.primary};
		}

		.code {
			font-family: 'Courier New', monospace;
			font-size: 11px;
			padding: 2px 6px;
			background-color: rgba(255, 255, 255, 0.1);
			border-radius: 3px;
			word-break: break-all;
			user-select: all;
		}

		.badge {
			padding: 2px 8px;
			border-radius: 12px;
			font-size: 11px;
			font-weight: 600;
			text-transform: uppercase;
			
			&.permanent {
				background-color: rgba(34, 197, 94, 0.2);
				color: #22c55e;
			}
			
			&.lease {
				background-color: rgba(59, 130, 246, 0.2);
				color: #3b82f6;
			}
		}
	}
`;
