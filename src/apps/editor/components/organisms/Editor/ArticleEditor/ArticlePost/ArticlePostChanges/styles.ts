import styled from 'styled-components';

export const Wrapper = styled.div`
	display: flex;
	align-items: center;
	gap: 7.5px;
`;

export const StatusIndicator = styled.div<{ hasChanges: boolean }>`
	width: 11.5px;
	height: 11.5px;
	border-radius: 50%;
	background: ${(props) => (props.hasChanges ? props.theme.colors.indicator.neutral : props.theme.colors.container.alt11.background)};
	border: 1px solid ${(props) => props.theme.colors.border.primary};
`;

export const StatusText = styled.span`
	font-size: ${(props) => props.theme.typography.size.xxxSmall};
	color: ${(props) => props.theme.colors.font.primary.alt2};
	font-weight: ${(props) => props.theme.typography.weight.medium};
	text-transform: uppercase;
`;
