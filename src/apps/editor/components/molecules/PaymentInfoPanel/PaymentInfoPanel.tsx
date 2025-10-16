import { ArconnectSigner, ARIO } from '@ar.io/sdk';

import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
import { Loader } from 'components/atoms/Loader';
import { Panel } from 'components/atoms/Panel';
import { PaymentSummary } from 'components/molecules/Payment';
import { IS_TESTNET } from 'helpers/config';
import { UserOwnedDomain } from 'helpers/types';
import { getARAmountFromWinc, toReadableARIO } from 'helpers/utils';
import { useArIOBalance } from 'hooks/useArIOBalance';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { useNotifications } from 'providers/NotificationProvider';

import { InsufficientBalanceSection } from '../InsufficientBalanceSection';

import * as S from './styles';

const PaymentInfoPanel = (props: {
	costsByAntId: Record<
		string,
		{
			extend?: { winc: number; mario: number; fiatUSD: string | null };
			upgrade?: { winc: number; mario: number; fiatUSD: string | null };
		}
	>;
	upgradeModal: { open: boolean; domain?: UserOwnedDomain };
	setUpgradeModal: React.Dispatch<React.SetStateAction<{ open: boolean; domain?: UserOwnedDomain }>>;

	extendCost: { winc: number; mario: number; fiatUSD: string | null } | null;
	extendCostLoading: boolean;
	extendPaymentMethod: 'turbo' | 'ario';
	setExtendPaymentMethod: React.Dispatch<React.SetStateAction<'turbo' | 'ario'>>;

	upgradePaymentMethod: 'turbo' | 'ario';
	setUpgradePaymentMethod: React.Dispatch<React.SetStateAction<'turbo' | 'ario'>>;

	// From parent state/logic (used below)
	setShowFund: React.Dispatch<React.SetStateAction<boolean>>;
	upgradingDomains: Set<string>;
	setUpgradingDomains: React.Dispatch<React.SetStateAction<Set<string>>>;
	pollAndHydrateAfterChange: (args: {
		name: string;
		antId: string;
		previousEndTimestamp?: number;
		shouldStop?: (rec: any) => boolean;
	}) => any;
}) => {
	const arProvider = useArweaveProvider();
	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const { balance: arIOBalance } = useArIOBalance();
	const language: any = languageProvider.object[languageProvider.current];
	const { addNotification } = useNotifications();

	async function getSignedArio() {
		await window.arweaveWallet?.connect(['SIGN_TRANSACTION', 'ACCESS_ADDRESS', 'ACCESS_PUBLIC_KEY', 'DISPATCH']);
		const signer = new ArconnectSigner(window.arweaveWallet);
		return IS_TESTNET ? ARIO.testnet({ signer }) : ARIO.mainnet({ signer });
	}

	return (
		<Panel
			open={props.upgradeModal.open && portalProvider.permissions?.updatePortalMeta}
			width={520}
			header={'Go Permanent'}
			handleClose={() => props.setUpgradeModal({ open: false })}
			className={'modal-wrapper'}
		>
			{props.upgradeModal.domain && portalProvider.permissions?.updatePortalMeta && (
				<S.ModalWrapper>
					<S.ModalSection>
						<S.ModalSectionTitle>Domain</S.ModalSectionTitle>
						<S.ModalSectionContent>{props.upgradeModal.domain.name}</S.ModalSectionContent>
					</S.ModalSection>

					{/* Pay-with options (kept commented as in original) */}
					{/* {!IS_TESTNET && (
            <S.PaymentSelectorWrapper>
              <PayWithSelector
                method={props.upgradePaymentMethod}
                onChange={props.setUpgradePaymentMethod}
                arioSelectable={!!(arIOBalance && arIOBalance > 0)}
              />
            </S.PaymentSelectorWrapper>
          )} */}

					{/* Summary: total due, current balance, final balance */}
					<S.PaymentSummaryWrapper>
						<S.ModalCostSection>
							<S.ModalSectionTitle>Costs</S.ModalSectionTitle>
							<div>
								{IS_TESTNET ? (
									<S.DomainDetailLine>
										<S.ModalCostLabel>Amount</S.ModalCostLabel>
										<S.DomainDetailDivider />
										<S.ModalCostValue>
											{(() => {
												const entry = props.costsByAntId[props.upgradeModal.domain.antId]?.upgrade;
												if (!entry || entry.mario == null)
													return (
														<S.LoadingIndicator>
															<Loader xSm /> Fetching…
														</S.LoadingIndicator>
													);
												return `${toReadableARIO(entry.mario)} tario`;
											})()}
										</S.ModalCostValue>
									</S.DomainDetailLine>
								) : (
									<>
										<S.DomainDetailLine>
											<S.ModalCostLabel>Credits</S.ModalCostLabel>
											<S.DomainDetailDivider />
											<S.ModalCostValue>
												{(() => {
													const entry = props.costsByAntId[props.upgradeModal.domain.antId]?.upgrade;
													if (!entry || entry.winc == null)
														return (
															<S.LoadingIndicator>
																<Loader xSm /> Fetching…
															</S.LoadingIndicator>
														);
													const credits = `${getARAmountFromWinc(entry.winc)} Credits`;
													const usd = entry?.fiatUSD ? ` ($${entry.fiatUSD})` : '';
													return `${credits}${usd}`;
												})()}
											</S.ModalCostValue>
										</S.DomainDetailLine>
										{!!(arIOBalance && arIOBalance > 0) && (
											<S.DomainDetailLine>
												<S.ModalCostLabel>ARIO</S.ModalCostLabel>
												<S.DomainDetailDivider />
												<S.ModalCostValue>
													{(() => {
														const entry = props.costsByAntId[props.upgradeModal.domain.antId]?.upgrade;
														if (!entry || entry.mario == null)
															return (
																<S.LoadingIndicator>
																	<Loader xSm /> Fetching…
																</S.LoadingIndicator>
															);
														return `${toReadableARIO(entry.mario)} ARIO`;
													})()}
												</S.ModalCostValue>
											</S.DomainDetailLine>
										)}
									</>
								)}
							</div>
						</S.ModalCostSection>

						{(() => {
							const entry = props.costsByAntId[props.upgradeModal.domain!.antId]?.upgrade;
							const due = IS_TESTNET || props.upgradePaymentMethod === 'ario' ? entry?.mario : entry?.winc;
							const unit = IS_TESTNET ? 'tario' : props.upgradePaymentMethod === 'ario' ? 'ARIO' : 'Credits';
							const bal = IS_TESTNET || props.upgradePaymentMethod === 'ario' ? arIOBalance : arProvider.turboBalance;
							const loadingCost = entry == null || due == null;
							const loadingBal = IS_TESTNET
								? arIOBalance == null
								: props.upgradePaymentMethod === 'ario'
								? arIOBalance == null
								: arProvider.turboBalance == null;

							return (
								<PaymentSummary
									method={IS_TESTNET ? 'ario' : props.upgradePaymentMethod}
									unitLabel={unit}
									loadingCost={loadingCost}
									loadingBalance={loadingBal}
									cost={due}
									balance={bal}
								/>
							);
						})()}
					</S.PaymentSummaryWrapper>

					{/* Upgrade / Extend Actions */}
					<S.UpgradeModalActions>
						<Button
							type={'primary'}
							label={language.cancel}
							handlePress={() => props.setUpgradeModal({ open: false })}
						/>

						<InsufficientBalanceSection
							extendCost={props.extendCost}
							extendCostLoading={props.extendCostLoading}
							extendPaymentMethod={props.extendPaymentMethod}
							setShowFund={props.setShowFund}
						/>

						<Button
							type={'alt1'}
							label={language.confirm}
							handlePress={async () => {
								if (!props.upgradeModal.domain) return;
								props.setUpgradingDomains((s) => new Set([...s, props.upgradeModal.domain!.name]));
								props.setUpgradeModal({ open: false });
								try {
									const signed = await getSignedArio();
									await signed.upgradeRecord({
										name: props.upgradeModal.domain.name,
										...(IS_TESTNET ? {} : props.upgradePaymentMethod === 'turbo' ? { fundFrom: 'turbo' } : {}),
									});
									await props.pollAndHydrateAfterChange({
										name: props.upgradeModal.domain.name,
										antId: props.upgradeModal.domain.antId,
										shouldStop: (rec) => rec?.type === 'permabuy' || rec?.recordType === 'permabuy',
									});
									addNotification(language.upgradeToPermanentSuccessfully, 'success');
								} catch (e) {
									console.error('Upgrade failed:', e);
									addNotification(language.errorUpgradingRecord, 'warning');
								} finally {
									props.setUpgradingDomains((s) => {
										const next = new Set(s);
										next.delete(props.upgradeModal.domain!.name);
										return next;
									});
								}
							}}
							disabled={(() => {
								const entry = props.costsByAntId[props.upgradeModal.domain!.antId]?.upgrade;
								const due = IS_TESTNET || props.upgradePaymentMethod === 'ario' ? entry?.mario : entry?.winc;
								const bal = IS_TESTNET || props.upgradePaymentMethod === 'ario' ? arIOBalance : arProvider.turboBalance;
								return (
									due == null || bal == null || bal < due || props.upgradingDomains.has(props.upgradeModal.domain!.name)
								);
							})()}
						/>
					</S.UpgradeModalActions>
				</S.ModalWrapper>
			)}
		</Panel>
	);
};

export default PaymentInfoPanel;
