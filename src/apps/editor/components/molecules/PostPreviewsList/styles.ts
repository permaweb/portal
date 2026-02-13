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

export const PreviewPlaceholder = styled.div`
	display: flex;
	gap: 10px;
`;

export const PlaceholderThumbnail = styled.div<{ $show?: boolean }>`
	width: 60px;
	height: 45px;
	background: ${(props) => props.theme.colors.border.primary};
	border-radius: 4px;
	flex-shrink: 0;
	display: ${(props) => (props.$show ? 'block' : 'none')};
`;

export const PlaceholderContent = styled.div`
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 6px;
`;

export const PlaceholderTitle = styled.div`
	width: 70%;
	height: 12px;
	background: ${(props) => props.theme.colors.border.primary};
	border-radius: 2px;
`;

export const PlaceholderMeta = styled.div`
	width: 40%;
	height: 8px;
	background: ${(props) => props.theme.colors.border.alt1};
	border-radius: 2px;
`;

export const PlaceholderDescription = styled.div`
	width: 90%;
	height: 8px;
	background: ${(props) => props.theme.colors.border.alt1};
	border-radius: 2px;
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
