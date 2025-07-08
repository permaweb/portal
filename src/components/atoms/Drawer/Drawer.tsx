import React from 'react';
import { ReactSVG } from 'react-svg';

import { ASSETS } from 'helpers/config';

import * as S from './styles';

export default function Drawer(props: { title: string; content: React.ReactNode; icon?: string }) {
	const [open, setOpen] = React.useState<boolean>(true);

	return (
		<S.Wrapper>
			<S.Action onClick={() => setOpen(!open)}>
				<S.Label>
					<S.Title>
						{props.icon && <ReactSVG src={props.icon} />}
						<span>{props.title}</span>
					</S.Title>
					<S.Arrow>
						<ReactSVG src={ASSETS.arrow} />
					</S.Arrow>
				</S.Label>
			</S.Action>
			{open && <S.Content>{props.content}</S.Content>}
		</S.Wrapper>
	);
}
