import React from 'react';

import * as S from './styles';

export default function ViewHeader(props: { header: string; actions?: React.ReactNode[] }) {
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
