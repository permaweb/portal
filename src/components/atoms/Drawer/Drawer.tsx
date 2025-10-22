import React from 'react';
import { ReactSVG } from 'react-svg';

import { ICONS } from 'helpers/config';

import * as S from './styles';

export default function Drawer(props: {
	title: string;
	content: React.ReactNode;
	icon?: string;
	actions?: React.ReactNode[];
	noContentWrapper?: boolean;
	padContent?: boolean;
}) {
	const [open, setOpen] = React.useState<boolean>(true);

	return (
		<S.Wrapper className={props.noContentWrapper ? '' : 'border-wrapper-alt2'}>
			<S.Action onClick={() => setOpen(!open)} open={open} noContentWrapper={props.noContentWrapper}>
				<S.Label>
					<S.Title>
						{props.icon && <ReactSVG src={props.icon} />}
						<p>{props.title}</p>
					</S.Title>
					<S.HeaderEnd>
						{props.actions && (
							<S.HeaderActions onClick={(e) => e.stopPropagation()}>
								{props.actions.map((action: React.ReactNode, index: number) => (
									<React.Fragment key={index}>{action}</React.Fragment>
								))}
							</S.HeaderActions>
						)}
						<S.Arrow open={open}>
							<ReactSVG src={ICONS.arrow} />
						</S.Arrow>
					</S.HeaderEnd>
				</S.Label>
			</S.Action>
			{open && (
				<S.Content padContent={props.padContent} noContentWrapper={props.noContentWrapper}>
					{props.content}
				</S.Content>
			)}
		</S.Wrapper>
	);
}
