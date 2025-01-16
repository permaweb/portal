import React from 'react';
import { ReactSVG } from 'react-svg';

import { ASSETS, DOM } from 'helpers/config';
import { useLanguageProvider } from 'providers/LanguageProvider';

import { Button } from '../Button';
import { Portal } from '../Portal';

import * as S from './styles';
import { IProps } from './types';

export default function Notification(props: IProps) {
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [show, setShow] = React.useState<boolean>(true);

	function handleClose() {
		setShow(false);
		if (props.callback) props.callback();
	}

	React.useEffect(() => {
		if (show && props.type !== 'warning') {
			const timer = setTimeout(() => {
				handleClose();
			}, 5000);

			return () => clearTimeout(timer);
		}
	}, [show, props.type]);

	return show ? (
		<Portal node={DOM.notification}>
			<S.Wrapper warning={props.type === 'warning'} className={'info'}>
				<S.MessageWrapper>
					<S.Icon warning={props.type === 'warning'}>
						<ReactSVG src={props.type === 'warning' ? ASSETS.warning : ASSETS.success} />
					</S.Icon>
					<S.Message>{props.message}</S.Message>
				</S.MessageWrapper>
				<S.Close>
					<Button type={'alt2'} label={language.dismiss} handlePress={handleClose} />
				</S.Close>
			</S.Wrapper>
		</Portal>
	) : null;
}
