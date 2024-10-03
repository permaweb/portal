import styled from 'styled-components';

export const Wrapper = styled.div`
	height: 100vh;
	width: 100%;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	padding: 20px;
`;

export const HeaderWrapper = styled.div`
	max-width: 500px;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	gap: 7.5px;

	h4,
	p {
		text-align: center;
	}

	p {
		color: ${(props) => props.theme.colors.font.alt1};
	}
`;

export const BodyWrapper = styled.div`
	width: 100%;
	max-width: 750px;
	display: flex;
	flex-wrap: wrap;
	margin: 40px 0 0 0;

	> * {
		&:not(:last-child) {
			border-right: 1px solid ${(props) => props.theme.colors.border.alt1};
		}
	}
`;

export const Section = styled.div`
	min-height: 300px;
	width: 50%;
	display: flex;
	padding: 0 40px;
`;

export const ConnectionWrapper = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	justify-content: center;
	gap: 10px;

	p {
		color: ${(props) => props.theme.colors.font.alt1};
		font-weight: ${(props) => props.theme.typography.weight.bold};
	}
`;
