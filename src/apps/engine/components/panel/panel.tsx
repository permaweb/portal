import React from 'react';
import ReactDOM from 'react-dom';
import { ReactSVG } from 'react-svg';
import { CloseHandler } from 'engine/components/wrappers/closeHandler';

import { ICONS } from 'helpers/config';
import { useLanguageProvider } from 'providers/LanguageProvider';

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
				<S.Container $noHeader={!props.header} width={props.width} $transparent={props.transparent}>
					<CloseHandler
						active={props.open}
						disabled={!props.open || props.transparent}
						callback={() => props.handleClose()}
					>
						{props.header && (
							<S.Header>
								<S.LT>
									<S.Title>{props.header}</S.Title>
								</S.LT>
								{props.handleClose && (
									<S.Close onClick={() => props.handleClose()}>
										<ReactSVG src={ICONS.close} />
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

	const portalTarget = document.getElementById('overlay') || document.body;
	return ReactDOM.createPortal(<S.Wrapper $transparent={props.transparent}>{getBody()}</S.Wrapper>, portalTarget);
}

let panelOpenCounter = 0;

const showDocumentBody = () => {
	panelOpenCounter -= 1;
};

const hideDocumentBody = () => {
	panelOpenCounter += 1;
};
