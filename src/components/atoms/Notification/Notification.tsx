import React from 'react';
import { ReactSVG } from 'react-svg';

import { ICONS } from 'helpers/config';
import { useLanguageProvider } from 'providers/LanguageProvider';

import { Button } from '../Button';

import * as S from './styles';

export default function Notification(props: {
	message: string;
	callback: () => void | null;
	type: 'success' | 'warning';
	persistent?: boolean;
}) {
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [show, setShow] = React.useState<boolean>(true);

	function handleClose() {
		setShow(false);
		if (props.callback) props.callback();
	}

	React.useEffect(() => {
		if (show && !props.persistent) {
			const timer = setTimeout(
				() => {
					handleClose();
				},
				props.type === 'warning' ? 10000 : 5000
			);

			return () => clearTimeout(timer);
		}
	}, [show, props.type, props.persistent]);

	return show ? (
		<S.Wrapper warning={props.type === 'warning'} className={'info'}>
			<S.MessageWrapper>
				<S.Icon warning={props.type === 'warning'}>
					<ReactSVG src={props.type === 'warning' ? ICONS.warning : ICONS.success} />
				</S.Icon>
				<S.Message>{props.message}</S.Message>
			</S.MessageWrapper>
			<S.Close>
				<Button type={'alt2'} label={language?.dismiss} handlePress={handleClose} />
			</S.Close>
		</S.Wrapper>
	) : null;
}
