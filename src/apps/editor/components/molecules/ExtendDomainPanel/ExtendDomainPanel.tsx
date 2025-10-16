import { ArconnectSigner, ARIO } from '@ar.io/sdk';

import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
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

const ExtendDomainPanel = (props: {
	extendModal: { open: boolean; years: number; domain?: UserOwnedDomain };
	setExtendModal: React.Dispatch<React.SetStateAction<{ open: boolean; years: number; domain?: UserOwnedDomain }>>;

	extendCost: { winc: number; mario: number; fiatUSD: string | null } | null;
	extendCostLoading: boolean;

	extendPaymentMethod: 'turbo' | 'ario';
	setExtendPaymentMethod: React.Dispatch<React.SetStateAction<'turbo' | 'ario'>>;

	setShowFund: React.Dispatch<React.SetStateAction<boolean>>;

	extendingDomains: Set<string>;
	setExtendingDomains: React.Dispatch<React.SetStateAction<Set<string>>>;

	userOwnedDomains: UserOwnedDomain[];

	pollAndHydrateAfterChange: (args: {
		name: string;
		antId: string;
		previousEndTimestamp?: number;
		shouldStop?: (rec: any) => boolean;
	}) => any;
}) => {
	const portalProvider = usePortalProvider();
	const arProvider = useArweaveProvider();
	const languageProvider = useLanguageProvider();
	const { addNotification } = useNotifications();
	const { balance: arIOBalance } = useArIOBalance();
	const language: any = languageProvider.object[languageProvider.current];

	async function getSignedArio() {
		await window.arweaveWallet?.connect(['SIGN_TRANSACTION', 'ACCESS_ADDRESS', 'ACCESS_PUBLIC_KEY', 'DISPATCH']);
		const signer = new ArconnectSigner(window.arweaveWallet);
		return IS_TESTNET ? ARIO.testnet({ signer }) : ARIO.mainnet({ signer });
	}

	return (
		<Panel
			open={props.extendModal.open && portalProvider.permissions?.updatePortalMeta}
			width={520}
			header={'Extend Lease'}
			handleClose={() => props.setExtendModal({ open: false, years: 1 })}
			className={'modal-wrapper'}
		>
			{props.extendModal.domain && portalProvider.permissions?.updatePortalMeta && (
				<S.ModalWrapper>
					<S.ModalSection>
						<S.ModalSectionTitle>Domain</S.ModalSectionTitle>
						<S.ModalSectionContent>{props.extendModal.domain.name}</S.ModalSectionContent>
					</S.ModalSection>

					<S.ModalSection>
						<S.ModalSectionTitle>Years</S.ModalSectionTitle>
						<S.ModalYearSelector>
							{[1, 2, 3, 4, 5].map((y) => (
								<Button
									key={y}
									type={props.extendModal.years === y ? 'alt1' : 'primary'}
									label={`${y}`}
									handlePress={() => props.setExtendModal((p) => ({ ...p, years: y }))}
								/>
							))}
						</S.ModalYearSelector>
					</S.ModalSection>

					{/* Pay-with options */}
					{/* {!IS_TESTNET && (
            <S.PaymentSelectorWrapper>
              <PayWithSelector
                method={props.extendPaymentMethod}
                onChange={props.setExtendPaymentMethod}
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
											{props.extendCostLoading ? (
												<S.LoadingIndicator>Fetching…</S.LoadingIndicator>
											) : props.extendCost?.mario != null ? (
												`${toReadableARIO(props.extendCost.mario)} tario`
											) : (
												'—'
											)}
										</S.ModalCostValue>
									</S.DomainDetailLine>
								) : (
									<>
										<S.DomainDetailLine>
											<S.ModalCostLabel>Credits</S.ModalCostLabel>
											<S.DomainDetailDivider />
											<S.ModalCostValue>
												{props.extendCostLoading ? (
													<S.LoadingIndicator>Fetching…</S.LoadingIndicator>
												) : (
													(() => {
														const credits =
															props.extendCost?.winc != null
																? `${getARAmountFromWinc(props.extendCost.winc)} Credits`
																: '—';
														const usd = props.extendCost?.fiatUSD ? ` ($${props.extendCost.fiatUSD})` : '';
														return `${credits}${usd}`;
													})()
												)}
											</S.ModalCostValue>
										</S.DomainDetailLine>

										{!!(arIOBalance && arIOBalance > 0) && (
											<S.DomainDetailLine>
												<S.ModalCostLabel>ARIO</S.ModalCostLabel>
												<S.DomainDetailDivider />
												<S.ModalCostValue>
													{props.extendCostLoading ? (
														<S.LoadingIndicator>Fetching…</S.LoadingIndicator>
													) : props.extendCost?.mario != null ? (
														`${toReadableARIO(props.extendCost.mario)} ARIO`
													) : (
														'—'
													)}
												</S.ModalCostValue>
											</S.DomainDetailLine>
										)}
									</>
								)}
							</div>
						</S.ModalCostSection>

						{(() => {
							const due =
								IS_TESTNET || props.extendPaymentMethod === 'ario' ? props.extendCost?.mario : props.extendCost?.winc;

							const unit = IS_TESTNET ? 'tario' : props.extendPaymentMethod === 'ario' ? 'ARIO' : 'Credits';

							const bal = IS_TESTNET || props.extendPaymentMethod === 'ario' ? arIOBalance : arProvider.turboBalance;

							const loadingCost = props.extendCostLoading || due == null;
							const loadingBal = IS_TESTNET
								? arIOBalance == null
								: props.extendPaymentMethod === 'ario'
								? arIOBalance == null
								: arProvider.turboBalance == null;

							return (
								<PaymentSummary
									method={IS_TESTNET ? 'ario' : props.extendPaymentMethod}
									unitLabel={unit}
									loadingCost={loadingCost}
									loadingBalance={loadingBal}
									cost={due}
									balance={bal}
								/>
							);
						})()}
					</S.PaymentSummaryWrapper>

					{/* Actions below */}
					<S.ModalActions>
						<Button
							type={'primary'}
							label={language.cancel}
							handlePress={() => props.setExtendModal({ open: false, years: 1 })}
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
								if (!props.extendModal.domain) return;

								props.setExtendingDomains((s) => new Set([...s, props.extendModal.domain!.name]));
								props.setExtendModal({ open: false, years: 1 });

								try {
									const signed = await getSignedArio();
									await signed.extendLease({
										name: props.extendModal.domain.name,
										years: props.extendModal.years,
										...(IS_TESTNET ? {} : props.extendPaymentMethod === 'turbo' ? { fundFrom: 'turbo' } : {}),
									});

									const previousEnd =
										props.userOwnedDomains.find((d) => d.antId === props.extendModal.domain!.antId)?.endTimestamp ??
										null;

									await props.pollAndHydrateAfterChange({
										name: props.extendModal.domain.name,
										antId: props.extendModal.domain.antId,
										previousEndTimestamp: previousEnd,
									});

									addNotification(language.leaseExtendedSuccessfully, 'success');
								} catch (e) {
									console.error('Extend lease failed:', e);
									addNotification(language.errorExtendingLease, 'warning');
								} finally {
									props.setExtendingDomains((s) => {
										const next = new Set(s);
										next.delete(props.extendModal.domain!.name);
										return next;
									});
								}
							}}
							disabled={(() => {
								const due =
									IS_TESTNET || props.extendPaymentMethod === 'ario' ? props.extendCost?.mario : props.extendCost?.winc;

								const bal = IS_TESTNET || props.extendPaymentMethod === 'ario' ? arIOBalance : arProvider.turboBalance;

								return (
									due == null || bal == null || bal < due || props.extendingDomains.has(props.extendModal.domain!.name)
								);
							})()}
						/>
					</S.ModalActions>
				</S.ModalWrapper>
			)}
		</Panel>
	);
};

export default ExtendDomainPanel;
