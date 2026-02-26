import { createGlobalStyle } from 'styled-components';

interface GlobalStyleProps {
	$primaryColor?: string;
	$accentColor?: string;
	$fontFamily?: string;
	$borderRadius?: number;
	$customCss?: string;
}

export const WidgetGlobalStyles = createGlobalStyle<GlobalStyleProps>`
	[data-theme="light"] {
		--widget-bg: #fff;
		--widget-text: #1e1e1e;
		--widget-primary: ${(p) => p.$primaryColor || '#3b82f6'};
		--widget-accent: ${(p) => p.$accentColor || '#60a5fa'};
		--widget-border: #dcdcdc;
		--widget-card-bg: #f5f5f5;
		--widget-input-bg: #e8e8e8;
		--widget-hover: rgba(0, 0, 0, 0.05);
	}

	[data-theme="dark"] {
		--widget-bg: #18181b;
		--widget-text: #f0f0f0;
		--widget-primary: ${(p) => p.$accentColor || '#60a5fa'};
		--widget-accent: ${(p) => p.$primaryColor || '#3b82f6'};
		--widget-border: #3f3f46;
		--widget-card-bg: #27272a;
		--widget-input-bg: #3f3f46;
		--widget-hover: rgba(255, 255, 255, 0.05);
	}

	#permaweb-chat,
	#permaweb-chat-panel,
	#permaweb-chat-launcher {
		font-family: ${(p) => p.$fontFamily || "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"};
		font-size: 14px;
		line-height: 1.5;
		color: var(--widget-text);
		background: var(--widget-bg);
		border: 1px solid var(--widget-border);
		border-radius: ${(p) => (p.$borderRadius != null ? p.$borderRadius : 8)}px;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		box-sizing: border-box;

		*, *::before, *::after {
			box-sizing: border-box;
		}
	}

	#permaweb-chat-launcher {
		border: none;
		background: transparent;
		overflow: visible;
	}

	${(p) => p.$customCss || ''}
`;
