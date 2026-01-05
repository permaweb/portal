type OdyseeEmbedProps = {
	element: {
		id: string | number;
		content?: string;
		data?: {
			url?: string;
			embedUrl?: string;
		};
	};
};

export default function OdyseeEmbed(props: OdyseeEmbedProps) {
	const embedUrl = props.element?.data?.embedUrl;

	if (embedUrl) {
		return (
			<div
				className="odysee-embed-wrapper"
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
					title="Odysee video"
				/>
			</div>
		);
	}

	// Fallback to HTML content if embedUrl not available
	if (props.element?.content) {
		return <div className="odysee-embed-wrapper" dangerouslySetInnerHTML={{ __html: props.element.content }} />;
	}

	return null;
}
