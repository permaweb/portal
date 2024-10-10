import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Wrapper = styled.div`
	width: 100%;
`;

export const HeaderWrapper = styled.div`
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: space-between;
	flex-wrap: wrap;
	gap: 10px;
`;

export const BodyWrapper = styled.div`
	width: 100%;
	max-width: 600px;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	margin: 20px auto 40px auto;

	a {
		height: 60px;
		display: flex;
		align-items: center;
		cursor: pointer;
		text-overflow: ellipsis;
		overflow: hidden;
		color: ${(props) => props.theme.colors.font.primary};
		font-size: ${(props) => props.theme.typography.size.base};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		font-family: ${(props) => props.theme.typography.family.primary};
		background: ${(props) => props.theme.colors.container.primary.background};
		border: 1px solid ${(props) => props.theme.colors.border.primary};
		border-radius: ${STYLING.dimensions.radius.alt2};
		transition: all 100ms;
		padding: 0 15px;
		svg {
			height: 20.5px;
			width: 20.5px;
			margin: 6.5px 14.5px 0 0;
			color: ${(props) => props.theme.colors.font.alt1};
			fill: ${(props) => props.theme.colors.font.alt1};
		}
		img {
			height: 22.5px;
			width: 22.5px;
			margin: 0 12.5px 0 0;
		}
		&:hover {
			background: ${(props) => props.theme.colors.button.primary.active.background};
			border: 1px solid ${(props) => props.theme.colors.button.primary.active.border};
		}
	}
`;

export const Description = styled.div`
	display: flex;
	flex-direction: column;
	gap: 10px;
	justify-content: center;
	align-items: center;

	p {
		color: ${(props) => props.theme.colors.font.primary};
		font-size: ${(props) => props.theme.typography.size.xLg};
		font-weight: ${(props) => props.theme.typography.weight.medium};
		font-family: ${(props) => props.theme.typography.family.alt1};
		text-align: center;
	}

	span {
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.base};
		font-weight: ${(props) => props.theme.typography.weight.medium};
		font-family: ${(props) => props.theme.typography.family.primary};
		text-align: center;
		display: block;
		max-width: 400px;
	}
`;

export const Icon = styled.div`
	height: 135px;
	width: 135px;
	display: flex;
	justify-content: center;
	align-items: center;
	background: ${(props) => props.theme.colors.container.alt1.background};
	border: 1px solid ${(props) => props.theme.colors.border.alt1};
	border-radius: 50%;
	margin: 0 0 10px 0;

	svg {
		height: 80px;
		width: 80px;
		margin: 7.5px 0 0 0;
		color: ${(props) => props.theme.colors.font.alt1};
		fill: ${(props) => props.theme.colors.font.alt1};
	}
`;

export const PostOptions = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 20px;
	margin: 40px 0 0 0;
`;
