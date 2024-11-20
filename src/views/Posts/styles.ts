import styled from 'styled-components';

export const Wrapper = styled.div`
	width: 100%;
`;

export const BodyWrapper = styled.div`
	width: 100%;
	display: flex;
	flex-wrap: wrap;
	gap: 25px;
	border: 1px solid ${(props) => props.theme.colors.border.primary} !important;
`;

export const TopicsBodyWrapper = styled.div`
	display: flex;
	flex-direction: column;
	padding: 0 0 15px 0;
	margin: 10px 0 0 0;
`;

export const BodyActionsWrapper = styled.div`
	width: fit-content;
	display: flex;
	gap: 12.5px;
	margin: 20px 0 0 auto;
`;

export const TopicModalWrapper = styled.div`
	padding: 0 20px 5px 20px !important;
`;

export const CategoryActionsWrapper = styled(BodyActionsWrapper)`
	margin: -20px 0 0 auto;
`;
