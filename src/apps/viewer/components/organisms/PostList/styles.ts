import styled from 'styled-components';

export const Wrapper = styled.div`
	width: 100%;
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
	display: flex;
	gap: 40px;
	justify-content: space-between;
	padding: 0 0 20px 0;
`;

export const PostInfoWrapper = styled.div<{ hasImage: boolean }>`
	height: 100%;
	width: ${(props) => (props.hasImage ? '300px' : '100%')};
	display: flex;
	flex-direction: column;
	gap: 15px;

	a {
		width: fit-content;
	}

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
	width: calc(100% - 360px);
	max-width: 700px;

	display: flex;
	align-items: flex-start;
	justify-content: center;

	img {
		width: auto;
		height: auto;
		max-width: 100%;
		max-height: 100%;

		object-fit: contain;
		object-position: center center;
	}
`;
