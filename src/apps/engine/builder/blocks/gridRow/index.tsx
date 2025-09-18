import React from 'react';
import { defaultLayout } from 'engine/defaults/layout.defaults';
import { usePortalProvider } from 'engine/providers/portalProvider';

import * as S from './styles';

export default function GridRow(props: any) {
	const { getContent, content, layout, preview } = props;
	const { portal } = usePortalProvider();
	const Layout = preview ? defaultLayout : portal?.Layout;

	console.log('Layout: ', Layout);

	return (
		<S.GridRow $layout={layout} id="GridRow">
			<S.GridRowWrapper $layout={layout} padding={Layout?.basics?.padding} maxWidth={Layout?.basics?.maxWidth}>
				{content.map((element: any, index: number) => {
					return (
						<React.Fragment key={index}>
							{getContent(element, preview, index)}
							{layout?.separation && index < content.length - 1 && <S.Separation />}
						</React.Fragment>
					);
				})}
			</S.GridRowWrapper>
		</S.GridRow>
	);
}
