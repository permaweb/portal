import React from 'react';
import { ReactSVG } from 'react-svg';

import { IconButton } from 'components/atoms/IconButton';
import { Portal } from 'components/atoms/Portal';
import { DOM, ICONS } from 'helpers/config';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';

export default function Modal(props: {
	header: string | null | undefined;
	handleClose: () => void | null;
	children: React.ReactNode;
	allowOverflow?: boolean;
	status?: 'success' | 'warning';
	className?: string;
	width?: number;
	closeDisabled?: boolean;
}) {
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const escFunction = React.useCallback(
		(e: any) => {
			if (e.key === 'Escape' && props.handleClose && !props.closeDisabled) {
				props.handleClose();
			}
		},
		[props]
	);

	React.useEffect(() => {
		hideDocumentBody();
		return () => {
			showDocumentBody();
		};
	}, []);

	React.useEffect(() => {
		document.addEventListener('keydown', escFunction, false);

		return () => {
			document.removeEventListener('keydown', escFunction, false);
		};
	}, [escFunction]);

	function getBodyClassName() {
		let className = '';
		if (props.className) className += props.className;
		if (!props.allowOverflow) className += ' scroll-wrapper';
		return className;
	}

	return (
		<Portal node={DOM.overlay}>
			<S.Wrapper noHeader={!props.header} top={window ? (window as any).pageYOffset : 0}>
				<S.Container noHeader={!props.header} width={props.width}>
					{props.header && (
						<S.Header>
							<S.LT>
								{props.status && (
									<S.Indicator status={props.status}>
										<ReactSVG src={props.status === 'success' ? ICONS.checkmark : ICONS.warning} />
									</S.Indicator>
								)}
								<S.Title>{props.header}</S.Title>
							</S.LT>
							{props.handleClose && (
								<S.Close>
									<IconButton
										type={'alt1'}
										warning
										src={ICONS.close}
										handlePress={() => props.handleClose()}
										active={false}
										disabled={props.closeDisabled}
										dimensions={{
											wrapper: 30,
											icon: 18.5,
										}}
										tooltip={language?.close}
									/>
								</S.Close>
							)}
						</S.Header>
					)}
					<S.Body className={getBodyClassName()}>{props.children}</S.Body>
				</S.Container>
			</S.Wrapper>
		</Portal>
	);
}

let modalOpenCounter = 0;

const showDocumentBody = () => {
	modalOpenCounter -= 1;
	if (modalOpenCounter === 0) {
		document.body.style.overflowY = 'auto';
	}
};

const hideDocumentBody = () => {
	modalOpenCounter += 1;
	document.body.style.overflowY = 'hidden';
};
