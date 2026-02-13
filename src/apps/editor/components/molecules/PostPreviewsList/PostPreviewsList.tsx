import React from 'react';
import { useNavigate } from 'react-router-dom';

import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
import { ICONS, POST_PREVIEWS, URLS } from 'helpers/config';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';

export default function PostPreviewsList() {
	const navigate = useNavigate();

	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const unauthorized = !portalProvider.permissions?.updatePortalMeta;

	const templates = React.useMemo(() => {
		const portalPreviews = portalProvider.current?.postPreviews || {};
		return {
			...POST_PREVIEWS,
			...portalPreviews,
		};
	}, [portalProvider.current?.postPreviews]);

	const handleEditTemplate = (templateId: string) => {
		navigate(URLS.portalPostPreviewEdit(portalProvider.current.id, templateId));
	};

	return (
		<S.Wrapper>
			<S.Description>
				{language?.postPreviewsDescription ||
					'Customize how posts appear in feeds. Edit existing templates or create new ones.'}
			</S.Description>
			<S.CreateButton>
				<Button
					type={'alt1'}
					label={language?.createTemplate || 'Create Template'}
					handlePress={() => navigate(URLS.portalPostPreviewCreate(portalProvider.current.id))}
					disabled={unauthorized || !portalProvider.current}
					icon={ICONS.add}
					iconLeftAlign
				/>
			</S.CreateButton>
			<S.TemplateGrid>
				{Object.entries(templates).map(([id, template]: [string, any]) => (
					<S.TemplateCard key={id} onClick={() => handleEditTemplate(id)}>
						<S.TemplateHeader>
							<S.TemplateName>{template.name || id}</S.TemplateName>
						</S.TemplateHeader>
						<S.TemplatePreview>
							<S.PreviewPlaceholder>
								<S.PlaceholderThumbnail $show={template.content?.some((c: any) => c.type === 'thumbnail')} />
								<S.PlaceholderContent>
									<S.PlaceholderTitle />
									<S.PlaceholderMeta />
									<S.PlaceholderDescription />
								</S.PlaceholderContent>
							</S.PreviewPlaceholder>
						</S.TemplatePreview>
						<S.TemplateInfo>
							<span>Layout: {template.layout?.direction || 'row'}</span>
							<span>Elements: {template.content?.length || 0}</span>
						</S.TemplateInfo>
					</S.TemplateCard>
				))}
			</S.TemplateGrid>
		</S.Wrapper>
	);
}
