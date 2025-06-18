import styled from 'styled-components';

import { STYLING } from 'helpers/config';
import { ViewLayoutType } from 'helpers/types';

export const Wrapper = styled.div`
	width: 100%;
`;

export const UsersHeaderDetails = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 12.5px 15px;
	border-radius: 0 !important;
	border-bottom: none !important;
	border-top-left-radius: ${STYLING.dimensions.radius.alt2} !important;
	border-top-right-radius: ${STYLING.dimensions.radius.alt2} !important;
	p {
		color: ${(props) => props.theme.colors.font.primary};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-size: ${(props) => props.theme.typography.size.base};
		font-weight: ${(props) => props.theme.typography.weight.bold};
	}
`;

export const PostsHeaderDetailsActions = styled.div`
	display: flex;
	align-items: center;
	gap: 10px;
`;

export const UsersWrapper = styled.div<{ type: ViewLayoutType }>`
	width: 100%;
	display: flex;
	flex-direction: column;

	background: ${(props) => props.theme.colors.container.primary.background};
	border: 1px solid ${(props) => props.theme.colors.border.primary};

	border-top-left-radius: ${(props) => (props.type === 'header' ? '0' : STYLING.dimensions.radius.alt2)};
	border-top-right-radius: ${(props) => (props.type === 'header' ? '0' : STYLING.dimensions.radius.alt2)};
	border-bottom-left-radius: ${STYLING.dimensions.radius.alt2};
	border-bottom-right-radius: ${STYLING.dimensions.radius.alt2};

	> * {
		&:not(:last-child) {
			border-bottom: 1px solid ${(props) => props.theme.colors.border.primary};
		}

		&:first-child {
			border-top-left-radius: ${STYLING.dimensions.radius.alt2};
			border-top-right-radius: ${STYLING.dimensions.radius.alt2};
		}

		&:last-child {
			border-bottom-left-radius: ${STYLING.dimensions.radius.alt2};
			border-bottom-right-radius: ${STYLING.dimensions.radius.alt2};
		}
	}
`;

export const UserWrapper = styled.div`
	padding: 15px;
`;

export const WrapperEmpty = styled.div<{ type: ViewLayoutType }>`
	width: 100%;
	padding: 12.5px 15px;
	background: ${(props) => props.theme.colors.container.primary.background};
	border: 1px solid ${(props) => props.theme.colors.border.primary};
	border-top-left-radius: ${(props) => (props.type === 'header' ? '0' : STYLING.dimensions.radius.alt2)};
	border-top-right-radius: ${(props) => (props.type === 'header' ? '0' : STYLING.dimensions.radius.alt2)};
	border-bottom-left-radius: ${STYLING.dimensions.radius.alt2};
	border-bottom-right-radius: ${STYLING.dimensions.radius.alt2};
	margin: ${(props) => (props.type === 'header' ? '0' : '20px 0 0 0')};

	p {
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xxSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
		text-transform: uppercase;
	}
`;

export const LoadingWrapper = styled(WrapperEmpty)``;
