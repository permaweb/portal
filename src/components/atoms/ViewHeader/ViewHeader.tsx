import React from 'react';

import * as S from './styles';
import { IProps } from './types';

export default function ViewHeader(props: IProps) {
	return (
		<S.HeaderWrapper>
			<h4>{props.header}</h4>
			{props.actions && (
				<S.HeaderActions>
					{props.actions.map((action: React.ReactNode, index: number) => (
						<React.Fragment key={index}>{action}</React.Fragment>
					))}
				</S.HeaderActions>
			)}
		</S.HeaderWrapper>
	);
}
