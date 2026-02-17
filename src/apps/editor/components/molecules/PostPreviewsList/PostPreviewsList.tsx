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
		const portalPreviews = portalProvider.current?.layout?.postPreviews || portalProvider.current?.postPreviews || {};
		return {
			...POST_PREVIEWS,
			...portalPreviews,
		};
	}, [portalProvider.current?.layout?.postPreviews, portalProvider.current?.postPreviews]);

	const handleEditTemplate = (templateId: string) => {
		navigate(URLS.portalPostPreviewEdit(portalProvider.current.id, templateId));
	};

	const normalizeChildBlocks = (block: any) => {
		const children = block?.children || block?.content || [];
		return children.map((child: any) => (typeof child === 'string' ? { type: child } : child));
	};

	const getPreviewRows = (template: any) => {
		if (Array.isArray(template?.rows) && template.rows.length > 0) return template.rows;
		if (Array.isArray(template?.content) && template.content.length > 0) {
			return [
				{
					id: 'row-preview',
					columns: [
						{
							id: 'col-preview',
							blocks: template.content,
						},
					],
				},
			];
		}
		return [];
	};

	const renderPreviewBlock = (block: any, key: string | number) => {
		if (!block) return null;
		const showTopLine = block.type === 'categories' && block.layout?.topLine;
		if (block.type === 'body' || block.type === 'meta') {
			const direction = block.layout?.direction || (block.type === 'meta' ? 'row' : 'column');
			const children = normalizeChildBlocks(block);
			return (
				<S.PreviewGroup key={key} $direction={direction}>
					{children.map((child: any, idx: number) => renderPreviewBlock(child, `${key}-${idx}`))}
				</S.PreviewGroup>
			);
		}

		const variant =
			block.type === 'title'
				? 'title'
				: block.type === 'description'
				? 'description'
				: block.type === 'thumbnail'
				? 'thumbnail'
				: block.type === 'author' || block.type === 'date'
				? 'meta'
				: block.type === 'categories'
				? 'categories'
				: block.type === 'tags' || block.type === 'comments'
				? 'meta'
				: 'line';

		const normalizedAspect =
			typeof block.layout?.aspectRatio === 'string' ? block.layout.aspectRatio.replace(/\s*\/\s*/g, ' / ') : undefined;

		return (
			<React.Fragment key={key}>
				{showTopLine && <S.PreviewTopLine />}
				<S.PreviewBlock
					$variant={variant}
					style={variant === 'thumbnail' && normalizedAspect ? { aspectRatio: normalizedAspect } : undefined}
				/>
			</React.Fragment>
		);
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
							<S.PreviewLayout>
								{getPreviewRows(template).map((row: any, rowIndex: number) => (
									<S.PreviewRow key={row.id || rowIndex}>
										{(row.columns || []).map((col: any, colIndex: number) => (
											<S.PreviewColumn key={col.id || colIndex}>
												{(col.blocks || []).map((block: any, blockIndex: number) =>
													renderPreviewBlock(block, `${rowIndex}-${colIndex}-${blockIndex}`)
												)}
											</S.PreviewColumn>
										))}
									</S.PreviewRow>
								))}
							</S.PreviewLayout>
						</S.TemplatePreview>
					</S.TemplateCard>
				))}
			</S.TemplateGrid>
		</S.Wrapper>
	);
}
