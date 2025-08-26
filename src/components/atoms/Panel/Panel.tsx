import React from 'react';

import { IconButton } from 'components/atoms/IconButton';
import { Portal } from 'components/atoms/Portal';
import { ASSETS, DOM } from 'helpers/config';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { CloseHandler } from 'wrappers/CloseHandler';

import * as S from './styles';

export default function Panel(props: {
	header: string | null | undefined | React.ReactNode;
	handleClose: () => void | null;
	children: React.ReactNode;
	open: boolean;
	width?: number;
	closeHandlerDisabled?: boolean;
	className?: string;
}) {
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const escFunction = React.useCallback(
		(e: any) => {
			if (e.key === 'Escape' && props.handleClose && !props.closeHandlerDisabled) {
				props.handleClose();
			}
		},
		[props]
	);

	React.useEffect(() => {
		if (props.open) {
			hideDocumentBody();
			return () => {
				showDocumentBody();
			};
		}
	}, [props.open]);

	React.useEffect(() => {
		document.addEventListener('keydown', escFunction, false);

		return () => {
			document.removeEventListener('keydown', escFunction, false);
		};
	}, [escFunction]);

	function getHeader() {
		switch (typeof props.header) {
			case 'string':
				return <S.Title>{props.header}</S.Title>;
			case 'object':
				return props.header;
		}
	}

	function getBodyClassName() {
		let className = 'scroll-wrapper ';
		if (props.className) className += props.className;
		return className;
	}

	return (
		<Portal node={DOM.overlay}>
			<S.Container open={props.open} noHeader={!props.header} width={props.width} className={'border-wrapper-primary'}>
				<CloseHandler
					active={props.open && !props.closeHandlerDisabled}
					disabled={!props.open || props.closeHandlerDisabled}
					callback={() => props.handleClose()}
				>
					{props.header && (
						<S.Header>
							<S.LT>{getHeader()}</S.LT>
							{props.handleClose && (
								<S.Close>
									<IconButton
										type={'primary'}
										warning
										src={ASSETS.close}
										handlePress={() => props.handleClose()}
										active={false}
										dimensions={{
											wrapper: 32.5,
											icon: 18.5,
										}}
										tooltip={language?.close ?? 'Close'}
									/>
								</S.Close>
							)}
						</S.Header>
					)}
					<S.Body className={getBodyClassName()}>{props.children}</S.Body>
				</CloseHandler>
			</S.Container>
			<S.PanelOverlay open={props.open} />
		</Portal>
	);
}

let panelOpenCounter = 0;

const showDocumentBody = () => {
	panelOpenCounter -= 1;
	if (panelOpenCounter === 0) {
		document.body.style.overflowY = 'auto';
	}
};

const hideDocumentBody = () => {
	panelOpenCounter += 1;
	document.body.style.overflowY = 'hidden';
};
