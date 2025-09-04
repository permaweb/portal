import styled from 'styled-components';

export const Wrapper = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 60px;
	padding: 20px 0 0 0;
`;

export const HeaderWrapper = styled.div`
	width: 100%;
	display: flex;
	gap: 40px;
`;

export const HeaderAvatarWrapper = styled.div``;

export const HeaderInfoWrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 10px;
	padding: 10px 0 0 0;

	p {
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.base};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		line-height: 1.5;
		display: block;
		max-width: 450px;
	}
`;

export const BodyWrapper = styled.div`
	width: 100%;
`;
