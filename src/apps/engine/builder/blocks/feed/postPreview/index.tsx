import PostPreviewDynamic from 'engine/builder/blocks/postPreview';

export default function PostPreview(props: any) {
	const { post } = props;

	return <PostPreviewDynamic templateId={props?.layout || 'blog'} post={post} />;
}
