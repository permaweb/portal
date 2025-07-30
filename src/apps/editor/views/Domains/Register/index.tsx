import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ReactSVG } from 'react-svg';

import { AOProcess, ARIO, ARIO_TESTNET_PROCESS_ID, fetchAllArNSRecords } from '@ar.io/sdk';
import { connect } from '@permaweb/aoconnect';

import { ViewHeader } from 'editor/components/atoms/ViewHeader';
import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
import { FormField } from 'components/atoms/FormField';
import { IconButton } from 'components/atoms/IconButton';
import { Panel } from 'components/atoms/Panel';
import { TurboBalanceFund } from 'components/molecules/TurboBalanceFund';
import { ASSETS, URLS } from 'helpers/config';
import { getARAmountFromWinc } from 'helpers/utils';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';

export default function Domains() {
	const navigate = useNavigate();

	const arProvider = useArweaveProvider();
	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [domain, setDomain] = React.useState<string>('');

	const [registeredDomains, setRegisteredDomains] = React.useState<any>(null);
	const [domainAvailable, setDomainAvailable] = React.useState<boolean | null>(null);

	const [purchaseType, setPurchaseType] = React.useState<'buy' | 'lease' | null>(null);
	const [leaseDuration, setLeaseDuration] = React.useState<number | null>(1);

	const [turboFiatBuyAmount, setTurboFiatBuyAmount] = React.useState<string | null>(null);
	const [turboFiatLeaseAmount, setTurboFiatLeaseAmount] = React.useState<string | null>(null);
	const [turboCreditBuyAmount, setTurboCreditBuyAmount] = React.useState<number | null>(null);
	const [turboCreditLeaseAmount, setTurboCreditLeaseAmount] = React.useState<number | null>(null);

	const [insufficientBalance, setInsufficientBalance] = React.useState<boolean>(false);
	const [showFund, setShowFund] = React.useState<boolean>(false);

	React.useEffect(() => {
		(async function () {
			try {
				const domains = await fetchAllArNSRecords({});
				setRegisteredDomains(domains);
			} catch (e: any) {
				console.error(e);
			}
		})();
	}, []);

	React.useEffect(() => {
		handleClear(false);

		const trimmed = domain.trim();
		const isInvalid = !trimmed || Object.values(validateDomainName).some((v) => v === 'invalid');

		if (isInvalid) {
			setDomainAvailable(null);
			return;
		}

		setDomainAvailable(null);

		const timeoutId = setTimeout(async () => {
			try {
				const isAvailable = !registeredDomains[domain.trim()];
				setDomainAvailable(isAvailable);
			} catch {
				setDomainAvailable(null);
			}
		}, 750);

		return () => {
			clearTimeout(timeoutId);
		};
	}, [domain]);

	React.useEffect(() => {
		(async function () {
			if (domainAvailable) {
				try {
					setTurboFiatBuyAmount(null);
					setTurboCreditBuyAmount(null);
					const buyEstimate = await getPriceEstimate({ type: 'buy' });
					setTurboFiatBuyAmount(buyEstimate.fiat);
					setTurboCreditBuyAmount(buyEstimate.credits);
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
					const leaseEstimate = await getPriceEstimate({ type: 'lease', duration: leaseDuration });
					setTurboFiatLeaseAmount(leaseEstimate.fiat);
					setTurboCreditLeaseAmount(leaseEstimate.credits);
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
				purchaseAmount = turboCreditBuyAmount;
				break;
			case 'lease':
				purchaseAmount = turboCreditLeaseAmount;
				break;
		}

		setInsufficientBalance(arProvider.turboBalance < purchaseAmount);
	}, [arProvider.turboBalance, turboCreditBuyAmount, turboCreditLeaseAmount, purchaseType]);

	async function handleSubmit() {
		console.log('Buy name');

		// const arIO = ARIO.init({
		// 	paymentUrl: paymentUrl,
		// 	process: new AOProcess({
		// 		processId: ARIO_TESTNET_PROCESS_ID,
		// 		ao: connect({
		// 			CU_URL: 'https://cu.ardrive.io',
		// 			MODE: 'legacy',
		// 		}),
		// 	}),
		// });

		// const sharedOptions: any = {
		// 	intent: intent,
		// 	name: name,
		// };

		// const [leasePrice, buyPrice] = await Promise.all([
		// 	arIO.getCostDetails({
		// 		...sharedOptions,
		// 		years: 1,
		// 		type: 'lease',
		// 	}),
		// 	arIO.getCostDetails({
		// 		...sharedOptions,
		// 		type: 'permabuy',
		// 	}),
		// ]);

		// console.log(leasePrice);
		// console.log(buyPrice);

		// ${(priceList.turboFiatLease / 100).toFixed(2)}
	}

	async function getPriceEstimate(args: { type: 'lease' | 'buy'; duration?: number }) {
		const name = domain.trim().toLowerCase();
		const intent = 'Buy-Name';
		const paymentUrl = 'https://payment.ardrive.io';

		let params = '';
		switch (args.type) {
			case 'lease':
				params += 'lease';
				if (args.duration) params += `&years=${args.duration}`;
				break;
			case 'buy':
				params += 'permabuy';
				break;
		}

		const url = `${paymentUrl}/v1/arns/price/${intent}/${name}?type=${params}&currency=usd&userAddress=${arProvider.walletAddress}`;
		const response = await fetch(url);
		const json = await response.json();

		return {
			fiat: (json.fiatEstimate.paymentAmount / 100).toFixed(2),
			credits: json.winc,
		};
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

	return (
		<>
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
							<p>Step 1: Find a name</p>
							<S.SectionDivider />
						</S.SectionHeader>
						<S.SectionBody>
							<S.SearchWrapper>
								<S.SearchInputWrapper>
									<ReactSVG src={ASSETS.search} />
									<FormField
										value={domain}
										onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDomain(e.target.value)}
										placeholder={!registeredDomains ? `${language.gettingDomains}...` : language.domainName}
										invalid={{ status: false, message: null }}
										disabled={!registeredDomains}
										hideErrorMessage
										sm
									/>
								</S.SearchInputWrapper>
								{!registeredDomains && (
									<S.UpdateWrapper className={'border-wrapper-alt3'}>
										<p>{`${language.loading}...`}</p>
									</S.UpdateWrapper>
								)}
								{domainAvailable !== null && (
									<S.UpdateWrapper className={'border-wrapper-alt3'}>
										<p>{domainAvailable ? language.domainAvailable : language.domainUnavailable}</p>
										<S.Indicator status={domainAvailable ? 'valid' : 'invalid'}>
											<ReactSVG src={domainAvailable ? ASSETS.success : ASSETS.warning} />
										</S.Indicator>
									</S.UpdateWrapper>
								)}
							</S.SearchWrapper>
							<S.IndicatorWrapper>
								<S.IndicatorLine>
									<S.Indicator status={validateDomainName.maxChars}>
										{validateDomainName.maxChars && (
											<ReactSVG src={validateDomainName.maxChars === 'valid' ? ASSETS.success : ASSETS.warning} />
										)}
									</S.Indicator>
									<span>{language.arnsMaxCharsValidation}</span>
								</S.IndicatorLine>
								<S.IndicatorLine>
									<S.Indicator status={validateDomainName.specialChars}>
										{validateDomainName.specialChars && (
											<ReactSVG src={validateDomainName.specialChars === 'valid' ? ASSETS.success : ASSETS.warning} />
										)}
									</S.Indicator>
									<span>{language.arnsSpecialCharsValidation}</span>
								</S.IndicatorLine>
								<S.IndicatorLine>
									<S.Indicator status={validateDomainName.dashes}>
										{validateDomainName.dashes && (
											<ReactSVG src={validateDomainName.dashes === 'valid' ? ASSETS.success : ASSETS.warning} />
										)}
									</S.Indicator>
									<span>{language.arnsDashesValidation}</span>
								</S.IndicatorLine>
								<S.IndicatorLine>
									<S.Indicator status={validateDomainName.wwwName}>
										{validateDomainName.wwwName && (
											<ReactSVG src={validateDomainName.wwwName === 'valid' ? ASSETS.success : ASSETS.warning} />
										)}
									</S.Indicator>
									<span>{language.arnsNameValidation}</span>
								</S.IndicatorLine>
							</S.IndicatorWrapper>
						</S.SectionBody>
					</S.SectionWrapper>
					<S.SectionWrapper>
						<S.SectionHeader>
							<p>Step 2: Registration Period</p>
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
															? `$${turboFiatBuyAmount ?? '-'} USD (${getARAmountFromWinc(
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
															? `$${turboFiatLeaseAmount ?? '-'} USD (${getARAmountFromWinc(
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
														src={ASSETS.minus}
														handlePress={() => setLeaseDuration((prev) => prev - 1)}
														disabled={leaseDuration <= 1 || !domainAvailable}
														dimensions={{ wrapper: 23.5, icon: 13.5 }}
													/>
													<span>{`${leaseDuration} Years`}</span>
													<IconButton
														type={'alt1'}
														src={ASSETS.plus}
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
							<p>Step 3: Checkout</p>
							<S.SectionDivider />
						</S.SectionHeader>
						<S.SectionBody>
							<S.CheckoutWrapper>
								<S.CheckoutLine>
									<span>Domain Name:</span>
									<S.CheckoutDivider />
									<p>{domain && domainAvailable ? domain : '-'}</p>
								</S.CheckoutLine>
								<S.CheckoutLine>
									<span>Registration Period:</span>
									<S.CheckoutDivider />
									<p>
										{purchaseType
											? `${language[purchaseType]}${purchaseType === 'lease' ? ` (${leaseDuration} Years)` : ''}`
											: '-'}
									</p>
								</S.CheckoutLine>
								<S.CheckoutLine>
									<span>Total Due:</span>
									<S.CheckoutDivider />
									<p>
										{purchaseType
											? `${
													purchaseType === 'buy'
														? turboCreditBuyAmount
															? getARAmountFromWinc(turboCreditBuyAmount)
															: '-'
														: turboCreditLeaseAmount
														? getARAmountFromWinc(turboCreditLeaseAmount)
														: '-'
											  } Credits`
											: '-'}
									</p>
								</S.CheckoutLine>
								<S.CheckoutLine insufficientBalance={insufficientBalance}>
									<span>Current Balance:</span>
									<S.CheckoutDivider />
									<p>
										{arProvider.turboBalance !== null
											? `${getARAmountFromWinc(arProvider.turboBalance)} ${language?.credits}`
											: `${language?.loading}...`}
									</p>
								</S.CheckoutLine>
							</S.CheckoutWrapper>
							<S.ActionsWrapper>
								<Button
									type={'primary'}
									label={language.clear}
									handlePress={() => handleClear(true)}
									disabled={!domain}
								/>
								<Button
									type={'alt1'}
									label={insufficientBalance ? language.addCredits : language.registerDomain}
									handlePress={() => (insufficientBalance ? setShowFund(true) : handleSubmit())}
									disabled={!domainAvailable || !purchaseType}
								/>
							</S.ActionsWrapper>
							{insufficientBalance && (
								<S.InsufficientBalance className={'border-wrapper-alt3'}>
									<p>{'Insufficient Balance. Add credits to continue.'}</p>
								</S.InsufficientBalance>
							)}
						</S.SectionBody>
					</S.SectionWrapper>
				</S.BodyWrapper>
			</S.Wrapper>
			<Panel
				open={showFund}
				width={575}
				header={language?.fundTurboBalance}
				handleClose={() => setShowFund(false)}
				className={'modal-wrapper'}
			>
				<TurboBalanceFund handleClose={() => setShowFund(false)} />
			</Panel>
		</>
	);
}
