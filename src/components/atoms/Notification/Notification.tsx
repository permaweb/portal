import React from 'react';
import { ReactSVG } from 'react-svg';

import { ASSETS } from 'helpers/config';
import { useLanguageProvider } from 'providers/LanguageProvider';

import { Button } from '../Button';

import * as S from './styles';

export default function Notification(props: {
	message: string;
	callback: () => void | null;
	type: 'success' | 'warning';
}) {
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [show, setShow] = React.useState<boolean>(true);

	function handleClose() {
		setShow(false);
		if (props.callback) props.callback();
	}

	React.useEffect(() => {
		if (show) {
			const timer = setTimeout(
				() => {
					handleClose();
				},
				props.type === 'warning' ? 10000 : 5000
			);

			return () => clearTimeout(timer);
		}
	}, [show, props.type]);

	return show ? (
		<S.Wrapper warning={props.type === 'warning'} className={'info'}>
			<S.MessageWrapper>
				<S.Icon warning={props.type === 'warning'}>
					<ReactSVG src={props.type === 'warning' ? ASSETS.warning : ASSETS.success} />
				</S.Icon>
				<S.Message>{props.message}</S.Message>
			</S.MessageWrapper>
			<S.Close>
				<Button type={'alt2'} label={language?.dismiss} handlePress={handleClose} />
			</S.Close>
		</S.Wrapper>
	) : null;
}
