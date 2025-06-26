import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Wrapper = styled.div`
	/* width: 100%;
	max-width: 1000px; */
	display: flex;
	flex-direction: column;
	gap: 20px;

	> * {
		&:not(:last-child) {
			border-bottom: 1px solid ${(props) => props.theme.colors.border.alt4};
		}
	}
`;

export const PostWrapper = styled.div`
	width: 100%;
	max-width: 1065px;
	display: flex;
	gap: 40px;
	padding: 0 0 20px 0;
`;

export const PostInfoWrapper = styled.div`
	height: 100%;
	max-width: 300px;
	display: flex;
	flex-direction: column;
	gap: 15px;

	h4 {
		font-size: ${(props) => props.theme.typography.size.xxLg};

		&:hover {
			color: ${(props) => props.theme.colors.font.alt1};
		}
	}

	p {
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xSmall};
		font-weight: ${(props) => props.theme.typography.weight.medium};
		line-height: 1.5;
	
	}
`;

export const PostImageWrapper = styled.div`
	height: 450px;
    width: calc(100% - 340px);

	a {
		height: 100%;
		width: 100%;
		display: block;
	}

	img {
		height: 100%;
		width: 100%;
		background: red;
		object-fit: contain;
		border-radius: ${STYLING.dimensions.radius.alt1};
	}
`;