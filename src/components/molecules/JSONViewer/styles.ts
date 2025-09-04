import styled from 'styled-components';

export const Wrapper = styled.div<{ maxHeight?: number; noWrapper?: boolean }>`
	max-height: ${(props) => (props.maxHeight ? `${props.maxHeight.toString()}px` : 'none')};
	padding: ${(props) => (props.noWrapper ? '0' : '10px 15px 15px 15px')};
	font-family: ${(props) => props.theme.typography.family.alt2};
	font-weight: ${(props) => props.theme.typography.weight.bold};
	font-size: ${(props) => props.theme.typography.size.xxSmall};
	letter-spacing: 0;
	position: relative;

	ul {
		margin: 0 0 0 1.5px !important;
	}
`;

export const JSONWrapper = styled.div`
	height: 100%;
`;

export const Header = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	flex-wrap: wrap;
	gap: 15px;
	margin: 0 0 2.5px 0;
	p {
		color: ${(props) => props.theme.colors.font.primary};
		font-family: ${(props) => props.theme.typography.family.alt1};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		font-size: ${(props) => props.theme.typography.size.lg};
	}
`;

export const Placeholder = styled.div`
	margin: 10px 0 0 0;
	p {
		color: ${(props) => props.theme.colors.font.alt1};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		font-size: ${(props) => props.theme.typography.size.xSmall};
	}
`;

export const ActionsWrapper = styled.div`
	width: fit-content;
	display: flex;
	gap: 15px;

	button {
		padding: 3.5px 0 0 0 !important;
	}
`;
