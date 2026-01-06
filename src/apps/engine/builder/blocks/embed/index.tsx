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

export default function Embed(props: EmbedProps) {
	const { embedUrl, collapsed, url, title, providerName, embedHtml } = props.element?.data || {};

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
