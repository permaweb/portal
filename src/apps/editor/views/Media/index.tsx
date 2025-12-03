import React from 'react';

import { ViewHeader } from 'editor/components/atoms/ViewHeader';
import { MediaLibrary } from 'editor/components/organisms/MediaLibrary';
import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
import { Panel } from 'components/atoms/Panel';
import { TurboBalanceFund } from 'components/molecules/TurboBalanceFund';
import { ICONS } from 'helpers/config';
import { getARAmountFromWinc } from 'helpers/utils';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';

export default function Media() {
	const arProvider = useArweaveProvider();
	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];
	const [showFundUpload, setShowFundUpload] = React.useState<boolean>(false);

	return (
		<>
			<S.Wrapper>
				<ViewHeader
					header={language?.media}
					actions={[
						<S.CreditsWrapper className={'border-wrapper-alt3'}>
							<p>
								{arProvider.turboBalanceObj.effectiveBalance ? (
									<>
										<b>{getARAmountFromWinc(Number(arProvider.turboBalanceObj.effectiveBalance))}</b>{' '}
										{language?.credits}
									</>
								) : (
									`${language?.loading}...`
								)}
							</p>
						</S.CreditsWrapper>,
						<Button
							type={'alt1'}
							label={language?.add}
							handlePress={() => setShowFundUpload(true)}
							icon={ICONS.add}
							iconLeftAlign
						/>,
					]}
				/>
				<S.BodyWrapper>
					<S.MediaWrapper className={'border-wrapper-alt2'}>
						<MediaLibrary type={'image'} columns={6} />
					</S.MediaWrapper>
					<S.MediaWrapper className={'border-wrapper-alt2'}>
						<MediaLibrary type={'video'} columns={6} />
					</S.MediaWrapper>
				</S.BodyWrapper>
				{!portalProvider?.permissions?.updatePortalMeta && (
					<S.InfoWrapper className={'warning'}>
						<span>{language?.unauthorizedPortalUpdateMedia}</span>
					</S.InfoWrapper>
				)}
			</S.Wrapper>
			<Panel
				open={showFundUpload}
				width={575}
				header={language?.fundTurboBalance}
				handleClose={() => setShowFundUpload(false)}
				className={'modal-wrapper'}
			>
				<TurboBalanceFund handleClose={() => setShowFundUpload(false)} />
			</Panel>
		</>
	);
}
