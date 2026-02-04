import styled from 'styled-components';

export const Overlay = styled.div`
	position: fixed;
	inset: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 9999;
`;

export const Modal = styled.div`
	position: relative;
	width: 420px;
	max-width: 90%;
	padding: 22px 24px 28px;
	border-radius: var(--border-radius);
	background: var(--color-card-background);
	border: 1px solid var(--color-card-border);
	box-shadow: var(--preference-card-shadow);
	color: rgba(var(--color-text), 1);
	font-family: var(--font-body);
`;

export const CloseButton = styled.button`
	position: absolute;
	top: 14px;
	right: 14px;
	width: 22px;
	height: 22px;
	border-radius: 50%;
	border: 1px solid var(--color-card-border);
	background: var(--color-card-background);
	color: rgba(var(--color-text), 1);
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 14px;
	line-height: 14px;
	padding: 0;
	transition: background 120ms;

	&:hover {
		background: rgba(var(--color-text), 0.1);
	}
`;

export const Header = styled.div`
	h3 {
		margin: 0;
		font-size: 17px;
		font-weight: 600;
	}

	p {
		margin: 6px 0 0;
		font-size: 13px;
		color: rgba(var(--color-text-secondary), 1);
	}
	margin-bottom: 22px;
`;

export const SectionLabel = styled.div`
	font-size: 14px;
	font-weight: 600;
	margin-bottom: 10px;
`;

export const PresetRow = styled.div`
	display: flex;
	gap: 8px;
	flex-wrap: wrap;
	margin-bottom: 12px;
`;

export const PresetButton = styled.button<{ $active?: boolean }>`
	padding: 6px 12px;
	font-size: 13px;
	border-radius: var(--border-radius);
	border: 1px solid ${(p) => (p.$active ? 'rgba(var(--color-primary), 1)' : 'var(--color-card-border)')};
	background: ${(p) => (p.$active ? 'rgba(var(--color-primary), 1)' : 'var(--color-card-background)')};
	color: ${(p) => (p.$active ? 'rgba(var(--color-primary-contrast), 1)' : 'rgba(var(--color-text), 1)')};
	cursor: pointer;
	transition: all 120ms;

	&:hover {
		background: ${(p) => (p.$active ? 'rgba(var(--color-primary), 1)' : 'rgba(var(--color-text), 0.1)')};
	}
`;

export const InputWrapper = styled.div`
	margin-bottom: 16px;

	input {
		width: 80%;
		padding: 10px 12px;
		border-radius: var(--border-radius);
		border: 1px solid var(--color-card-border);
		background: var(--color-card-background);
		color: rgba(var(--color-text), 1);
		font-size: 14px;

		&::placeholder {
			color: rgba(var(--color-text), 0.6);
		}

		&:focus {
			outline: none;
			border-color: rgba(var(--color-primary), 1);
		}
	}
`;

export const Actions = styled.div`
	display: flex;
	justify-content: flex-end;
	gap: 8px;
	margin-top: 12px;
`;
