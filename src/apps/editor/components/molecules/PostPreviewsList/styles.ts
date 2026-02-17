import styled from 'styled-components';

export const Wrapper = styled.div`
	width: 100%;
`;

export const Description = styled.p`
	color: ${(props) => props.theme.colors.font.alt1};
	font-size: ${(props) => props.theme.typography.size.xSmall};
	margin: 0 0 20px 0;
`;

export const TemplateGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
	gap: 20px;
`;

export const TemplateCard = styled.div`
	background: ${(props) => props.theme.colors.container.primary.background};
	border: 1px solid ${(props) => props.theme.colors.border.primary};
	border-radius: ${(props) => props.theme.borderRadius};
	padding: 15px;
	cursor: pointer;
	transition: all 0.15s ease;

	&:hover {
		border-color: ${(props) => props.theme.colors.border.alt2};
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}
`;

export const TemplateHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 12px;
`;

export const TemplateName = styled.h3`
	margin: 0;
	font-size: ${(props) => props.theme.typography.size.base};
	font-weight: ${(props) => props.theme.typography.weight.bold};
	color: ${(props) => props.theme.colors.font.primary};
`;

export const TemplatePreview = styled.div`
	background: ${(props) => props.theme.colors.container.alt1.background};
	border-radius: 4px;
	padding: 12px;
	margin-bottom: 12px;
	min-height: 80px;
`;
export const PreviewLayout = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
`;

export const PreviewTopLine = styled.div`
	height: 2px;
	width: 100%;
	background: ${(props) => props.theme.colors.border.primary};
	border-radius: 999px;
	opacity: 0.6;
`;

export const PreviewRow = styled.div`
	display: flex;
	gap: 10px;
`;

export const PreviewColumn = styled.div`
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 6px;
	min-width: 0;
`;

export const PreviewGroup = styled.div<{ $direction?: string }>`
	display: flex;
	flex-direction: ${(props) => (props.$direction === 'row' ? 'row' : 'column')};
	gap: 6px;
	align-items: ${(props) => (props.$direction === 'row' ? 'center' : 'stretch')};
`;

export const PreviewBlock = styled.div<{ $variant?: string }>`
	border-radius: 3px;
	background: ${(props) => props.theme.colors.border.primary};
	opacity: 0.9;
	width: 100%;

	${(props) =>
		props.$variant === 'title' &&
		`
		height: 12px;
		width: 70%;
	`}

	${(props) =>
		props.$variant === 'description' &&
		`
		height: 8px;
		width: 90%;
	`}

	${(props) =>
		props.$variant === 'meta' &&
		`
		height: 8px;
		width: 45%;
	`}

	${(props) =>
		props.$variant === 'thumbnail' &&
		`
		height: auto;
		width: 100%;
		aspect-ratio: 16 / 9;
	`}

	${(props) =>
		props.$variant === 'categories' &&
		`
		position: relative;
		height: 10px;
		width: 55%;
		border-radius: 999px;
		background: ${props.theme.colors.border.alt1};
	`}

	${(props) =>
		(props.$variant === 'line' || !props.$variant) &&
		`
		height: 8px;
		width: 60%;
	`}
`;

export const TemplateInfo = styled.div`
	display: flex;
	gap: 15px;
	font-size: ${(props) => props.theme.typography.size.xxSmall};
	color: ${(props) => props.theme.colors.font.alt1};

	span {
		display: flex;
		align-items: center;
	}
`;

export const CreateButton = styled.div`
	margin-bottom: 20px;
`;
