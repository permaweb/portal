import styled from 'styled-components';

export const Wrapper = styled.div`
	width: 100%;
	position: relative;
`;

export const HeaderWrapper = styled.div`
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 15px;

	p {
		color: ${(props) => props.theme.colors.font.primary} !important;
		font-size: ${(props) => props.theme.typography.size.xxSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
		text-align: center;
		text-transform: none !important;
		display: flex;
		align-items: center;
		gap: 3.5px;
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
	}

	span {
	}

	.post-url-info {
		color: ${(props) => props.theme.colors.font.alt2} !important;
		font-size: ${(props) => props.theme.typography.size.xxSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
		text-align: center;
		text-transform: none !important;
		white-space: nowrap;
	}

	> * {
		height: fit-content;
		width: fit-content;
	}
`;

export const Form = styled.form`
	width: 100%;
	position: absolute;
	top: 13.5px;
	left: 0;
	z-index: 2;
`;
