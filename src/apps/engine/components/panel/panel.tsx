import React from 'react';
import Icon from 'engine/components/icon';
import * as ICONS from 'engine/constants/icons';
import { Portal } from '../Portal';
import { DOM } from 'engine/services/config';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { CloseHandler } from 'engine/components/wrappers/closeHandler';

import * as S from './styles';
import { IProps } from './types';

export default function Panel(props: IProps) {
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	React.useEffect(() => {
		hideDocumentBody();
		return () => {
			showDocumentBody();
		};
	}, []);

	const escFunction = React.useCallback(
		(e: any) => {
			if (e.key === 'Escape' && props.handleClose) {
				props.handleClose();
			}
		},
		[props]
	);

	React.useEffect(() => {
		document.addEventListener('keydown', escFunction, false);

		return () => {
			document.removeEventListener('keydown', escFunction, false);
		};
	}, [escFunction]);

	function getBody() {
		return (
			<>
				<S.Container $noHeader={!props.header} width={props.width}>
					<CloseHandler active={props.open} disabled={!props.open} callback={() => props.handleClose()}>
						{props.header && (
							<S.Header>
								<S.LT>
									<S.Title>{props.header}</S.Title>
								</S.LT>
								{props.handleClose && (
									<S.Close
										onClick={() => props.handleClose()}
									>
										<Icon icon={ICONS.CLOSE} />
									</S.Close>
								)}
							</S.Header>
						)}
						<S.Body className={'scroll-wrapper'}>{props.children}</S.Body>
					</CloseHandler>
				</S.Container>
			</>
		);
	}

	return (
		<S.Wrapper>
			{getBody()}
		</S.Wrapper>
	);
}

let panelOpenCounter = 0;

const showDocumentBody = () => {
	panelOpenCounter -= 1;
};

const hideDocumentBody = () => {
	panelOpenCounter += 1;
};
