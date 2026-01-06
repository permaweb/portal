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

	// Show iframe embed for Odysee-style embeds
	if (embedUrl) {
		return (
			<div
				className="embed-wrapper"
				style={{
					position: 'relative',
					width: '100%',
					paddingBottom: '56.25%',
					height: 0,
					overflow: 'hidden',
				}}
			>
				<iframe
					src={embedUrl}
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
		);
	}

	// Show embed HTML for Twitter-style embeds
	if (embedHtml) {
		return <div className="embed-wrapper" dangerouslySetInnerHTML={{ __html: embedHtml }} />;
	}

	// Fallback to HTML content if available
	if (props.element?.content) {
		return <div className="embed-wrapper" dangerouslySetInnerHTML={{ __html: props.element.content }} />;
	}

	return null;
}
