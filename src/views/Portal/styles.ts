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
	display: flex;
	flex-wrap: wrap;
	gap: 25px;
	margin: 20px 0 0 0;
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
	height: 300px;
	width: 100%;
	overflow: hidden;
`;

export const SectionHeader = styled.div`
	padding: 12.5px 15.5px;
	p {
		color: ${(props) => props.theme.colors.font.alt1};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-size: ${(props) => props.theme.typography.size.base};
		font-weight: ${(props) => props.theme.typography.weight.bold};
	}
`;

export const SectionBody = styled.div`
	width: 100%;
`;

export const DesignSection = styled(Section)``;

export const PostsSection = styled(Section)`
	height: fit-content;

	> :first-child {
		background: ${(props) => props.theme.colors.container.alt1.background};
	}
`;

export const DomainSection = styled(Section)`
	height: 100px;
`;

export const UsersSection = styled(Section)`
	height: 200px;
`;
