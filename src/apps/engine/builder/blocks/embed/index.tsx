import React from 'react';

type EmbedProps = {
	element: {
		id: string | number;
		content?: string;
		data?: {
			url?: string;
			embedUrl?: string;
			collapsed?: boolean;
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

// Twitter Embed component that handles Twitter widget rendering
function TwitterEmbed({ html }: { html: string }) {
	const containerRef = React.useRef<HTMLDivElement>(null);

	React.useEffect(() => {
		if (!containerRef.current) return;

		// Load Twitter widget script if not already loaded
		const scriptId = 'twitter-widgets-js';
		if (!document.getElementById(scriptId)) {
			const script = document.createElement('script');
			script.id = scriptId;
			script.src = 'https://platform.twitter.com/widgets.js';
			script.async = true;
			document.body.appendChild(script);
			script.onload = () => {
				// @ts-ignore - Twitter widgets global
				if (window.twttr?.widgets) {
					window.twttr.widgets.load(containerRef.current);
				}
			};
		} else {
			// Script already loaded, just re-render widgets
			// @ts-ignore - Twitter widgets global
			if (window.twttr?.widgets) {
				window.twttr.widgets.load(containerRef.current);
			}
		}
	}, [html]);

	return <div ref={containerRef} dangerouslySetInnerHTML={{ __html: html }} />;
}

// Helper to normalize boolean values that might be stored as strings
function normalizeBoolean(value: any): boolean {
	if (typeof value === 'boolean') return value;
	if (typeof value === 'string') return value === 'true';
	return false;
}

export default function Embed(props: EmbedProps) {
	const {
		embedUrl,
		collapsed: collapsedRaw,
		url,
		title,
		providerName,
		embedHtml,
		provider,
	} = props.element?.data || {};
	const content = props.element?.content;
	const collapsed = normalizeBoolean(collapsedRaw);

	// If collapsed, show link only
	if (collapsed && url) {
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
		embedUrl?.includes('platform.twitter.com') ||
		url?.includes('twitter.com') ||
		url?.includes('x.com');

	// For Twitter with OEmbed HTML (blockquote), use the Twitter embed component
	if (isTwitterEmbed && embedHtml && embedHtml.includes('twitter-tweet')) {
		return (
			<div className="embed-wrapper embed-twitter" style={{ maxWidth: '550px', margin: '0 auto' }}>
				<TwitterEmbed html={embedHtml} />
			</div>
		);
	}

	// Show iframe embed
	if (embedUrl) {
		// Twitter iframe embed - smaller and centered
		if (isTwitterEmbed) {
			return (
				<div
					className="embed-wrapper embed-twitter"
					style={{
						maxWidth: '550px',
						margin: '0 auto',
					}}
				>
					<iframe
						src={embedUrl}
						style={{
							width: '100%',
							minHeight: '400px',
							border: 'none',
						}}
						allowFullScreen
						title={title || 'Twitter embed'}
					/>
				</div>
			);
		}

		// Video embed (Odysee) - full width with 16:9 aspect ratio
		return (
			<div
				className="embed-wrapper embed-video"
				style={{
					position: 'relative',
					width: '100%',
					aspectRatio: '16 / 9',
				}}
			>
				<iframe
					src={embedUrl}
					style={{
						width: '100%',
						height: '100%',
						border: 'none',
					}}
					allowFullScreen
					title={title || `${providerName || 'Embedded'} content`}
				/>
			</div>
		);
	}

	// Show embed HTML (for OEmbed responses)
	if (embedHtml) {
		return <div className="embed-wrapper" dangerouslySetInnerHTML={{ __html: embedHtml }} />;
	}

	// Final fallback: render content HTML directly
	if (content) {
		return <div className="embed-wrapper" dangerouslySetInnerHTML={{ __html: content }} />;
	}

	return null;
}
