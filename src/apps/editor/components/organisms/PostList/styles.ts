import styled from 'styled-components';

import { STYLING } from 'helpers/config';
import { ViewLayoutType } from 'helpers/types';

export const Wrapper = styled.div`
	width: 100%;
`;

export const PostsHeader = styled.div`
	display: flex;
	flex-direction: column;
	gap: 15px;
`;

export const PostsHeaderDetails = styled.div`
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: 15px;
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
	flex-wrap: wrap;
	gap: 10px;
`;

export const PostsHeaderFilterWrapper = styled.div`
	position: relative;
`;

export const PostsHeaderFilterDropdown = styled.div`
	max-height: 52.5vh;
	width: 325px;
	max-width: 75vw;
	padding: 15px;
	position: absolute;
	z-index: 2;
	top: 32.5px;
	right: 0;
`;

export const PostsActions = styled.div<{ dropdown: boolean }>`
	width: 100%;
	display: flex;
	flex-wrap: wrap;
	gap: ${(props) => (props.dropdown ? '30px' : '20px')};
	align-items: center;
	justify-content: space-between;
`;

export const PostsActionsSection = styled.div<{ dropdown: boolean }>`
	width: ${(props) => (props.dropdown ? '100%' : 'fit-content')};
`;

export const PostsActionsSectionHeader = styled.div`
	width: 100%;
	margin: 0 0 12.5px 0;
	padding: 0 0 7.5px 0;
	border-bottom: 1px solid ${(props) => props.theme.colors.border.primary};
	p {
		color: ${(props) => props.theme.colors.font.alt1} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
		font-size: ${(props) => props.theme.typography.size.xxSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		text-transform: uppercase !important;
		text-align: left !important;
	}
`;

export const PostsStatusFilterWrapper = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 15px;
	align-items: center;
`;

export const PostsActionsEnd = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 15px;
	align-items: center;
`;

export const PostsActionsRequestsWrapper = styled.div<{ type: ViewLayoutType }>`
	display: flex;
	position: relative;

	.notification {
		position: absolute;
		top: ${(props) => (props.type === 'detail' ? '-5px' : '-7.5px')};
		right: ${(props) => (props.type === 'detail' ? '0' : '-5px')};
	}
`;

export const PostsActionsRequests = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 15px;
`;

export const PostsActionsRequestsHeader = styled.div`
	display: grid;
	grid-template-columns: 1.5fr 1fr 1fr 0.5fr;
	align-items: center;
	padding: 0 0 7.5px 0;
	border-bottom: 1px solid ${(props) => props.theme.colors.border.primary};

	span {
		color: ${(props) => props.theme.colors.font.alt1};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-size: ${(props) => props.theme.typography.size.xxxSmall};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		text-transform: uppercase;
		text-align: left;
	}

	> * {
		&:last-child {
			text-align: right;
		}
		&:nth-child(3) {
			text-align: left;
		}
	}
`;

export const PostsActionsRequestsBody = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 15px;

	> * {
		border-bottom: 1px dotted ${(props) => props.theme.colors.border.primary};
		padding: 0 0 15px 0;
	}
`;

export const PostActionRequest = styled.div`
	display: flex;
	flex-direction: column;
	gap: 15px;
`;

export const PostActionRequestLine = styled.div`
	display: flex;
	justify-content: space-between;
	gap: 15px;

	p,
	span {
		max-width: 85%;
		color: ${(props) => props.theme.colors.font.alt1};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-size: ${(props) => props.theme.typography.size.xSmall};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		text-align: left;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	p {
		color: ${(props) => props.theme.colors.font.primary};
		font-size: ${(props) => props.theme.typography.size.small};
	}

	.user-line {
		width: fit-content;
	}

	button {
		span {
			max-width: none !important;
		}
	}
`;

export const PostsActionsRequestsInfo = styled.div`
	span {
		color: ${(props) => props.theme.colors.font.alt1};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-size: ${(props) => props.theme.typography.size.xxxSmall};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		text-transform: uppercase;
		text-align: left;
	}
`;

export const PostsWrapper = styled.div<{ type: ViewLayoutType }>`
	width: 100%;
	display: flex;
	flex-direction: column;

	background: ${(props) => props.theme.colors.container.primary.background};
	border: 1px solid ${(props) => props.theme.colors.border.primary};

	border-top-left-radius: ${(props) => (props.type === 'header' ? '0' : STYLING.dimensions.radius.alt2)};
	border-top-right-radius: ${(props) => (props.type === 'header' ? '0' : STYLING.dimensions.radius.alt2)};
	border-bottom-left-radius: ${STYLING.dimensions.radius.alt2};
	border-bottom-right-radius: ${STYLING.dimensions.radius.alt2};

	margin: ${(props) => (props.type === 'header' ? '0' : '20px 0 0 0')};
	overflow: hidden;

	> * {
		&:not(:last-child) {
			border-bottom: 1px solid ${(props) => props.theme.colors.border.primary};
		}
	}
`;

export const PostsFooter = styled.div``;

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

export const InfoWrapper = styled.div`
	max-width: 100%;
	margin: 5px 0 0 auto;
	padding: 3.5px 10px;
	display: flex;
	justify-content: center;
	span {
		display: block;
		max-width: 95%;
		overflow: hidden;
		text-overflow: ellipsis;
		font-size: ${(props) => props.theme.typography.size.xxSmall} !important;
	}
`;

export const ActionWrapper = styled.div`
	width: 100%;
	margin: 5px 0 0 0;
`;
