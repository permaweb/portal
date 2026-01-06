import React from 'react';

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

export default function Embed(props: EmbedProps) {
	const { embedUrl, collapsed, url, title, providerName, embedHtml } = props.element?.data || {};
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
		effectiveEmbedUrl?.includes('platform.twitter.com') || url?.includes('twitter.com') || url?.includes('x.com');

	// Show iframe embed using embedUrl from data
	if (effectiveEmbedUrl) {
		// Twitter embeds need different styling - they're not 16:9
		if (isTwitterEmbed) {
			return (
				<div className="embed-wrapper" style={{ position: 'relative', maxWidth: '550px' }}>
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
							width: '100%',
							height: '400px',
							border: 'none',
						}}
						allowFullScreen
						title={title || 'Twitter embed'}
					/>
				</div>
			);
		}

		// Standard 16:9 embed (Odysee, YouTube, etc.)
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
				<div
					style={{
						position: 'relative',
						width: '100%',
						paddingBottom: '56.25%',
						height: 0,
						overflow: 'hidden',
					}}
				>
					<iframe
						src={effectiveEmbedUrl}
						style={{
							position: 'absolute',
							top: 0,
							left: 0,
							width: '100%',
							height: '100%',
							border: 0,
						}}
						allowFullScreen
						title={title || `${providerName || 'Embedded'} content`}
					/>
				</div>
			</div>
		);
	}

	// Show embed HTML for Twitter-style embeds
	if (embedHtml) {
		return <div className="embed-wrapper" dangerouslySetInnerHTML={{ __html: embedHtml }} />;
	}

	// Final fallback: render content HTML directly
	if (content) {
		return <div className="embed-wrapper" dangerouslySetInnerHTML={{ __html: content }} />;
	}

	return null;
}
