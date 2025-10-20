import styled from 'styled-components';

export const Wrapper = styled.div``;

export const CategoryWrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 15px;
`;

export const CategoryHeader = styled.div`
	width: 100%;
	border-top: 2px solid ${(props) => props.theme.colors.container.primary.active};

	p {
		display: block;
		width: fit-content;
		padding: 3.5px 11.5px;
		background: ${(props) => props.theme.colors.container.primary.active};
		color: ${(props) => props.theme.colors.font.primary} !important;
		font-size: ${(props) => props.theme.typography.size.xxxxSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
	}
`;

export const CategoryBody = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 20px;
`;

export const PostWrapper = styled.div`
	width: 100%;
	display: flex;
	justify-content: space-between;
	gap: 25px;
`;

export const PostInfo = styled.div`
	display: flex;
	flex: 1;
	flex-direction: column;
	gap: 10px;

	p {
		color: ${(props) => props.theme.colors.font.primary} !important;
		font-size: ${(props) => props.theme.typography.size.small} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
	}

	span {
		color: ${(props) => props.theme.colors.font.alt2} !important;
		font-size: ${(props) => props.theme.typography.size.xxxSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
	}
`;

export const PostImage = styled.div`
	display: flex;
	flex: 1;

	img {
		width: 100%;
		object-fit: cover;
	}
`;
