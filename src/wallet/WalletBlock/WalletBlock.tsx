import permawebOsIcon from 'assets/permawebos.svg?inline';

import { Button } from 'components/atoms/Button';
import { ReactSVG } from 'components/atoms/GatewaySVG';
import { ICONS } from 'helpers/config';
import { WalletEnum } from 'helpers/types';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';

export default function WalletBlock() {
	const arProvider = useArweaveProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];
	const { auth } = arProvider;

	return (
		<S.Wrapper>
			<S.Icon>
				<ReactSVG src={ICONS.wallet} />
			</S.Icon>
			<p>{language?.connectToContinue}</p>
			<S.WalletConnect>
				<Button
					type={'alt1'}
					label={'Connect PermawebOS'}
					icon={permawebOsIcon}
					iconLeftAlign
					handlePress={() => arProvider.handleConnect(WalletEnum.permawebOs)}
					disabled={auth?.authStatus === 'loading'}
				/>
				<Button
					type={'alt1'}
					label={auth?.authStatus === 'loading' ? language.loading : 'Connect Wander'}
					handlePress={() => arProvider.handleConnect(WalletEnum.wander)}
					disabled={auth?.authStatus === 'loading'}
				/>
			</S.WalletConnect>
		</S.Wrapper>
	);
}
