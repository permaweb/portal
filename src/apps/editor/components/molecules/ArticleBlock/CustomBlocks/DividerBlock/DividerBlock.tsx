export default function DividerBlock(props: { type: 'solid' | 'dashed' }) {
	return <div className={`article-divider-${props.type}`} />;
}
