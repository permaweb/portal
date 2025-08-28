import { fadeIn2, open } from 'constants/animations';
import styled from 'styled-components';

export const Wrapper = styled.div`
	width: 500px;
	max-width: 95vw;
	display: flex;
	flex-direction: column;
	align-items: center;
	margin: 0 auto;
	padding: 20px 20px;
	animation: ${open} ${fadeIn2};
	p {
		text-align: center;
	}
	button {
		margin: 25px 0 0 0;
	}
`;

export const Icon = styled.div`
	height: 125px;
	width: 125px;
	display: flex;
	justify-content: center;
	align-items: center;
	border-radius: 50%;
	margin: 0 0 20px 0;
	svg {
		height: 75px;
		width: 75px;
		margin: 3.5px 0 0 0;
	}
`;

export const WCWrapper = styled.div`
	height: auto;
`;
