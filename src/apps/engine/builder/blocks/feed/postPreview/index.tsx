import { usePortalProvider } from 'engine/providers/portalProvider';

import PostPreview_Default from './default';
import PostPreview_Journal from './journal';
import PostPreview_Minimal from './minimal';

export default function PostPreview(props: any) {
	const { portal } = usePortalProvider();
	const Layout = portal?.Layout;
	const { preview, post, loading } = props;

	switch (props?.layout) {
		case 'journal':
			return <PostPreview_Journal layout={Layout} post={post} />;
		case 'minimal':
			return <PostPreview_Minimal layout={Layout} post={post} />;
		default:
			return <PostPreview_Default layout={Layout} post={post} />;
	}
}
