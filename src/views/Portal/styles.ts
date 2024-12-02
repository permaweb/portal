import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Wrapper = styled.div`
	width: 100%;
	max-width: ${STYLING.cutoffs.max};
	margin: 0 auto;
`;

export const BodyWrapper = styled.div`
	width: 100%;
	display: flex;
	flex-wrap: wrap;
	gap: 25px;
`;

export const SectionWrapper = styled.div`
	width: calc(50% - 12.5px);
	display: flex;
	flex-direction: column;
	gap: 25px;

	@media (max-width: ${STYLING.cutoffs.tablet}) {
		width: 100%;
	}
`;

export const Section = styled.div`
	width: 100%;
`;

export const SectionHeader = styled.div`
	padding: 12.5px 15px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	p {
		color: ${(props) => props.theme.colors.font.primary};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-size: ${(props) => props.theme.typography.size.base};
		font-weight: ${(props) => props.theme.typography.weight.bold};
	}
`;

export const SectionBody = styled.div`
	width: 100%;
`;

export const DesignSection = styled(Section)`
	> :first-child {
		padding: 12.5px 15px 0 15px;
	}
`;

export const SetupSection = styled(Section)`
	> :first-child {
		padding: 12.5px 10px 0 15px;
	}
`;

export const PostsSection = styled(Section)`
	> :first-child {
		padding: 12.5px 10px 12.5px 15px;
		background: ${(props) => props.theme.colors.container.alt1.background};
		border-bottom: 1px solid ${(props) => props.theme.colors.border.primary};
		border-top-left-radius: 3.5px;
		border-top-right-radius: 3.5px;
	}
`;

export const DomainSection = styled(Section)`
	> :first-child {
		padding: 12.5px 15px 0 15px;
	}
`;

export const UsersSection = styled(Section)`
	> :first-child {
		padding: 12.5px 15px 0 15px;
	}
`;
