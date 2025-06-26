
import { PostList } from 'viewer/components/organisms/PostList';
import { usePortalProvider } from 'viewer/providers/PortalProvider';

import * as S from './styles';

export default function Landing() {
	const portalProvider = usePortalProvider();

	if (!portalProvider.current?.assets) return null;

	return (
		<S.Wrapper>
			<PostList posts={portalProvider.current?.assets} />
		</S.Wrapper>
	)
}