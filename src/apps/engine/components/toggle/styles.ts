import styled from 'styled-components';

export const Marker = styled.div<{ $state: boolean }>`
	background-color: rgba(var(--color-text), 1);
	width: 20px;
	height: 20px;
	border-radius: 50%;
	transition: margin-left 0.4s;
	margin-left: ${(props) => (props.$state ? '24px' : 0)};
`;

export const Icon = styled.div<{ $state: boolean }>`
	position: absolute;
	width: 14px;
	top: 6px;

	svg {
		transition: fill 0.4s, stroke 0.4s;
	}

	&:nth-of-type(1) {
		left: 6px;
		svg {
			color: white;
		}
	}
	&:nth-of-type(2) {
		right: 6px;
		svg {
			color: black;
		}
	}
`;

export const Toggle = styled.div<{ $state: boolean }>`
	position: relative;
	margin-left: auto;
	padding: 3px;
	width: 44px;
	height: 20px;
	border-radius: 16px;
	background: rgba(var(--color-background), 1);
	filter: invert(1);

	&:hover {
		cursor: pointer;
	}
`;
