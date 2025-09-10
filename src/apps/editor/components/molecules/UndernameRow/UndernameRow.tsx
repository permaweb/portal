import React from 'react';
import { Panel } from 'components/atoms/Panel';
import { Button } from 'components/atoms/Button';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';
import type { UndernameOwnerRow } from 'editor/components/organisms/UndernamesList/UndernamesList';

export default function UndernameRow(props: { row: UndernameOwnerRow }) {
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];
	const [showPanel, setShowPanel] = React.useState(false);

	return (
		<>
			<S.RowWrapper className={'fade-in'} onClick={() => setShowPanel(true)}>
				<S.RowHeader>
					<p>{props.row.name}</p>
				</S.RowHeader>
				<S.RowDetail>
					<S.Address>{props.row.owner}</S.Address>
					<S.Actions>
						<Button
							type={'alt3'}
							label={language?.manage || 'Manage'}
							handlePress={(e) => {
								e.stopPropagation();
								setShowPanel(true);
							}}
						/>
					</S.Actions>
				</S.RowDetail>
			</S.RowWrapper>

			<Panel
				open={showPanel}
				width={500}
				header={language?.manageUndername || 'Manage Undername'}
				handleClose={() => setShowPanel(false)}
				closeHandlerDisabled
			>
				<S.PanelContent>
					<p>
						<span>Name</span> {props.row.name}
					</p>
					<p>
						<span>Owner</span> {props.row.owner}
					</p>
					<S.ActionsWrapper>
						<Button
							type={'warning'}
							label={language?.release || 'Release'}
							handlePress={() => {
								console.log('release undername', props.row.name);
								setShowPanel(false);
							}}
						/>
					</S.ActionsWrapper>
				</S.PanelContent>
			</Panel>
		</>
	);
}
