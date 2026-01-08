import React from 'react';

declare global {
	interface Window {
		twttr?: {
			widgets: {
				load: (element?: HTMLElement) => void;
			};
		};
	}
}

type EmbedProps = {
	element: {
		id: string | number;
		content?: string;
		data?: {
			url?: string;
			embedUrl?: string;
			collapsed?: boolean | string;
			title?: string;
			authorName?: string;
			authorUrl?: string;
			thumbnailUrl?: string;
			provider?: string;
			providerName?: string;
			embedHtml?: string;
		};
	};
};

// Extract iframe src from HTML content
function extractIframeSrc(html: string): string | null {
	if (!html) return null;
	const match = html.match(/<iframe[^>]+src=["']([^"']+)["']/i);
	return match ? match[1] : null;
}

// Load Twitter widgets.js if not already loaded
function loadTwitterWidgets(): Promise<void> {
	return new Promise((resolve) => {
		if (window.twttr) {
			resolve();
			return;
		}

		const script = document.createElement('script');
		script.src = 'https://platform.twitter.com/widgets.js';
		script.async = true;
		script.onload = () => resolve();
		script.onerror = () => resolve(); // Resolve anyway to not block rendering
		document.head.appendChild(script);
	});
}

// Twitter embed component that loads widgets.js
function TwitterEmbed({ html, url, onCollapse }: { html: string; url?: string; onCollapse?: () => void }) {
	const containerRef = React.useRef<HTMLDivElement>(null);

	React.useEffect(() => {
		loadTwitterWidgets().then(() => {
			if (window.twttr && containerRef.current) {
				window.twttr.widgets.load(containerRef.current);
			}
		});
	}, [html]);

	return (
		<div className="embed-wrapper" style={{ position: 'relative' }}>
			{url && onCollapse && (
				<button
					onClick={onCollapse}
					style={{
						position: 'absolute',
						top: '8px',
						right: '8px',
						width: '24px',
						height: '24px',
						padding: 0,
						cursor: 'pointer',
						border: 'none',
						borderRadius: '50%',
						background: 'rgba(0, 0, 0, 0.6)',
						color: '#fff',
						fontSize: '14px',
						fontWeight: 'bold',
						lineHeight: '24px',
						textAlign: 'center',
						zIndex: 10,
					}}
					title="Show link only"
				>
					×
				</button>
			)}
			<div ref={containerRef} dangerouslySetInnerHTML={{ __html: html }} />
		</div>
	);
}

export default function Embed(props: EmbedProps) {
	const { embedUrl, collapsed, url, title, providerName, provider, embedHtml } = props.element?.data || {};
	const content = props.element?.content || '';

	// Handle collapsed as boolean or string (database may serialize as string)
	const initialCollapsed = collapsed === true || collapsed === 'true';
	const [isCollapsed, setIsCollapsed] = React.useState(initialCollapsed);

	// Get the effective embed URL (from data or extracted from content)
	const effectiveEmbedUrl = embedUrl || extractIframeSrc(content);

	// If collapsed, show link only (no way to expand again)
	if (isCollapsed && url) {
		return (
			<div className="embed-wrapper embed-collapsed">
				<a href={url} target="_blank" rel="noopener noreferrer">
					{title || url}
				</a>
			</div>
		);
	}

	// Check if this is a Twitter embed
	const isTwitterEmbed =
		provider === 'twitter.com' ||
		provider === 'x.com' ||
		effectiveEmbedUrl?.includes('platform.twitter.com') ||
		url?.includes('twitter.com') ||
		url?.includes('x.com');

	// For Twitter with OEmbed HTML (blockquote), use the Twitter embed component
	if (isTwitterEmbed && embedHtml && embedHtml.includes('twitter-tweet')) {
		return <TwitterEmbed html={embedHtml} url={url} onCollapse={() => setIsCollapsed(true)} />;
	}

	// Show iframe embed
	if (effectiveEmbedUrl) {
		return (
			<div className="embed-wrapper" style={{ position: 'relative' }}>
				{url && (
					<button
						onClick={() => setIsCollapsed(true)}
						style={{
							position: 'absolute',
							top: '8px',
							right: '8px',
							width: '24px',
							height: '24px',
							padding: 0,
							cursor: 'pointer',
							border: 'none',
							borderRadius: '50%',
							background: 'rgba(0, 0, 0, 0.6)',
							color: '#fff',
							fontSize: '14px',
							fontWeight: 'bold',
							lineHeight: '24px',
							textAlign: 'center',
							zIndex: 10,
						}}
						title="Show link only"
					>
						×
					</button>
				)}
				<iframe
					src={effectiveEmbedUrl}
					style={{
						aspectRatio: isTwitterEmbed ? '2 / 1' : '16 / 9',
						border: 'none',
					}}
					allowFullScreen
					title={title || `${providerName || 'Embedded'} content`}
				/>
			</div>
		);
	}

	// Show embed HTML
	if (embedHtml) {
		return <div className="embed-wrapper" dangerouslySetInnerHTML={{ __html: embedHtml }} />;
	}

	// Final fallback: render content HTML directly
	if (content) {
		return <div className="embed-wrapper" dangerouslySetInnerHTML={{ __html: content }} />;
	}

	return null;
}
