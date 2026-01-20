import React from 'react';
import { BeforeMount, OnMount } from '@monaco-editor/react';
import { DefaultTheme, useTheme } from 'styled-components';

import { IconButton } from 'components/atoms/IconButton';
import { Loader } from 'components/atoms/Loader';
import LazyMonacoEditor from 'components/molecules/LazyMonacoEditor';
import { ICONS } from 'helpers/config';
import { stripAnsiChars } from 'helpers/utils';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';

export default function CodeEditor(props: {
	initialData: string;
	language?: string;
	readOnly?: boolean;
	noFullScreen?: boolean;
	noWrapper?: boolean;
	setEditorData?: (data: string) => void;
	header?: string;
	height?: number;
	useFixedHeight?: boolean;
	loading: boolean;
}) {
	const currentTheme: any = useTheme();

	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const editorRef = React.useRef(null);
	const monacoRef = React.useRef<typeof import('monaco-editor') | null>(null);
	const themeName = currentTheme.scheme === 'dark' ? 'editorDark' : 'editorLight';

	const [height, setHeight] = React.useState(0);
	const [data, setData] = React.useState(props.initialData);
	const [fullScreenMode, setFullScreenMode] = React.useState<boolean>(false);

	React.useEffect(() => {
		setData(props.initialData);
	}, [props.initialData]);

	React.useEffect(() => {
		if (!props.setEditorData) return;

		const timer = setTimeout(() => {
			props.setEditorData(data);
		}, 350);

		return () => clearTimeout(timer);
	}, [props.setEditorData, data]);

	const strip = (hex: string) => hex.replace(/^#/, '');

	function getRules(theme: DefaultTheme) {
		return [
			{ token: 'string', foreground: strip(theme.colors.editor.primary) },
			{ token: 'number', foreground: strip(theme.colors.editor.alt2) },
			{ token: 'keyword', foreground: strip(theme.colors.editor.alt1) },
			{ token: 'string.quoted.double.json', foreground: strip(theme.colors.editor.primary) },
			{ token: 'string.key.json', foreground: strip(theme.colors.editor.primary) },
			{ token: 'string.value.json', foreground: strip(theme.colors.editor.alt1) },
			{ token: 'comment', foreground: strip(theme.colors.editor.alt10) },
			// HTML specific tokens
			{ token: 'tag', foreground: strip(theme.colors.editor.alt1) },
			{ token: 'tag.html', foreground: strip(theme.colors.editor.alt1) },
			{ token: 'delimiter.html', foreground: strip(theme.colors.editor.alt5) },
			{ token: 'attribute.name.html', foreground: strip(theme.colors.editor.alt8) },
			{ token: 'attribute.value.html', foreground: strip(theme.colors.editor.primary) },
			{ token: 'string.html', foreground: strip(theme.colors.editor.primary) },
			{ token: 'metatag.html', foreground: strip(theme.colors.editor.alt2) },
			{ token: 'metatag.content.html', foreground: strip(theme.colors.editor.primary) },
		];
	}

	function getColors(theme: DefaultTheme) {
		return {
			'editor.background': props.noWrapper ? theme.colors.view.background : theme.colors.container.alt1.background,
			'editorLineNumber.foreground': theme.colors.font.alt1,
			'editorCursor.foreground': theme.colors.font.alt1,
			'editorBracketHighlight.foreground1': theme.colors.editor.alt5,
			'editorBracketHighlight.foreground2': theme.colors.editor.alt8,
			'editorBracketHighlight.foreground3': theme.colors.editor.alt5,
		};
	}

	const themes = {
		light: 'editorLight',
		dark: 'editorDark',
	};

	const handleBeforeMount: BeforeMount = (monaco) => {
		(monacoRef as any).current = monaco;

		monaco.editor.defineTheme(themes.light, {
			base: 'vs',
			inherit: true,
			rules: getRules(currentTheme),
			colors: getColors(currentTheme),
		});

		monaco.editor.defineTheme(themes.dark, {
			base: 'vs-dark',
			inherit: true,
			rules: getRules(currentTheme),
			colors: getColors(currentTheme),
		});

		const themeName = currentTheme.scheme === 'dark' ? themes.dark : themes.light;
		monaco.editor.setTheme(themeName);
	};

	const toggleFullscreen = React.useCallback(async () => {
		const el = editorRef.current!;
		if (!document.fullscreenElement) {
			await el.requestFullscreen?.();
		} else {
			await document.exitFullscreen?.();
		}
	}, []);

	React.useEffect(() => {
		const onFullScreenChange = () => {
			setFullScreenMode(!!document.fullscreenElement);
		};
		document.addEventListener('fullscreenchange', onFullScreenChange);
		return () => {
			document.removeEventListener('fullscreenchange', onFullScreenChange);
		};
	}, []);

	React.useEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && fullScreenMode) {
				toggleFullscreen();
			}
		};
		document.addEventListener('keydown', onKeyDown);
		return () => {
			document.removeEventListener('keydown', onKeyDown);
		};
	}, [fullScreenMode, toggleFullscreen]);

	React.useEffect(() => {
		const monaco = monacoRef.current;
		if (!monaco) return;

		monaco.editor.defineTheme(themes.light, {
			base: 'vs',
			inherit: true,
			rules: getRules(currentTheme),
			colors: getColors(currentTheme),
		});

		monaco.editor.defineTheme(themes.dark, {
			base: 'vs-dark',
			inherit: true,
			rules: getRules(currentTheme),
			colors: getColors(currentTheme),
		});

		monaco.editor.setTheme(themeName);
	}, [currentTheme, themeName]);

	const handleEditorMount: OnMount = (editor) => {
		if (props.useFixedHeight) return;

		const disp = editor.onDidContentSizeChange((e) => {
			setHeight(e.contentHeight);
		});
		return () => disp.dispose();
	};

	return data !== null ? (
		<S.Wrapper>
			{props.header && (
				<S.Header>
					<p>{props.header}</p>
				</S.Header>
			)}
			<S.EditorWrapper
				ref={editorRef}
				style={{
					width: '100%',
					height: props.height ? `${props.height.toString()}px` : props.useFixedHeight ? '100%' : `${height}px`,
					overflow: 'hidden',
				}}
				useFixedHeight={props.useFixedHeight}
				className={`${props.noWrapper ? '' : 'border-wrapper-alt3'} scroll-wrapper`}
			>
				<S.Editor noWrapper={props.noWrapper}>
					<LazyMonacoEditor
						height={'100%'}
						defaultLanguage={props.language}
						value={stripAnsiChars(data)}
						onChange={(value) => setData(value)}
						beforeMount={handleBeforeMount}
						onMount={handleEditorMount}
						theme={themeName}
						loading={<Loader sm relative />}
						options={{
							readOnly: props.loading || props.readOnly,
							automaticLayout: true,
							tabSize: 4,
							formatOnPaste: true,
							formatOnType: true,
							minimap: { enabled: false },
							wordWrap: 'on',
							fontFamily: currentTheme.typography.family.alt2,
							fontSize: currentTheme.typography.size.xxxSmall,
							fontWeight: '600',
							scrollBeyondLastLine: false,
							colorDecorators: false,
							suggest: {
								showWords: true,
								showSnippets: true,
							},
							quickSuggestions: {
								other: true,
								comments: false,
								strings: props.language === 'html',
							},
							scrollbar: {
								verticalSliderSize: 8,
								horizontalSliderSize: 8,
								verticalScrollbarSize: 12,
								horizontalScrollbarSize: 12,
								arrowSize: 10,
								useShadows: false,
							},
						}}
					/>
				</S.Editor>
				<S.ActionsWrapper>
					{!props.noFullScreen && (
						<IconButton
							type={'alt1'}
							src={ICONS.fullscreen}
							handlePress={toggleFullscreen}
							dimensions={{
								wrapper: 25,
								icon: 12.5,
							}}
							tooltip={fullScreenMode ? language.exitFullScreen : language.enterFullScreen}
							tooltipPosition={'top-right'}
						/>
					)}
				</S.ActionsWrapper>
			</S.EditorWrapper>
		</S.Wrapper>
	) : (
		<Loader sm relative />
	);
}
