import React from 'react';
import { ReactSVG } from 'react-svg';

import { ANT, ArconnectSigner, ARIO, fetchAllArNSRecords } from '@ar.io/sdk';

import { ViewHeader } from 'editor/components/atoms/ViewHeader';
import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
import { Checkbox } from 'components/atoms/Checkbox';
import { FormField } from 'components/atoms/FormField';
import { IconButton } from 'components/atoms/IconButton';
import { Loader } from 'components/atoms/Loader';
import { Modal } from 'components/atoms/Modal';
import { Panel } from 'components/atoms/Panel';
import { TxAddress } from 'components/atoms/TxAddress';
import { InsufficientBalanceCTA, PaymentSummary } from 'components/molecules/Payment';
import { TurboBalanceFund } from 'components/molecules/TurboBalanceFund';
import { getArnsCost } from 'helpers/arnsCosts';
import { ICONS, IS_TESTNET, URLS } from 'helpers/config';
import { PortalPatchMapEnum } from 'helpers/types';
import { getARAmountFromWinc, toReadableARIO } from 'helpers/utils';
import { useArIOBalance } from 'hooks/useArIOBalance';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';

import * as S from './styles';

export default function Domains() {
	const arProvider = useArweaveProvider();
	const portalProvider = usePortalProvider();
	const permawebProvider = usePermawebProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	// Use the ARIO balance hook for testnet/mainnet balance
	const { balance: arIOBalance, loading: arIOBalanceLoading, refetch: refetchArIOBalance } = useArIOBalance();

	const [domain, setDomain] = React.useState<string>('');
	const [loadingAvailable, setLoadingAvailable] = React.useState<boolean>(false);
	const [domainAvailable, setDomainAvailable] = React.useState<boolean | null>(null);

	const [purchaseType, setPurchaseType] = React.useState<'buy' | 'lease' | null>(null);
	const [leaseDuration, setLeaseDuration] = React.useState<number | null>(1);

	const [paymentMethod, setPaymentMethod] = React.useState<'turbo' | 'ario'>(IS_TESTNET ? 'ario' : 'turbo');

	const [turboFiatBuyAmount, setTurboFiatBuyAmount] = React.useState<string | null>(null);
	const [turboFiatLeaseAmount, setTurboFiatLeaseAmount] = React.useState<string | null>(null);
	const [turboCreditBuyAmount, setTurboCreditBuyAmount] = React.useState<number | null>(null);
	const [turboCreditLeaseAmount, setTurboCreditLeaseAmount] = React.useState<number | null>(null);
	const [arioCostBuyAmount, setArioCostBuyAmount] = React.useState<number | null>(null);
	const [arioCostLeaseAmount, setArioCostLeaseAmount] = React.useState<number | null>(null);

	const [insufficientBalance, setInsufficientBalance] = React.useState<boolean>(false);
	const [showFund, setShowFund] = React.useState<boolean>(false);

	const [purchaseSuccess, setPurchaseSuccess] = React.useState<{
		domain: string;
		transactionId: string;
		type: string;
		years?: number;
	} | null>(null);
	const [purchaseError, setPurchaseError] = React.useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

	const [showConfirm, setShowConfirm] = React.useState<boolean>(false);
	const [usePrimary, setUsePrimary] = React.useState<boolean>(true);
	const [confirmPaymentMethod, setConfirmPaymentMethod] = React.useState<'turbo' | 'ario'>(
		IS_TESTNET ? 'ario' : 'turbo'
	);

	React.useEffect(() => {
		if (showConfirm) {
			// Default to credits on mainnet; allow ARIO if user has some and previously chose it
			if (!IS_TESTNET && arIOBalance && arIOBalance > 0 && paymentMethod === 'ario') {
				setConfirmPaymentMethod('ario');
			} else {
				setConfirmPaymentMethod(IS_TESTNET ? 'ario' : 'turbo');
			}
		}
	}, [showConfirm, paymentMethod, arIOBalance]);

	// If ARIO balance becomes zero on mainnet, force payment method back to credits to avoid showing ARIO costs
	React.useEffect(() => {
		if (!IS_TESTNET && (arIOBalance == null || arIOBalance <= 0) && paymentMethod === 'ario') {
			setPaymentMethod('turbo');
		}
	}, [arIOBalance, paymentMethod]);

	const isCostReady = React.useMemo(() => {
		if (!purchaseType) return false;
		const payingWithTokens = IS_TESTNET || paymentMethod === 'ario';
		if (purchaseType === 'buy') {
			return payingWithTokens ? arioCostBuyAmount != null : turboCreditBuyAmount != null;
		}
		return payingWithTokens ? arioCostLeaseAmount != null : turboCreditLeaseAmount != null;
	}, [
		purchaseType,
		paymentMethod,
		arioCostBuyAmount,
		arioCostLeaseAmount,
		turboCreditBuyAmount,
		turboCreditLeaseAmount,
	]);

	function getUnitLabelForMethod(method: 'turbo' | 'ario'): 'ARIO' | 'tario' | 'Credits' {
		if (IS_TESTNET) return 'tario';
		return method === 'ario' ? 'ARIO' : 'Credits';
	}

	React.useEffect(() => {
		handleClear(false);

		const trimmed = domain.trim();
		const isInvalid = !trimmed || Object.values(validateDomainName).some((v) => v === 'invalid');

		if (isInvalid) {
			setDomainAvailable(null);
			return;
		}

		setDomainAvailable(null);

		const timer = setTimeout(async () => {
			setLoadingAvailable(true);
			try {
				const ario = IS_TESTNET ? ARIO.testnet() : ARIO.mainnet();
				const record = await ario.getArNSRecord({ name: domain });

				setDomainAvailable(!record);
			} catch (err) {
				console.error('Failed to fetch record:', err);
			}
			setLoadingAvailable(false);
		}, 750);

		return () => clearTimeout(timer);
	}, [domain]);

	React.useEffect(() => {
		(async function () {
			if (domainAvailable) {
				try {
					setTurboFiatBuyAmount(null);
					setTurboCreditBuyAmount(null);
					setArioCostBuyAmount(null);
					const buyEstimate = await getPriceEstimate({ type: 'buy' });
					setTurboFiatBuyAmount(buyEstimate.fiat);
					setTurboCreditBuyAmount(buyEstimate.credits);
					setArioCostBuyAmount(buyEstimate.mario);
				} catch (e: any) {
					console.error(e);
				}
			}
		})();
	}, [domainAvailable]);

	React.useEffect(() => {
		(async function () {
			if (domainAvailable) {
				try {
					setTurboFiatLeaseAmount(null);
					setTurboCreditLeaseAmount(null);
					setArioCostLeaseAmount(null);
					const leaseEstimate = await getPriceEstimate({ type: 'lease', duration: leaseDuration });
					setTurboFiatLeaseAmount(leaseEstimate.fiat);
					setTurboCreditLeaseAmount(leaseEstimate.credits);
					setArioCostLeaseAmount(leaseEstimate.mario);
				} catch (e: any) {
					console.error(e);
				}
			}
		})();
	}, [domainAvailable, leaseDuration]);

	React.useEffect(() => {
		if (!purchaseType) return;

		let purchaseAmount: number;

		switch (purchaseType) {
			case 'buy':
				purchaseAmount = IS_TESTNET || paymentMethod === 'ario' ? arioCostBuyAmount : turboCreditBuyAmount;
				break;
			case 'lease':
				purchaseAmount = IS_TESTNET || paymentMethod === 'ario' ? arioCostLeaseAmount : turboCreditLeaseAmount;
				break;
		}

		// Choose balance based on selected payment method / network
		const currentBalance =
			IS_TESTNET || paymentMethod === 'ario' ? arIOBalance : Number(arProvider.turboBalanceObj.effectiveBalance);
		setInsufficientBalance((currentBalance ?? 0) < (purchaseAmount ?? 0));
	}, [
		arIOBalance,
		arProvider.turboBalanceObj,
		turboCreditBuyAmount,
		turboCreditLeaseAmount,
		arioCostBuyAmount,
		arioCostLeaseAmount,
		purchaseType,
		paymentMethod,
	]);

	const unauthorized = !portalProvider.permissions?.updatePortalMeta;

	async function handleSubmit(methodOverride?: 'turbo' | 'ario') {
		if (unauthorized) {
			console.error('User is not authorized to register domains for this portal');
			return;
		}

		if (!purchaseType || !domain.trim() || !domainAvailable) {
			console.error('Invalid purchase parameters');
			return;
		}

		setIsSubmitting(true);
		setPurchaseError(null);
		setPurchaseSuccess(null);

		try {
			console.log(`Purchasing domain: ${domain.trim()} with type: ${purchaseType}`);

			// Check if wallet is connected
			if (!window.arweaveWallet) {
				throw new Error('ArConnect wallet not detected. Please install and connect ArConnect.');
			}

			if (!arProvider.walletAddress) {
				throw new Error('Wallet not connected. Please connect your wallet first.');
			}

			// Ensure the user has the required permissions including DISPATCH for AO operations
			try {
				await window.arweaveWallet.connect(['SIGN_TRANSACTION', 'ACCESS_ADDRESS', 'ACCESS_PUBLIC_KEY']);
			} catch (permError) {
				console.warn('Permission request failed, proceeding with existing permissions');
			}

			// Use simplified SDK initialization as per documentation
			let arIO;
			try {
				// Initialize signer with just the wallet (simpler approach)
				const signer = new ArconnectSigner(window.arweaveWallet);

				// Use the simplified ARIO initialization based on testnet/mainnet
				if (IS_TESTNET) {
					arIO = ARIO.testnet({ signer });
				} else {
					arIO = ARIO.mainnet({ signer });
				}
			} catch (signerError) {
				console.error('Error initializing ArconnectSigner:', signerError);
				throw new Error('Failed to initialize wallet signer. Please ensure ArConnect is properly connected.');
			}

			const name = domain.trim().toLowerCase();

			console.log('Attempting to purchase domain:', {
				name,
				type: purchaseType,
				years: purchaseType === 'lease' ? leaseDuration : undefined,
			});

			// Use the correct buyRecord API according to ar.io SDK documentation
			let result;
			try {
				console.log('Calling buyRecord with parameters:', {
					name,
					type: purchaseType,
					years: purchaseType === 'lease' ? leaseDuration : undefined,
					referrer: 'portal.arweave.net',
				});

				const payWith: 'turbo' | 'ario' = IS_TESTNET ? 'ario' : methodOverride ?? paymentMethod;
				const baseArgs: any = {
					name,
					referrer: 'portal.arweave.net',
				};
				if (purchaseType === 'lease') {
					result = await arIO.buyRecord({
						...baseArgs,
						type: 'lease',
						years: leaseDuration,
						...(payWith === 'turbo' ? { fundFrom: 'turbo' } : {}),
					});
				} else {
					result = await arIO.buyRecord({
						...baseArgs,
						type: 'permabuy',
						...(payWith === 'turbo' ? { fundFrom: 'turbo' } : {}),
					});
				}
			} catch (buyRecordError) {
				console.error('buyRecord failed:', buyRecordError);
				console.error('Error stack:', buyRecordError.stack);

				// Check if this is the ArrayBuffer error specifically
				if (buyRecordError.message?.includes('ArrayBuffer')) {
					throw new Error(`ANT creation failed: ${buyRecordError.message}`);
				}

				throw buyRecordError;
			}

			console.log('Purchase result:', result);

			// Refresh the ARIO balance after purchase
			refetchArIOBalance();

			// Automatically set '@' base record to current portal id after successful registration
			try {
				// Resolve the ANT process id for the purchased name with targeted polling
				const resolveProcessId = async (nameToResolve: string): Promise<string | null> => {
					const arioClient = IS_TESTNET ? ARIO.testnet() : ARIO.mainnet();
					for (let attempt = 0; attempt < 10; attempt++) {
						try {
							// Prefer direct record lookup (faster than fetching all)
							const record: any = await arioClient.getArNSRecord({ name: nameToResolve });
							if (record && typeof record.processId === 'string' && record.processId.length > 10) {
								return record.processId;
							}
						} catch {
							// ignore and retry
						}

						// Fallback to a broad scan if direct lookup fails to materialize
						try {
							const all = await fetchAllArNSRecords({ contract: arioClient });
							const entry = all?.[nameToResolve];
							if (entry) {
								if (typeof entry === 'string') return entry;
								if (typeof entry === 'object' && 'processId' in entry) return (entry as any).processId || null;
							}
						} catch {}

						// wait before next attempt (3s x 10 = 30s total)
						await new Promise((r) => setTimeout(r, 3000));
					}
					return null;
				};

				const purchasedName = domain.trim().toLowerCase();
				const antProcessId = await resolveProcessId(purchasedName);
				if (antProcessId && portalProvider.current?.id) {
					const ant = ANT.init({ processId: antProcessId, signer: new ArconnectSigner(window.arweaveWallet) });
					// Update base name record ("@") using the dedicated API
					await ant.setBaseNameRecord({
						transactionId: portalProvider.current.id,
						ttlSeconds: 60,
					});
					console.log(`Set '@' record for ${purchasedName} to portal ${portalProvider.current.id}`);
				} else {
					console.warn('Unable to resolve ANT process id or missing portal id. Skipping auto-redirect.');
				}
			} catch (redirectErr) {
				console.error('Auto-redirect after purchase failed:', redirectErr);
			}

			const current = portalProvider.current?.domains ?? [];

			let next: PortalDomainType[];

			/* Remove the current primary flag from other domains if this domain is set to use primary */
			if (usePrimary) {
				const hadName = current.some((d) => d.name === name);

				next = current.map<PortalDomainType>(
					(d) => (d.name === name ? { name, primary: true } : { name: d.name }) // keep name, drop primary
				);

				if (!hadName) next.push({ name, primary: true });
			} else {
				const withoutDup = current.filter((d) => d.name !== name);
				next = [...withoutDup, { name }];
			}

			const domainUpdateId = await permawebProvider.libs.updateZone(
				{ Domains: permawebProvider.libs.mapToProcessCase(next) },
				portalProvider.current.id,
				arProvider.wallet
			);

			portalProvider.refreshCurrentPortal(PortalPatchMapEnum.Navigation);

			console.log(`Domain update: ${domainUpdateId}`);

			// Set success state
			setPurchaseSuccess({
				domain: name,
				transactionId: result.id || language.pending,
				type: purchaseType,
				years: purchaseType === 'lease' ? leaseDuration : undefined,
			});

			// Clear form
			setDomain('');
			setPurchaseType(null);
		} catch (error: any) {
			console.error('Error purchasing domain:', error);

			// Provide more helpful error messages for common issues
			let errorMessage = error.message || 'Unknown error';
			if (errorMessage.includes('insufficient')) {
				errorMessage = 'Insufficient balance to complete the purchase.';
			} else if (errorMessage.includes('already')) {
				errorMessage = 'This domain is already registered.';
			} else if (errorMessage.includes('ArrayBuffer')) {
				errorMessage = 'Transaction signing failed. Please ensure ArConnect is updated and try again.';
			} else if (errorMessage.includes('User denied')) {
				errorMessage = 'Transaction was cancelled by user.';
			} else if (errorMessage.includes('not connected')) {
				errorMessage = 'Wallet not connected. Please connect your ArConnect wallet and try again.';
			}

			setPurchaseError(errorMessage);
		} finally {
			setIsSubmitting(false);
		}
	}

	async function getPriceEstimate(args: { type: 'lease' | 'buy'; duration?: number }) {
		const name = domain.trim().toLowerCase();
		const isLease = args.type === 'lease';
		const years = isLease && args.duration ? args.duration : undefined;
		try {
			const res = await getArnsCost({
				intent: 'Buy-Name',
				name,
				type: isLease ? 'lease' : 'permabuy',
				years,
			});
			return {
				fiat: res.fiatUSD ?? 'N/A',
				credits: res.winc ?? 0,
				mario: res.mario ?? 0,
			};
		} catch (error) {
			console.error('Error getting price via helper:', error);
			return { fiat: 'N/A', credits: 0, mario: 0 };
		}
	}

	const validateDomainName = React.useMemo(() => {
		if (!domain.trim()) {
			return {
				dashes: null,
				maxChars: null,
				wwwName: null,
				specialChars: null,
				available: null,
			};
		}

		const trimmedValue = domain.trim();

		const hasLeadingOrTrailingDashes = trimmedValue.startsWith('-') || trimmedValue.endsWith('-');
		const exceedsMaxChars = trimmedValue.length > 51;
		const isWwwName = trimmedValue.toLowerCase() === 'www';
		const hasSpecialChars = !/^[a-zA-Z0-9-]+$/.test(trimmedValue);

		return {
			dashes: hasLeadingOrTrailingDashes ? 'invalid' : 'valid',
			maxChars: exceedsMaxChars ? 'invalid' : 'valid',
			wwwName: isWwwName ? 'invalid' : 'valid',
			specialChars: hasSpecialChars ? 'invalid' : 'valid',
		};
	}, [domain]);

	function handleClear(clearDomain: boolean) {
		if (clearDomain) setDomain('');

		setDomainAvailable(null);
		setPurchaseType(null);
		setTurboFiatBuyAmount(null);
		setTurboFiatLeaseAmount(null);
		setTurboCreditBuyAmount(null);
		setTurboCreditLeaseAmount(null);
		setInsufficientBalance(false);
	}

	// Compute Total Due display string for checkout
	function getTotalDueText(): string {
		if (!purchaseType) return '-';
		const isBuy = purchaseType === 'buy';
		if (IS_TESTNET) {
			const mario = isBuy ? arioCostBuyAmount : arioCostLeaseAmount;
			return mario != null ? `${toReadableARIO(mario)} tario` : '-';
		}
		if (paymentMethod === 'ario') {
			const mario = isBuy ? arioCostBuyAmount : arioCostLeaseAmount;
			return mario != null ? `${toReadableARIO(mario)} ARIO` : '-';
		}
		const credits = isBuy ? turboCreditBuyAmount : turboCreditLeaseAmount;
		return credits != null ? `${getARAmountFromWinc(credits)} Credits` : '-';
	}

	return (
		<>
			{isSubmitting && <Loader message={language.registeringProgress} />}
			<S.Wrapper className={'fade-in'}>
				<ViewHeader
					header={language?.domainRegistration}
					actions={[
						<Button type={'primary'} label={language?.goBack} link={URLS.portalDomains(portalProvider.current?.id)} />,
					]}
				/>
				<S.BodyWrapper>
					<S.SectionWrapper>
						<S.SectionHeader>
							<p>{language.domainRegistrationStep1}</p>
							<S.SectionDivider />
						</S.SectionHeader>
						<S.SectionBody>
							<S.SearchWrapper>
								<S.SearchInputWrapper>
									<ReactSVG src={ICONS.search} />
									<FormField
										value={domain}
										onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDomain(e.target.value)}
										placeholder={language.domainName}
										invalid={{ status: false, message: null }}
										disabled={unauthorized}
										hideErrorMessage
										sm
									/>
								</S.SearchInputWrapper>
								<S.SearchOutputWrapper>
									{loadingAvailable && (
										<S.UpdateWrapper className={'border-wrapper-alt3'}>
											<p>{`${language.loading}...`}</p>
										</S.UpdateWrapper>
									)}
									{domainAvailable !== null && (
										<S.UpdateWrapperIndicator
											className={'border-wrapper-alt3'}
											status={domainAvailable ? 'valid' : 'invalid'}
										>
											<p>{domainAvailable ? language.domainAvailable : language.domainUnavailable}</p>
											<S.Indicator status={domainAvailable ? 'valid' : 'invalid'}>
												<ReactSVG src={domainAvailable ? ICONS.success : ICONS.warning} />
											</S.Indicator>
										</S.UpdateWrapperIndicator>
									)}
									{unauthorized && (
										<S.UnauthorizedWrapper className={'warning'}>
											<span>{language.unauthorizedDomainRegister}</span>
										</S.UnauthorizedWrapper>
									)}
								</S.SearchOutputWrapper>
							</S.SearchWrapper>
							<S.IndicatorWrapper>
								<S.IndicatorLine>
									<S.Indicator status={validateDomainName.maxChars}>
										{validateDomainName.maxChars && (
											<ReactSVG src={validateDomainName.maxChars === 'valid' ? ICONS.success : ICONS.warning} />
										)}
									</S.Indicator>
									<span>{language.arnsMaxCharsValidation}</span>
								</S.IndicatorLine>
								<S.IndicatorLine>
									<S.Indicator status={validateDomainName.specialChars}>
										{validateDomainName.specialChars && (
											<ReactSVG src={validateDomainName.specialChars === 'valid' ? ICONS.success : ICONS.warning} />
										)}
									</S.Indicator>
									<span>{language.arnsSpecialCharsValidation}</span>
								</S.IndicatorLine>
								<S.IndicatorLine>
									<S.Indicator status={validateDomainName.dashes}>
										{validateDomainName.dashes && (
											<ReactSVG src={validateDomainName.dashes === 'valid' ? ICONS.success : ICONS.warning} />
										)}
									</S.Indicator>
									<span>{language.arnsDashesValidation}</span>
								</S.IndicatorLine>
								<S.IndicatorLine>
									<S.Indicator status={validateDomainName.wwwName}>
										{validateDomainName.wwwName && (
											<ReactSVG src={validateDomainName.wwwName === 'valid' ? ICONS.success : ICONS.warning} />
										)}
									</S.Indicator>
									<span>{language.arnsNameValidation}</span>
								</S.IndicatorLine>
							</S.IndicatorWrapper>
						</S.SectionBody>
					</S.SectionWrapper>
					<S.SectionWrapper>
						<S.SectionHeader>
							<p>{language.domainRegistrationStep2}</p>
							<S.SectionDivider />
						</S.SectionHeader>
						<S.SectionBody>
							<S.PurchaseActionsWrapper>
								<S.PurchaseActionWrapper>
									<S.PurchaseAction
										onClick={() => setPurchaseType('buy')}
										active={purchaseType === 'buy'}
										disabled={!domainAvailable}
									>
										<S.PurchaseActionLine>
											<p>{language.buy}</p>
											{(domainAvailable || turboFiatBuyAmount) && (
												<S.UpdateWrapper>
													<p>
														{turboFiatBuyAmount
															? IS_TESTNET
																? `${toReadableARIO(arioCostBuyAmount)} tario`
																: paymentMethod === 'ario'
																? `${toReadableARIO(arioCostBuyAmount)} ARIO`
																: `$${turboFiatBuyAmount ?? '-'} USD (${getARAmountFromWinc(
																		turboCreditBuyAmount
																  )} Credits)`
															: `${language.fetchingPrices}...`}
													</p>
												</S.UpdateWrapper>
											)}
										</S.PurchaseActionLine>
										<S.PurchaseActionLine>
											<span>{language.arnsBuyDescription}</span>
										</S.PurchaseActionLine>
									</S.PurchaseAction>
								</S.PurchaseActionWrapper>
								<S.PurchaseActionWrapper>
									<S.PurchaseAction
										onClick={() => setPurchaseType('lease')}
										active={purchaseType === 'lease'}
										disabled={!domainAvailable}
									>
										<S.PurchaseActionLine>
											<p>{language.lease}</p>
											{(domainAvailable || turboFiatLeaseAmount) && (
												<S.UpdateWrapper>
													<p>
														{turboFiatLeaseAmount
															? IS_TESTNET
																? `${toReadableARIO(arioCostLeaseAmount)} tario`
																: paymentMethod === 'ario'
																? `${toReadableARIO(arioCostLeaseAmount)} ARIO`
																: `$${turboFiatLeaseAmount ?? '-'} USD (${getARAmountFromWinc(
																		turboCreditLeaseAmount
																  )} Credits)`
															: `${language.fetchingPrices}...`}
													</p>
												</S.UpdateWrapper>
											)}
										</S.PurchaseActionLine>
										<S.PurchaseActionLine>
											<span>{language.arnsLeaseDescription}</span>
											{domainAvailable && (
												<S.LeaseDuration active={purchaseType === 'lease'}>
													<IconButton
														type={'alt1'}
														src={ICONS.minus}
														handlePress={() => setLeaseDuration((prev) => prev - 1)}
														disabled={leaseDuration <= 1 || !domainAvailable}
														dimensions={{ wrapper: 23.5, icon: 13.5 }}
													/>
													<span>{`${leaseDuration} ${leaseDuration === 1 ? language.year : language.years}`}</span>
													<IconButton
														type={'alt1'}
														src={ICONS.plus}
														handlePress={() => setLeaseDuration((prev) => prev + 1)}
														disabled={leaseDuration >= 5 || !domainAvailable}
														dimensions={{ wrapper: 23.5, icon: 13.5 }}
													/>
												</S.LeaseDuration>
											)}
										</S.PurchaseActionLine>
									</S.PurchaseAction>
								</S.PurchaseActionWrapper>
							</S.PurchaseActionsWrapper>
						</S.SectionBody>
					</S.SectionWrapper>
					<S.SectionWrapper>
						<S.SectionHeader>
							<p>{language.domainRegistrationStep3}</p>
							<S.SectionDivider />
						</S.SectionHeader>
						<S.SectionBody>
							{/* Payment method selection (mainnet only) */}
							{/* {!IS_TESTNET && (
								<S.PaymentMethodWrapper>
									<PayWithSelector
										method={paymentMethod}
										onChange={setPaymentMethod}
										arioSelectable={!!(arIOBalance && arIOBalance > 0)}
										labels={{
											title: language.choosePayment,
											credits: `${language.credits}${turboFiatBuyAmount || turboFiatLeaseAmount ? ' (USD)' : ''}`,
											ario: language.arioToken,
										}}
									/>
								</S.PaymentMethodWrapper>
							)} */}
							<S.CheckoutWrapper>
								<S.CheckoutLine>
									<span>{language.checkoutDomainName}</span>
									<S.CheckoutDivider />
									<p>{domain && domainAvailable ? domain : '-'}</p>
								</S.CheckoutLine>
								<S.CheckoutLine>
									<span>{language.registrationPeriod}</span>
									<S.CheckoutDivider />
									<p>
										{purchaseType
											? `${language[purchaseType]}${
													purchaseType === 'lease'
														? ` (${leaseDuration} ${leaseDuration === 1 ? language.year : language.years})`
														: ''
											  }`
											: '-'}
									</p>
								</S.CheckoutLine>
								<S.CheckoutLine>
									<span>{language.checkoutTotalDue}</span>
									<S.CheckoutDivider />
									<p>{getTotalDueText()}</p>
								</S.CheckoutLine>
								<S.CheckoutLine insufficientBalance={insufficientBalance}>
									<span>{language.checkoutCurrentBalance}</span>
									<S.CheckoutDivider />
									<p>
										{IS_TESTNET
											? arIOBalance !== null && !arIOBalanceLoading
												? `${toReadableARIO(arIOBalance)} tario`
												: `${language?.loading}...`
											: paymentMethod === 'ario'
											? arIOBalance !== null && !arIOBalanceLoading
												? `${toReadableARIO(arIOBalance)} ARIO`
												: `${language?.loading}...`
											: arProvider.turboBalanceObj.effectiveBalance
											? `${getARAmountFromWinc(Number(arProvider.turboBalanceObj.effectiveBalance))} ${
													language?.credits
											  }`
											: `${language?.loading}...`}
									</p>
								</S.CheckoutLine>
							</S.CheckoutWrapper>
							<S.ActionsWrapper>
								<Button
									type={'primary'}
									label={language.clear}
									handlePress={() => handleClear(true)}
									disabled={!domain || loadingAvailable}
								/>
								<Button
									type={'alt1'}
									label={
										isSubmitting
											? language.registeringProgress
											: IS_TESTNET
											? insufficientBalance
												? language.getTestnetTokens
												: language.registerDomain
											: paymentMethod === 'turbo'
											? insufficientBalance
												? language.addCredits
												: language.registerDomain
											: insufficientBalance
											? language.getTokens
											: language.registerDomain
									}
									handlePress={() => {
										if (IS_TESTNET) {
											return insufficientBalance ? setShowFund(true) : setShowConfirm(true);
										}
										if (paymentMethod === 'turbo') {
											return insufficientBalance ? setShowFund(true) : setShowConfirm(true);
										}
										if (paymentMethod === 'ario') {
											if (insufficientBalance) {
												window.open(
													'https://botega.arweave.net/#/swap?to=qNvAoz0TgcH7DMg8BCVn8jF32QH5L6T29VjHxhHqqGE',
													'_blank'
												);
												return;
											}
											return setShowConfirm(true);
										}
									}}
									disabled={!domainAvailable || !purchaseType || isSubmitting || !isCostReady}
								/>
							</S.ActionsWrapper>
							{insufficientBalance && (
								<S.InsufficientBalance className={'border-wrapper-alt3'}>
									<p>{IS_TESTNET ? language.insufficientTarioBalance : language.insufficientBalance}</p>
								</S.InsufficientBalance>
							)}
							{purchaseSuccess && (
								<Modal
									header={language.domainRegistrationSuccessful}
									handleClose={() => setPurchaseSuccess(null)}
									status={'success'}
									className={'modal-wrapper'}
								>
									<S.SuccessWrapper>
										<S.SuccessLine>
											<S.SuccessLabel>Domain:</S.SuccessLabel>
											<S.SuccessDivider />
											<S.SuccessValue>{purchaseSuccess?.domain ?? '-'}</S.SuccessValue>
										</S.SuccessLine>
										<S.SuccessLine>
											<S.SuccessLabel>Type:</S.SuccessLabel>
											<S.SuccessDivider />
											<S.SuccessValue>
												{purchaseSuccess.type === 'lease'
													? `Lease (${purchaseSuccess.years} year${purchaseSuccess.years !== 1 ? 's' : ''})`
													: 'Permanent'}
											</S.SuccessValue>
										</S.SuccessLine>
										<S.SuccessLine>
											<S.SuccessLabel>{language.transactionId}:</S.SuccessLabel>
											<S.SuccessDivider />
											<S.SuccessValue>
												<TxAddress address={purchaseSuccess.transactionId} wrap={false} />
											</S.SuccessValue>
										</S.SuccessLine>
										<S.SuccessActions>
											<Button type={'primary'} label={language.close} handlePress={() => setPurchaseSuccess(null)} />
											<Button
												type={'alt1'}
												label={language.goToDomain}
												handlePress={() => window.open(`https://${purchaseSuccess.domain}.arweave.net`)}
											/>
										</S.SuccessActions>
									</S.SuccessWrapper>
								</Modal>
							)}
							{purchaseError && (
								<Modal
									header={language.registrationFailed}
									handleClose={() => setPurchaseSuccess(null)}
									status={'warning'}
									className={'modal-wrapper'}
								>
									<S.ErrorWrapper>
										<S.ErrorValue>{purchaseError ?? '-'}</S.ErrorValue>
									</S.ErrorWrapper>
									<S.ErrorActions>
										<Button
											type={'primary'}
											label={language.registerErrorRetry}
											handlePress={() => setPurchaseError(null)}
										/>
									</S.ErrorActions>
								</Modal>
							)}
						</S.SectionBody>
					</S.SectionWrapper>
				</S.BodyWrapper>
			</S.Wrapper>
			{showConfirm && (
				<Modal
					header={language.confirmRegistration}
					handleClose={() => setShowConfirm(false)}
					className={'modal-wrapper'}
				>
					<S.ModalWrapper>
						<S.ModalGrid>
							<S.ModalLine>
								<S.ModalLabel>{language.checkoutDomainName}</S.ModalLabel>
								<S.ModalDivider />
								<S.ModalValue>{domain?.trim() || '-'}</S.ModalValue>
							</S.ModalLine>
							<S.ModalLine>
								<S.ModalLabel>{language.checkoutRegistrationPeriod}</S.ModalLabel>
								<S.ModalDivider />
								<S.ModalValue className={'uppercase'}>
									{purchaseType === 'lease'
										? `${language.lease} (${leaseDuration} ${leaseDuration === 1 ? language.year : language.years})`
										: language.permanent}
								</S.ModalValue>
							</S.ModalLine>
							{/* {!IS_TESTNET && (
								<S.ModalLine>
									<S.ModalLabel>{language.fundTurboPaymentHeader}</S.ModalLabel>
									<S.ModalDivider />
									<S.ModalValue>
										<PayWithSelector
											method={confirmPaymentMethod}
											onChange={setConfirmPaymentMethod}
											arioSelectable={!!(arIOBalance && arIOBalance > 0)}
										/>
									</S.ModalValue>
								</S.ModalLine>
							)} */}
							<S.PaymentSummaryWrapper>
								{(() => {
									const payTokens = IS_TESTNET || confirmPaymentMethod === 'ario';
									const due = !purchaseType
										? null
										: purchaseType === 'buy'
										? payTokens
											? arioCostBuyAmount
											: turboCreditBuyAmount
										: payTokens
										? arioCostLeaseAmount
										: turboCreditLeaseAmount;
									const loadingCost =
										!purchaseType ||
										(purchaseType === 'buy'
											? payTokens
												? arioCostBuyAmount == null
												: turboCreditBuyAmount == null
											: payTokens
											? arioCostLeaseAmount == null
											: turboCreditLeaseAmount == null);
									const bal =
										confirmPaymentMethod === 'ario' ? arIOBalance : Number(arProvider.turboBalanceObj.effectiveBalance);
									const loadingBal = IS_TESTNET
										? arIOBalance == null || arIOBalanceLoading
										: confirmPaymentMethod === 'ario'
										? arIOBalance == null || arIOBalanceLoading
										: arProvider.turboBalanceObj.effectiveBalance == null;

									return (
										<PaymentSummary
											method={IS_TESTNET ? 'ario' : confirmPaymentMethod}
											unitLabel={getUnitLabelForMethod(confirmPaymentMethod)}
											loadingCost={!!loadingCost}
											loadingBalance={!!loadingBal}
											cost={due}
											balance={bal}
										/>
									);
								})()}
							</S.PaymentSummaryWrapper>
						</S.ModalGrid>
						<S.ModalPrimaryNameWrapper active={usePrimary} onClick={() => setUsePrimary((prev) => !prev)}>
							<span>Set as primary domain</span>
							<Checkbox checked={usePrimary} disabled={false} handleSelect={() => setUsePrimary((prev) => !prev)} />
						</S.ModalPrimaryNameWrapper>
						<S.ModalPrimaryNameDescription>
							<span>
								* This will set the default domain for this portal. When clicking 'Go To Site' from the editor, you will
								be sent to this domain. Existing domains will still point to this portal.
							</span>
						</S.ModalPrimaryNameDescription>
						<S.ModalActions>
							<InsufficientBalanceCTA
								method={IS_TESTNET ? 'ario' : confirmPaymentMethod}
								insufficient={(() => {
									const bal =
										confirmPaymentMethod === 'ario' ? arIOBalance : Number(arProvider.turboBalanceObj.effectiveBalance);
									const due =
										confirmPaymentMethod === 'ario'
											? purchaseType === 'buy'
												? arioCostBuyAmount
												: arioCostLeaseAmount
											: purchaseType === 'buy'
											? turboCreditBuyAmount
											: turboCreditLeaseAmount;
									return !(due != null && bal != null && bal >= due);
								})()}
								isLoading={(() => {
									const payTokens = IS_TESTNET || confirmPaymentMethod === 'ario';
									const loadingCost =
										!purchaseType ||
										(purchaseType === 'buy'
											? payTokens
												? arioCostBuyAmount == null
												: turboCreditBuyAmount == null
											: payTokens
											? arioCostLeaseAmount == null
											: turboCreditLeaseAmount == null);
									const loadingBal = IS_TESTNET
										? arIOBalance == null || arIOBalanceLoading
										: confirmPaymentMethod === 'ario'
										? arIOBalance == null || arIOBalanceLoading
										: arProvider.turboBalanceObj.effectiveBalance == null;
									return loadingCost || loadingBal;
								})()}
								onGetTokens={() =>
									window.open(
										'https://botega.arweave.net/#/swap?to=qNvAoz0TgcH7DMg8BCVn8jF32QH5L6T29VjHxhHqqGE',
										'_blank'
									)
								}
								onAddCredits={() => setShowFund(true)}
							/>
							<Button type={'primary'} label={language?.cancel} handlePress={() => setShowConfirm(false)} />
							<Button
								type={'alt1'}
								label={isSubmitting ? language.registeringProgress : language.registerDomain}
								handlePress={() => {
									setShowConfirm(false);
									handleSubmit(confirmPaymentMethod);
								}}
								disabled={(() => {
									if (isSubmitting) return true;
									if (!purchaseType) return true;
									const due =
										confirmPaymentMethod === 'ario'
											? purchaseType === 'buy'
												? arioCostBuyAmount
												: arioCostLeaseAmount
											: purchaseType === 'buy'
											? turboCreditBuyAmount
											: turboCreditLeaseAmount;
									const bal =
										confirmPaymentMethod === 'ario' ? arIOBalance : Number(arProvider.turboBalanceObj.effectiveBalance);
									if (due == null || bal == null) return true;
									return bal < due;
								})()}
							/>
						</S.ModalActions>
					</S.ModalWrapper>
				</Modal>
			)}
			<Panel
				open={showFund}
				width={575}
				header={IS_TESTNET ? language.getTestnetTokens : language?.fundTurboBalance}
				handleClose={() => setShowFund(false)}
				className={'modal-wrapper'}
			>
				{IS_TESTNET ? (
					<S.TestnetInfo>
						<p>{language.testnetMode}</p>
						<a href={'https://faucet.arweave.net'} target={'_blank'}>
							{language.visitFaucet}
						</a>
						<Button
							type={'primary'}
							label={language.close}
							handlePress={() => setShowFund(false)}
							height={45}
							fullWidth
						/>
					</S.TestnetInfo>
				) : (
					<TurboBalanceFund handleClose={() => setShowFund(false)} />
				)}
			</Panel>
		</>
	);
}
