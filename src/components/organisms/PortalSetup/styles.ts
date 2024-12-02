import styled from 'styled-components';

import { open, transition1 } from 'helpers/animations';
import { STYLING } from 'helpers/config';
import { ViewLayoutType } from 'helpers/types';

export const Wrapper = styled.div<{ type: ViewLayoutType }>`
	width: 100%;
	display: flex;
	flex-direction: ${(props) => (props.type === 'header' ? 'column' : 'row')};
	flex-wrap: wrap;
	gap: ${(props) => (props.type === 'header' ? '0' : '25px')};

	@media (max-width: ${STYLING.cutoffs.initial}) {
		flex-direction: column;
	}
`;

export const SectionWrapper = styled.div<{ type: ViewLayoutType }>`
	height: fit-content;
	width: ${(props) => (props.type === 'header' ? '100%' : 'calc(50% - 12.5px)')};
	display: flex;
	flex-direction: column;
	gap: ${(props) => (props.type === 'header' ? '0' : '25px')};

	@media (max-width: ${STYLING.cutoffs.initial}) {
		width: 100%;
	}
`;

export const Section = styled.div<{ type: ViewLayoutType }>`
	padding: 15px 15px 0 15px;
`;

export const CategoriesSection = styled(Section)<{ type: ViewLayoutType }>`
	padding: ${(props) => (props.type === 'header' ? '15px 15px 0 15px' : '15px 15px 12.5px 15px')};
`;

export const TopicsSection = styled(Section)<{ type: ViewLayoutType }>`
	padding: 15px;
`;

export const LinksSection = styled(Section)<{ type: ViewLayoutType }>`
	padding: ${(props) => (props.type === 'header' ? '15px 15px 0 15px' : '15px')};
`;

export const SectionHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	p {
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
		text-transform: uppercase;
	}
`;

export const CategoriesHeader = styled(SectionHeader)``;

export const LinksHeader = styled(SectionHeader)<{ type: ViewLayoutType }>``;

export const TopicList = styled.div`
	display: flex;
	flex-direction: column;
	gap: 12.5px;
	padding: 0 0 15px 0;
`;

export const TopicWrapper = styled.div`
	display: flex;
	align-items: center;
	gap: 12.5px;

	p {
		color: ${(props) => props.theme.colors.font.primary};
		font-size: ${(props) => props.theme.typography.size.xSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
		text-transform: uppercase;
	}
`;

export const WrapperEmpty = styled.div`
	padding: 0 0 15px 0;
	p {
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xxxSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
		text-transform: uppercase;
	}
`;

export const BodyWrapper = styled.div`
	display: flex;
	flex-direction: column;
	animation: ${open} ${transition1};
`;

export const TopicsBodyWrapper = styled(BodyWrapper)``;

export const LinksBodyWrapper = styled(BodyWrapper)`
	margin: 20px 0 0 0;
`;

export const MediaBodyWrapper = styled.div`
	margin: 15px 0 0 0;
	> :first-child {
		padding: 0 0 15px 0 !important;
	}
`;

export const BodyActionsWrapper = styled.div`
	width: fit-content;
	display: flex;
	gap: 12.5px;
	margin: 20px 0 0 auto;
`;

export const Divider = styled.div`
	height: 1px;
	width: calc(100% - 30px);
	border-top: 1px solid ${(props) => props.theme.colors.border.primary};
	margin: 15px auto 0 auto;
`;

export const LoadingWrapper = styled(WrapperEmpty)``;
