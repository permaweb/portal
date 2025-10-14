import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { usePortalProvider } from 'editor/providers/PortalProvider';
import { EditorStoreRootState } from 'editor/store';
import { currentPageUpdate } from 'editor/store/page';

import { capitalize } from 'helpers/utils';

import { PageToolbar } from './PageToolbar';
import * as S from './styles';

export default function PageEditor() {
	const dispatch = useDispatch();
	const { pageId } = useParams<{ pageId?: string }>();

	const currentPage = useSelector((state: EditorStoreRootState) => state.currentPage);

	const portalProvider = usePortalProvider();

	const handleCurrentPageUpdate = (updatedField: { field: string; value: any }) => {
		dispatch(currentPageUpdate(updatedField));
	};

	React.useEffect(() => {
		if (portalProvider.current?.id) {
			if (pageId && portalProvider.current?.pages?.[pageId]) {
				handleCurrentPageUpdate({ field: 'id', value: pageId });
				handleCurrentPageUpdate({ field: 'title', value: capitalize(pageId) });
				handleCurrentPageUpdate({ field: 'content', value: portalProvider.current?.pages?.[pageId].content });
			}
		}
	}, [pageId, portalProvider.current?.id, portalProvider.current?.pages]);

	console.log(currentPage);

	return (
		<S.Wrapper>
			<S.ToolbarWrapper>
				<PageToolbar handleSubmit={() => console.log('Save Page')} />
			</S.ToolbarWrapper>
			<S.EditorWrapper></S.EditorWrapper>
		</S.Wrapper>
	);
}
