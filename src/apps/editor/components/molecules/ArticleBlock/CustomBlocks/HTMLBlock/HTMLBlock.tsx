import React from 'react';
import parse from 'html-react-parser';

import { Button } from 'components/atoms/Button';
import { Panel } from 'components/atoms/Panel';
import { CodeEditor } from 'components/molecules/CodeEditor';
import { cleanHTMLContent, isValidHTML } from 'helpers/utils';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';

class HTMLPreviewErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
	constructor(props: { children: React.ReactNode }) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError() {
		return { hasError: true };
	}

	componentDidCatch(error: Error) {
		console.error('HTML Preview Error:', error);
	}

	render() {
		if (this.state.hasError) {
			return (
				<S.PreviewPlaceholder className={'border-wrapper-alt3'}>
					<span>Invalid HTML</span>
				</S.PreviewPlaceholder>
			);
		}
		return this.props.children;
	}
}

export default function HTMLBlock(props: { content: any; onChange: any }) {
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [editorOpen, setEditorOpen] = React.useState<boolean>(false);
	const [isFullScreen, setIsFullScreen] = React.useState<boolean>(false);
	const panelWrapperRef = React.useRef<HTMLDivElement>(null);

	React.useEffect(() => {
		if (editorOpen && panelWrapperRef.current && !isFullScreen) {
			const enterFullscreen = async () => {
				try {
					await panelWrapperRef.current!.requestFullscreen();
				} catch (err) {
					console.error('Error attempting to enable fullscreen:', err);
				}
			};
			enterFullscreen();
		}
	}, [editorOpen]);

	const handleFullScreen = async () => {
		if (isFullScreen) {
			try {
				await document.exitFullscreen();
			} catch (err) {
				console.error('Error attempting to exit fullscreen:', err);
			}
		} else if (panelWrapperRef.current) {
			try {
				await panelWrapperRef.current.requestFullscreen();
			} catch (err) {
				console.error('Error attempting to enable fullscreen:', err);
			}
		}
	};

	const handleClose = async () => {
		if (isFullScreen) {
			try {
				await document.exitFullscreen();
			} catch (err) {
				console.error('Error attempting to exit fullscreen:', err);
			}
		}
		setEditorOpen(false);
	};

	React.useEffect(() => {
		const handleFullscreenChange = () => {
			setIsFullScreen(!!document.fullscreenElement);
		};

		document.addEventListener('fullscreenchange', handleFullscreenChange);
		return () => {
			document.removeEventListener('fullscreenchange', handleFullscreenChange);
		};
	}, []);

	const renderPreview = () => {
		if (!props.content) {
			return (
				<S.PreviewPlaceholder className={'border-wrapper-alt3'}>
					<span>HTML Preview</span>
				</S.PreviewPlaceholder>
			);
		}

		if (!isValidHTML(props.content)) {
			return (
				<S.PreviewPlaceholder className={'border-wrapper-alt3'}>
					<span>Invalid HTML</span>
				</S.PreviewPlaceholder>
			);
		}

		return <HTMLPreviewErrorBoundary>{parse(props.content)}</HTMLPreviewErrorBoundary>;
	};

	const renderEditorContent = () => (
		<S.PanelWrapper ref={panelWrapperRef} isFullScreen={isFullScreen}>
			<S.PreviewElement isFullScreen={isFullScreen}>
				<CodeEditor
					initialData={props.content}
					setEditorData={(content: string) => props.onChange(cleanHTMLContent(content))}
					language={'html'}
					loading={false}
					noFullScreen
					useFixedHeight={isFullScreen}
				/>
			</S.PreviewElement>
			<S.PreviewElement isFullScreen={isFullScreen}>
				<S.PreviewWrapper>
					{renderPreview()}
					<S.ActionsWrapper>
						<Button
							type={'primary'}
							label={isFullScreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
							handlePress={handleFullScreen}
						/>
						<Button type={'alt1'} label={language.close} handlePress={handleClose} />
					</S.ActionsWrapper>
				</S.PreviewWrapper>
			</S.PreviewElement>
		</S.PanelWrapper>
	);

	return (
		<>
			<S.Wrapper>
				<S.PreviewWrapper>
					{!editorOpen && isValidHTML(props.content) && props.content ? (
						<HTMLPreviewErrorBoundary>{parse(props.content)}</HTMLPreviewErrorBoundary>
					) : (
						<S.PreviewPlaceholder className={'border-wrapper-alt3'}>
							<span>{editorOpen ? 'Editing...' : 'HTML Preview'}</span>
						</S.PreviewPlaceholder>
					)}
				</S.PreviewWrapper>
				<S.ActionsWrapper>
					<Button type={'alt1'} label={language?.editHtml} handlePress={() => setEditorOpen(true)} />
				</S.ActionsWrapper>
			</S.Wrapper>
			<Panel
				open={editorOpen}
				header={language?.htmlEditor}
				handleClose={() => setEditorOpen(false)}
				width={700}
				closeHandlerDisabled={true}
				className={'modal-wrapper'}
			>
				{renderEditorContent()}
			</Panel>
		</>
	);
}
