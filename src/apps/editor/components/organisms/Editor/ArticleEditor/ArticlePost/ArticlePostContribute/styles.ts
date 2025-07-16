import styled from 'styled-components';

export const Wrapper = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 10px;
	margin: 10px 0 0 0;

	span {
		max-width: 100%;
		color: ${(props) => props.theme.colors.font.primary};
		font-size: ${(props) => props.theme.typography.size.xxSmall};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		white-space: nowrap;
		overflow-x: hidden;
		text-overflow: ellipsis;
		display: block;
	}
`;

export const PortalLine = styled.div`
	width: 100%;
	display: flex;
	gap: 10px;
`;

export const Checkbox = styled.div`
	margin: 4.5px 0 0 0;
`;
