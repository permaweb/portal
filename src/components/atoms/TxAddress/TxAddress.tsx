import React from 'react';

import { ReactSVG } from 'components/atoms/GatewaySVG';
import { ICONS } from 'helpers/config';
import { getExplorerEndpoint } from 'helpers/endpoints';
import { formatAddress } from 'helpers/utils';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';

export default function TxAddress(props: { address: string; wrap: boolean; view?: boolean; viewIcon?: string }) {
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [copied, setCopied] = React.useState<boolean>(false);

	const copyAddress = React.useCallback(async () => {
		if (props.address) {
			if (props.address.length > 0) {
				await navigator.clipboard.writeText(props.address);
				setCopied(true);
				setTimeout(() => setCopied(false), 2000);
			}
		}
	}, [props.address]);

	if (props.view) {
		return (
			<S.ExplorerLink
				as={'a'}
				disabled={false}
				href={getExplorerEndpoint(props.address)}
				title={props.address}
				target={'_blank'}
				rel={'noopener noreferrer'}
			>
				<p>{formatAddress(props.address, props.wrap)}</p>
				<ReactSVG src={props.viewIcon ?? ICONS.newTab} aria-hidden={'true'} />
			</S.ExplorerLink>
		);
	}

	return (
		<>
			<S.Wrapper disabled={copied}>
				<p onClick={copied ? () => {} : copyAddress}>
					{copied ? `${language?.copied}!` : formatAddress(props.address, props.wrap)}
				</p>
			</S.Wrapper>
		</>
	);
}
