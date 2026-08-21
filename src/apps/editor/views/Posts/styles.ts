import styled from 'styled-components';

export const Wrapper = styled.div`
	width: 100%;

	.reorder-posts-button svg {
		fill: none !important;
	}

	.reorder-posts-button svg circle {
		fill: currentColor !important;
	}
`;

export const BodyWrapper = styled.div`
	width: 100%;
	display: flex;
	flex-wrap: wrap;
	gap: 25px;
`;

export const TopicModalWrapper = styled.div`
	padding: 0 20px 15px 20px !important;
`;
