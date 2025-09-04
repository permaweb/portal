import styled from 'styled-components';

export const WalletListContainer = styled.div`
	height: 100%;
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 20px;
	flex-wrap: wrap;
	padding: 20px 0 5px 0;
`;

export const WalletListItem = styled.button`
	width: 200px;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	text-align: center;
	padding: 15px;
	img {
		width: 30px;
		border-radius: 50%;
		margin: 0 0 10px 0;
	}
`;

export const WalletLink = styled.div`
	margin: 5px 0 20px 0;
	padding: 0 20px;
	text-align: center;
`;

export const ErrorBoundaryContainer = styled.div`
	width: fit-content;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 20px;
	margin: 20px auto;

	h4 {
		text-align: center;
		line-height: 1.5;
		margin: 0;
	}
`;
