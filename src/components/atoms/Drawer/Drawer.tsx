import React from 'react';
import { ReactSVG } from 'react-svg';

import { useSettingsProvider } from 'editor/providers/SettingsProvider';

import { ICONS } from 'helpers/config';

import * as S from './styles';

export default function Drawer(props: {
	title: string;
	content: React.ReactNode;
	icon?: string;
	actions?: React.ReactNode[];
	headerContent?: React.ReactNode;
	noContentWrapper?: boolean;
	padContent?: boolean;
	drawerKey?: string;
	sm?: boolean;
}) {
	const settingsProvider = useSettingsProvider();
	const persistedState = props.drawerKey ? settingsProvider.settings.drawerStates[props.drawerKey] : undefined;
	const [open, setOpen] = React.useState<boolean>(persistedState !== undefined ? persistedState : true);

	const handleToggle = () => {
		const newState = !open;
		setOpen(newState);
		if (props.drawerKey) {
			settingsProvider.updateDrawerState(props.drawerKey, newState);
		}
	};

	return (
		<S.Wrapper className={props.noContentWrapper ? '' : 'border-wrapper-alt2'}>
			<S.Action onClick={handleToggle} open={open} noContentWrapper={props.noContentWrapper} sm={props.sm}>
				<S.Label sm={props.sm}>
					<S.Title>
						{props.icon && <ReactSVG src={props.icon} />}
						<p>{props.title}</p>
					</S.Title>
					<S.HeaderEnd>
						{!open && props.headerContent}
						{props.actions && (
							<S.HeaderActions onClick={(e) => e.stopPropagation()}>
								{props.actions.map((action: React.ReactNode, index: number) => (
									<React.Fragment key={index}>{action}</React.Fragment>
								))}
							</S.HeaderActions>
						)}
						<S.Arrow open={open} sm={props.sm}>
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
