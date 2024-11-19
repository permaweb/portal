import styled from 'styled-components';

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
	padding: ${(props) => (props.type === 'header' ? '0 15px' : '15px 15px 0 15px')};
`;

export const CategoriesSection = styled(Section)<{ type: ViewLayoutType }>``;

export const TopicsSection = styled(Section)<{ type: ViewLayoutType }>`
	padding: ${(props) => (props.type === 'header' ? '0 15px 15px 15px' : '15px 15px 0 15px')};
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

export const CategoriesHeader = styled(SectionHeader)`
	margin: 0 0 10px 0;
`;

export const SectionBody = styled.div`
	margin: 15px 0 0 0;
`;

export const LinksSection = styled(SectionBody)`
	display: flex;
	flex-wrap: wrap;
	gap: 20px;
	padding: 0 0 10px 0;
`;

export const LinkTooltip = styled.div`
	position: absolute;
	z-index: 2;
	display: none;
	white-space: nowrap;

	top: 100%;
	left: 50%;
	transform: translateX(-50%);
	margin: 1.5px 0 0 0;

	span {
		font-size: 10px !important;
		display: block;
		line-height: 1.65;
		text-transform: uppercase;
	}
`;

export const LinkWrapper = styled.div`
	position: relative;

	&:hover {
		${LinkTooltip} {
			display: block;
		}
	}

	a,
	button {
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		transition: all 200ms;

		svg {
			height: 17.5px;
			width: 17.5px;
			color: ${(props) => props.theme.colors.font.alt1};
			fill: ${(props) => props.theme.colors.font.alt1};
		}

		&:hover {
			svg {
				color: ${(props) => props.theme.colors.font.alt5};
				fill: ${(props) => props.theme.colors.font.alt5};
			}
		}
		&:focus {
			svg {
				color: ${(props) => props.theme.colors.font.alt5};
				fill: ${(props) => props.theme.colors.font.alt5};
			}
		}
	}
`;

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
	padding: 0 0 15px 0;
`;

export const TopicsBodyWrapper = styled(BodyWrapper)`
	margin: 10px 0 0 0;
`;

export const BodyActionsWrapper = styled.div`
	width: fit-content;
	display: flex;
	gap: 12.5px;
	margin: 20px 0 0 auto;
`;

export const CategoryModalWrapper = styled.div`
	padding: 0 20px 5px 20px !important;
`;

export const TopicModalWrapper = styled.div`
	padding: 0 20px 5px 20px !important;
`;

export const CategoryActionsWrapper = styled(BodyActionsWrapper)`
	margin: -20px 0 0 auto;
`;

export const LoadingWrapper = styled(WrapperEmpty)``;
