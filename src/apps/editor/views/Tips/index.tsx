import React from 'react';
import { useNavigate } from 'react-router-dom';

import { ViewHeader } from 'editor/components/atoms/ViewHeader';
import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
import { Checkbox } from 'components/atoms/Checkbox';
import { FormField } from 'components/atoms/FormField';
import { Loader } from 'components/atoms/Loader';
import { Pagination } from 'components/atoms/Pagination';
import { Select } from 'components/atoms/Select';
import { Toggle } from 'components/atoms/Toggle';
import { TxAddress } from 'components/atoms/TxAddress';
import { TIP_TOKEN_OPTIONS, URLS } from 'helpers/config';
import {
	formatAmountDisplay,
	fromBaseUnits,
	normalizeTipTokens,
	parseTipTags,
	tokensToMonetizationConfig,
} from 'helpers/tokens';
import {
	MonetizationConfig,
	PageBlockEnum,
	PageSectionEnum,
	PortalPatchMapEnum,
	SelectOptionType,
	TipRow,
} from 'helpers/types';
import { checkValidAddress, debugLog } from 'helpers/utils';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { useNotifications } from 'providers/NotificationProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';

import * as S from './styles';

const DEFAULT_TOKEN_DECIMALS = 12;
const MAX_TIP_TOKENS = 3;
const DEFAULT_MONETIZATION_TOKEN = {
	tokenType: 'AR' as const,
	tokenAddress: 'AR',
	tokenSymbol: 'AR',
	tokenDecimals: DEFAULT_TOKEN_DECIMALS,
};

const normalizeMonetizationConfig = (config: MonetizationConfig, ownerWallet: string): MonetizationConfig => {
	const normalizedTokens = normalizeTipTokens(config);
	const primaryToken = normalizedTokens[0];

	return {
		enabled: !!config.enabled,
		walletAddress: config.walletAddress || ownerWallet,
		tokenAddress: primaryToken.type === 'AR' ? 'AR' : primaryToken.processId || '',
		tokenSymbol: primaryToken.symbol,
		tokenDecimals: primaryToken.decimals,
		tokenType: primaryToken.type,
		tipTokens: tokensToMonetizationConfig(normalizedTokens),
	};
};

export default function Tips() {
	const navigate = useNavigate();

	const portalProvider = usePortalProvider();
	const arProvider = useArweaveProvider();
	const permawebProvider = usePermawebProvider();
	const { addNotification } = useNotifications();

	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const ownerWallet = (portalProvider.current as any)?.ownerWallet || (portalProvider.current as any)?.owner || '';
	const existingMonetization =
		((portalProvider.current as any)?.monetization?.monetization as MonetizationConfig | undefined) ||
		((portalProvider.current as any)?.Monetization as MonetizationConfig | undefined);
	const [savingMonetization, setSavingMonetization] = React.useState(false);
	const [profileCache, setProfileCache] = React.useState<Record<string, any>>({});
	const [monetization, setMonetization] = React.useState<MonetizationConfig>(() => {
		const existing =
			((portalProvider.current as any)?.monetization?.monetization as MonetizationConfig | undefined) ||
			((portalProvider.current as any)?.Monetization as MonetizationConfig | undefined);

		if (existing) return normalizeMonetizationConfig(existing, ownerWallet);

		return {
			enabled: false,
			walletAddress: ownerWallet,
			tokenAddress: 'AR',
			tokenSymbol: 'AR',
			tokenDecimals: DEFAULT_TOKEN_DECIMALS,
			tokenType: 'AR',
			tipTokens: [{ ...DEFAULT_MONETIZATION_TOKEN }],
		};
	});

	const [tips, setTips] = React.useState<TipRow[]>([]);
	const [loadingTips, setLoadingTips] = React.useState(false);
	const [tipsError, setTipsError] = React.useState<string | null>(null);
	const [reloadKey, setReloadKey] = React.useState(0);
	const [currentPage, setCurrentPage] = React.useState(1);

	React.useEffect(() => {
		const existing =
			((portalProvider.current as any)?.monetization?.monetization as MonetizationConfig | undefined) ||
			((portalProvider.current as any)?.Monetization as MonetizationConfig | undefined);

		if (existing) {
			setMonetization(normalizeMonetizationConfig(existing, ownerWallet));
		} else {
			setMonetization((prev) => ({
				...prev,
				walletAddress: ownerWallet || prev.walletAddress,
			}));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [portalProvider.current?.id]);

	const canEdit = !!portalProvider.permissions?.updatePortalMeta;
	const fieldsDisabled = !monetization.enabled || !canEdit;

	// Helper: check if any section has a Tips (monetization) button block
	const hasTipsBlockInContent = React.useCallback((sections: any[]): boolean => {
		if (!Array.isArray(sections)) return false;
		for (const section of sections) {
			if (!Array.isArray(section?.content)) continue;
			for (const block of section.content) {
				if (block.type === PageBlockEnum.MonetizationButton) return true;
				if (block.type === 'section' && block.content?.content) {
					if (hasTipsBlockInContent([block.content])) return true;
				}
			}
		}
		return false;
	}, []);

	// Check if home page already has a tips button
	const homePageContent = portalProvider.current?.pages?.['home']?.content;
	const homePageHasTipsButton = React.useMemo(
		() => hasTipsBlockInContent(homePageContent || []),
		[homePageContent, hasTipsBlockInContent]
	);

	// Track if user has seen the tip button on home page (localStorage)
	const tipButtonSeenKey = `portal_tip_button_seen_${portalProvider.current?.id}`;
	const [hasTipButtonBeenSeen, setHasTipButtonBeenSeen] = React.useState(() => {
		if (typeof window === 'undefined') return false;
		return localStorage.getItem(tipButtonSeenKey) === 'true';
	});

	// Update seen state when portal changes
	React.useEffect(() => {
		if (portalProvider.current?.id) {
			const key = `portal_tip_button_seen_${portalProvider.current.id}`;
			setHasTipButtonBeenSeen(localStorage.getItem(key) === 'true');
		}
	}, [portalProvider.current?.id]);

	const pageSize = 5;

	const totalItems = tips.length;
	const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

	const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * pageSize;
	const endIndex = totalItems === 0 ? 0 : Math.min(startIndex + pageSize, totalItems);

	const currentRange = {
		start: totalItems === 0 ? 0 : startIndex + 1,
		end: endIndex,
		total: totalItems,
	};

	const paginatedTips = React.useMemo(() => tips.slice(startIndex, endIndex), [tips, startIndex, endIndex]);
	const hasMonetization = !!existingMonetization?.enabled && !!existingMonetization.walletAddress;

	const monetizationWalletForTips = existingMonetization?.walletAddress || ownerWallet;
	const tipRecipientAddressesForHistory = React.useMemo(() => {
		const existingTokens = normalizeTipTokens(existingMonetization);
		const recipients = new Set<string>();
		const primaryRecipient = monetizationWalletForTips?.trim();
		if (primaryRecipient) recipients.add(primaryRecipient);
		for (const token of existingTokens) {
			const tokenRecipient = token.recipientAddress?.trim();
			if (tokenRecipient) recipients.add(tokenRecipient);
		}
		return Array.from(recipients);
	}, [existingMonetization, monetizationWalletForTips]);
	const totalUsdReceived = React.useMemo(() => {
		const sum = tips.reduce((acc, tip) => {
			if (!tip.usdValue) return acc;
			const cleaned = String(tip.usdValue).replace(/[^0-9.-]/g, '');
			const parsed = Number.parseFloat(cleaned);
			if (!Number.isFinite(parsed)) return acc;
			return acc + parsed;
		}, 0);

		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(sum);
	}, [tips]);

	React.useEffect(() => {
		setCurrentPage(1);
	}, [tips]);

	React.useEffect(() => {
		if (!hasMonetization) {
			setTips([]);
			return;
		}

		let cancelled = false;

		async function fetchTips() {
			try {
				setLoadingTips(true);
				setTipsError(null);

				const tagFilters = [
					`{ name: "App-Name", values: ["Portal"] }`,
					`{ name: "Type", values: ["Tip"] }`,
					`{ name: "To-Address", values: $toAddr }`,
				];

				const query = {
					query: `
				query($toAddr: [String!]!) {
					transactions(
						tags: [
							${tagFilters.join(',\n')}
						],
						sort: HEIGHT_DESC,
						first: 150
					) {
						edges {
							node {
								id
								quantity { winston }
								block { timestamp }
								owner { address }
								tags { name value }
							}
						}
					}
				}
			`,
					variables: {
						toAddr: tipRecipientAddressesForHistory,
					},
				};

				const res = await fetch('https://arweave.net/graphql', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(query),
				});

				if (!res.ok) throw new Error(`GraphQL error: ${res.status}`);

				const json = await res.json();
				const edges = json?.data?.transactions?.edges || [];

				const parsed: TipRow[] = edges.map((edge: any) => {
					const node = edge.node;
					const tags: { name: string; value: string }[] = node.tags || [];

					const winston = node.quantity?.winston || '0';
					const parsedTip = parseTipTags(tags, winston);
					const getTag = (name: string) => tags.find((t) => t.name === name)?.value || undefined;
					const fromProfileId = getTag('From-Profile');
					const usdValue = getTag('USD-Value') || null;

					return {
						id: node.id,
						timestamp: node.block?.timestamp ?? null,
						winston,
						amountAr: parsedTip.amount,
						amount: parsedTip.amount,
						amountRaw: parsedTip.amountRaw,
						tokenSymbol: parsedTip.tokenSymbol,
						tokenDecimals: parsedTip.tokenDecimals,
						tokenProcess: parsedTip.tokenProcess,
						tokenType: parsedTip.tokenType,
						toAddress: getTag('To-Address'),
						fromAddress: getTag('From-Address') || node.owner?.address || '',
						fromProfile: fromProfileId,
						location: getTag('Location'),
						usdValue,
					};
				});

				const profileIds = Array.from(
					new Set(parsed.map((t) => t.fromProfile).filter((id): id is string => Boolean(id)))
				);
				debugLog('info', 'Monetization', 'Profile IDs to fetch for tips:', profileIds);
				const newCache = { ...profileCache };

				for (const pid of profileIds) {
					if (!newCache[pid]) {
						try {
							// Adjust this if your provider uses a different method
							const prof = await permawebProvider.fetchProfile(pid);
							debugLog('info', 'Monetization', 'Fetched profile for tip', pid, prof);
							newCache[pid] = prof;
						} catch (err) {
							debugLog('warn', 'Monetization', 'Failed to fetch profile for tip', pid, err);
						}
					}
				}

				if (!cancelled) {
					setProfileCache(newCache);

					// Optionally enrich the tips with profile display name
					const enriched: TipRow[] = parsed.map((tip) => {
						if (!tip.fromProfile) return tip;

						const p = newCache[tip.fromProfile];

						// Tweak this line to match your profile shape
						const niceName = p?.name || p?.handle || p?.Profile?.Name || p?.profile?.name || tip.fromName;

						return {
							...tip,
							fromName: niceName,
						};
					});

					setTips(enriched);
				}
			} catch (e: any) {
				if (!cancelled) {
					debugLog('error', 'Monetization', 'Failed to fetch tips:', e.message ?? 'Unknown error');
					setTipsError(e.message ?? 'Failed to fetch tips');
					setTips([]);
				}
			} finally {
				if (!cancelled) setLoadingTips(false);
			}
		}

		fetchTips();

		return () => {
			cancelled = true;
		};
	}, [hasMonetization, tipRecipientAddressesForHistory, portalProvider.current?.id, reloadKey]);

	function getFrom(row: TipRow) {
		if (row.fromProfile) {
			const prof = profileCache[row.fromProfile];
			if (prof) {
				const displayName = prof.name || prof.handle || prof.Profile?.Name || prof.profile?.name;

				if (displayName) return displayName;
			}

			return row.fromProfile;
		}

		if (row.fromAddress) {
			return row.fromAddress;
		}

		return 'Unknown';
	}

	function renderDate(ts: number | null) {
		if (!ts) return '–';
		try {
			return new Date(ts * 1000).toLocaleString();
		} catch {
			return '–';
		}
	}

	const tipTokens = React.useMemo(() => {
		const list = monetization.tipTokens || [];
		if (list.length > 0) return list.slice(0, MAX_TIP_TOKENS);
		return [{ ...DEFAULT_MONETIZATION_TOKEN }];
	}, [monetization.tipTokens]);
	const getTokenOptionId = (token: {
		tokenType?: 'AR' | 'AO';
		tokenAddress?: string;
		tokenSymbol?: string;
		tokenDecimals?: number;
	}) =>
		`${token.tokenType || 'AO'}:${token.tokenAddress || ''}:${token.tokenSymbol || ''}:${Number(
			token.tokenDecimals ?? DEFAULT_TOKEN_DECIMALS
		)}`;
	const presetOptions = React.useMemo<SelectOptionType[]>(
		() => [
			...TIP_TOKEN_OPTIONS.map((token) => ({
				id: getTokenOptionId(token),
				label: token.label,
			})),
		],
		[]
	);
	const getTokenGroupKey = (token: {
		tokenType?: 'AR' | 'AO';
		tokenAddress?: string;
		tokenSymbol?: string;
		tokenDecimals?: number;
		recipientAddress?: string;
	}) => {
		const recipient = (token.recipientAddress?.trim() || monetization.walletAddress?.trim() || '').toLowerCase();
		return token.tokenType === 'AO' ? `AO:${token.tokenAddress || ''}:${recipient}` : `AR:AR:${recipient}`;
	};
	const tokenTotalsByKey = React.useMemo(() => {
		const map = new Map<string, { total: bigint; symbol: string; decimals: number }>();
		for (const tip of tips) {
			const recipient = (tip.toAddress || '').trim().toLowerCase();
			const key = tip.tokenType === 'AO' ? `AO:${tip.tokenProcess || ''}:${recipient}` : `AR:AR:${recipient}`;
			const prev = map.get(key);
			const nextTotal = (prev?.total ?? BigInt(0)) + BigInt(tip.amountRaw || '0');
			map.set(key, {
				total: nextTotal,
				symbol: tip.tokenSymbol || prev?.symbol || 'AR',
				decimals: tip.tokenDecimals ?? prev?.decimals ?? DEFAULT_TOKEN_DECIMALS,
			});
		}
		return map;
	}, [tips]);

	function updateTipToken(index: number, updates: Partial<(typeof tipTokens)[number]>) {
		setMonetization((prev) => {
			const list = [...(prev.tipTokens || [{ ...DEFAULT_MONETIZATION_TOKEN }])].slice(0, MAX_TIP_TOKENS);
			if (!list[index]) return prev;
			list[index] = { ...list[index], ...updates };
			return { ...prev, tipTokens: list };
		});
	}

	function addTipToken() {
		setMonetization((prev) => {
			const list = [...(prev.tipTokens || [{ ...DEFAULT_MONETIZATION_TOKEN }])].slice(0, MAX_TIP_TOKENS);
			if (list.length >= MAX_TIP_TOKENS) return prev;
			return {
				...prev,
				tipTokens: [
					...list,
					{
						...DEFAULT_MONETIZATION_TOKEN,
					},
				],
			};
		});
	}

	function removeTipToken(index: number) {
		setMonetization((prev) => {
			const list = [...(prev.tipTokens || [{ ...DEFAULT_MONETIZATION_TOKEN }])];
			if (list.length <= 1) return prev;
			list.splice(index, 1);
			return { ...prev, tipTokens: list };
		});
	}

	function buildPayload(nextMonetization: MonetizationConfig, enabledOverride?: boolean): MonetizationConfig {
		const withFixedDecimals = {
			...nextMonetization,
			tipTokens: (nextMonetization.tipTokens || []).map((token) => ({
				...token,
				tokenDecimals: DEFAULT_TOKEN_DECIMALS,
			})),
		};
		const normalized = normalizeMonetizationConfig(
			{
				...withFixedDecimals,
				enabled: enabledOverride ?? withFixedDecimals.enabled,
			},
			ownerWallet
		);
		const normalizedTokens = normalizeTipTokens(normalized).map((token) => {
			const tokenRecipient = token.recipientAddress?.trim();
			const mainRecipient = normalized.walletAddress?.trim();
			if (tokenRecipient && mainRecipient && tokenRecipient.toLowerCase() === mainRecipient.toLowerCase()) {
				return { ...token, recipientAddress: undefined };
			}
			return token;
		});
		const primary = normalizedTokens[0];

		return {
			enabled: normalized.enabled,
			walletAddress: normalized.walletAddress.trim(),
			tokenAddress: primary.type === 'AR' ? 'AR' : primary.processId || '',
			tokenSymbol: primary.symbol,
			tokenDecimals: primary.decimals,
			tokenType: primary.type,
			tipTokens: tokensToMonetizationConfig(normalizedTokens),
		};
	}
	const hasPendingChanges = React.useMemo(() => {
		const currentPayload = buildPayload(monetization);
		const baseline = existingMonetization
			? normalizeMonetizationConfig(existingMonetization, ownerWallet)
			: {
					enabled: false,
					walletAddress: ownerWallet,
					tokenAddress: 'AR',
					tokenSymbol: 'AR',
					tokenDecimals: DEFAULT_TOKEN_DECIMALS,
					tokenType: 'AR' as const,
					tipTokens: [{ ...DEFAULT_MONETIZATION_TOKEN }],
			  };
		const baselinePayload = buildPayload(baseline);
		return JSON.stringify(currentPayload) !== JSON.stringify(baselinePayload);
	}, [monetization, existingMonetization, ownerWallet]);

	function validateTipTokenConfig(nextMonetization: MonetizationConfig) {
		const tokens = normalizeTipTokens(nextMonetization);
		const primaryRecipient = nextMonetization.walletAddress?.trim();
		if (!checkValidAddress(primaryRecipient || null)) {
			return `Main recipient address must be a valid wallet address.`;
		}

		for (const token of tokens) {
			if (!token.symbol?.trim()) {
				return `Each token must include a symbol.`;
			}
			if (!Number.isFinite(token.decimals) || token.decimals !== DEFAULT_TOKEN_DECIMALS) {
				return `Token decimals must be ${DEFAULT_TOKEN_DECIMALS}.`;
			}
			if (token.type === 'AO' && !token.processId) {
				return `Each AO token needs a valid 43-character process ID.`;
			}
			if (token.recipientAddress?.trim() && !checkValidAddress(token.recipientAddress.trim())) {
				return `Token recipient address must be a valid wallet address.`;
			}
		}

		return null;
	}

	async function saveMonetization(nextMonetization: MonetizationConfig, enabledOverride?: boolean) {
		if (!portalProvider.current?.id || !portalProvider.permissions?.updatePortalMeta) {
			return;
		}
		if (!arProvider.wallet || !permawebProvider.libs) {
			addNotification(language.walletNotConnected, 'warning');
			return;
		}
		const tokenValidationError = validateTipTokenConfig(nextMonetization);
		if (tokenValidationError) {
			addNotification(tokenValidationError, 'warning');
			return;
		}

		const payload = buildPayload(nextMonetization, enabledOverride);
		const enabled = payload.enabled;
		setSavingMonetization(true);

		try {
			// Prepare the update body
			const body: any = {
				Monetization: permawebProvider.libs.mapToProcessCase
					? permawebProvider.libs.mapToProcessCase(payload)
					: payload,
			};

			// If enabling tips and home page doesn't have a tips button, auto-add one
			if (enabled && !homePageHasTipsButton) {
				const makeId = () =>
					typeof crypto?.randomUUID === 'function'
						? crypto.randomUUID()
						: `${Date.now()}-${Math.random().toString(36).slice(2)}`;

				const tipsBlock = {
					id: makeId(),
					type: PageBlockEnum.MonetizationButton,
					content: null,
					width: 1,
				};

				const newSection = {
					type: PageSectionEnum.Row,
					layout: null,
					content: [tipsBlock],
					width: 1,
				};

				// Get existing home page content or create empty array
				const existingHomeContent = portalProvider.current?.pages?.['home']?.content || [];
				const updatedHomeContent = [...existingHomeContent, newSection];

				// Update pages with the new home content
				const updatedPages = {
					...portalProvider.current?.pages,
					home: {
						...portalProvider.current?.pages?.['home'],
						content: updatedHomeContent,
						type: 'grid',
					},
				};

				body.Pages = permawebProvider.libs.mapToProcessCase
					? permawebProvider.libs.mapToProcessCase(updatedPages)
					: updatedPages;
			}

			const updateId = await permawebProvider.libs.updateZone(body, portalProvider.current.id, arProvider.wallet);
			debugLog('info', 'Monetization', 'Monetization update:', updateId);

			(portalProvider.current as any).monetization = { monetization: payload };
			(portalProvider.current as any).Monetization = payload;

			// Update pages in portal state if we added the tips button
			if (enabled && !homePageHasTipsButton && body.Pages) {
				const existingHomeContent = portalProvider.current?.pages?.['home']?.content || [];
				const makeId = () =>
					typeof crypto?.randomUUID === 'function'
						? crypto.randomUUID()
						: `${Date.now()}-${Math.random().toString(36).slice(2)}`;

				const tipsBlock = {
					id: makeId(),
					type: PageBlockEnum.MonetizationButton,
					content: null,
					width: 1,
				};

				const newSection = {
					type: PageSectionEnum.Row,
					layout: null,
					content: [tipsBlock],
					width: 1,
				};

				(portalProvider.current as any).pages = {
					...portalProvider.current?.pages,
					home: {
						...portalProvider.current?.pages?.['home'],
						content: [...existingHomeContent, newSection],
						type: 'grid',
					},
				};
			}

			if (portalProvider.refreshCurrentPortal) {
				portalProvider.refreshCurrentPortal(PortalPatchMapEnum.Monetization);
			}

			const message =
				enabled && !homePageHasTipsButton
					? language?.tipsEnabledWithButton ?? 'Tips enabled! A tip button has been added to your home page.'
					: language.monetizationSaved;
			addNotification(message, 'success');
			setMonetization(payload);
		} catch (e: any) {
			debugLog('error', 'Monetization', 'Error saving monetization settings:', e.message ?? 'Unknown error');
			addNotification(e?.message ?? 'Error saving monetization settings.', 'warning');
		} finally {
			setSavingMonetization(false);
		}
	}

	async function handleToggle(option: 'On' | 'Off') {
		const enabled = option === 'On';
		const nextMonetization = {
			...monetization,
			enabled,
		};
		setMonetization(nextMonetization);
		await saveMonetization(nextMonetization, enabled);
	}

	return (
		<>
			<S.Wrapper>
				<ViewHeader
					header={language.tips}
					actions={[
						<>
							{hasMonetization && (
								<S.Summary>
									<p>
										<b>{totalUsdReceived}</b>
										{' Total USD Received'}
									</p>
								</S.Summary>
							)}
							<S.ConfigToggle>
								<Toggle
									options={['On', 'Off']}
									activeOption={monetization.enabled ? 'On' : 'Off'}
									handleToggle={handleToggle}
									disabled={!canEdit}
								/>
								<Button
									type={'alt1'}
									label={tipTokens.length >= MAX_TIP_TOKENS ? 'Max 3 tokens' : 'Add Token'}
									handlePress={addTipToken}
									disabled={fieldsDisabled || tipTokens.length >= MAX_TIP_TOKENS}
								/>
							</S.ConfigToggle>
						</>,
					]}
				/>
				<S.BodyWrapper>
					<S.Section>
						<S.ConfigForm>
							<S.Forms>
								<FormField
									label={'Receipient Address'}
									value={monetization.walletAddress}
									onChange={(e: any) =>
										setMonetization((prev) => ({
											...prev,
											walletAddress: e.target.value,
										}))
									}
									invalid={{ status: false, message: null }}
									disabled={fieldsDisabled}
									hideErrorMessage
								/>
							</S.Forms>

							{tipTokens.map((token, index) => {
								const matchedPreset = TIP_TOKEN_OPTIONS.find(
									(preset) =>
										preset.tokenType === (token.tokenType === 'AO' ? 'AO' : 'AR') &&
										preset.tokenAddress === (token.tokenAddress || '') &&
										preset.tokenSymbol === (token.tokenSymbol || '') &&
										Number(preset.tokenDecimals) === Number(token.tokenDecimals ?? 0)
								);
								const selectedPresetId = matchedPreset ? getTokenOptionId(matchedPreset) : presetOptions[0].id;
								const selectedPresetOption =
									presetOptions.find((option) => option.id === selectedPresetId) || presetOptions[0];
								const groupKey = getTokenGroupKey(token);
								const totals = tokenTotalsByKey.get(groupKey);
								const receivedAmount = totals
									? formatAmountDisplay(fromBaseUnits(totals.total.toString(), totals.decimals))
									: '0';
								const receivedSymbol = totals?.symbol || token.tokenSymbol || 'AR';
								const mainRecipient = monetization.walletAddress?.trim() || '';
								const customRecipientEnabled = token.recipientAddress !== undefined;
								const tokenRecipient = customRecipientEnabled ? token.recipientAddress?.trim() || '' : mainRecipient;
								const checkboxLabel = `Change ${(token.tokenType || 'AR').toUpperCase()} recipient address`;

								return (
									<S.TokenGroup key={`tip-token-${index}`}>
										<div className="token-group-header">
											<span className="field-label">{`Tip Token ${index + 1}`}</span>
											<span className="token-received">{`${receivedAmount} ${receivedSymbol} received`}</span>
										</div>
										<div className="token-group-body">
											<div className="token-recipient-field">
												<FormField
													label={'Receipient Address'}
													value={tokenRecipient}
													onChange={(e: any) => updateTipToken(index, { recipientAddress: e.target.value })}
													invalid={{ status: false, message: null }}
													disabled={fieldsDisabled || !customRecipientEnabled}
													hideErrorMessage
													noMargin
												/>
											</div>
											<div className="token-select-field">
												<Select
													label={'Token'}
													activeOption={selectedPresetOption}
													setActiveOption={(option) => {
														const preset = TIP_TOKEN_OPTIONS.find((entry) => getTokenOptionId(entry) === option.id);
														if (!preset) return;
														updateTipToken(index, {
															tokenType: preset.tokenType,
															tokenAddress: preset.tokenAddress,
															tokenSymbol: preset.tokenSymbol,
															tokenDecimals: DEFAULT_TOKEN_DECIMALS,
														});
													}}
													options={presetOptions}
													disabled={fieldsDisabled}
												/>
											</div>
											{tipTokens.length > 1 && (
												<Button
													type={'alt4'}
													label={language?.remove ?? 'Remove'}
													handlePress={() => removeTipToken(index)}
													disabled={fieldsDisabled}
												/>
											)}
										</div>
										<div className="token-recipient-toggle">
											<div className="token-checkbox-line">
												<Checkbox
													checked={customRecipientEnabled}
													handleSelect={() => {
														if (customRecipientEnabled) {
															updateTipToken(index, { recipientAddress: undefined });
															return;
														}
														updateTipToken(index, { recipientAddress: mainRecipient });
													}}
													disabled={fieldsDisabled}
												/>
												<span>{checkboxLabel}</span>
											</div>
										</div>
									</S.TokenGroup>
								);
							})}

							<div className="row">
								<Button
									type={'alt1'}
									label={language.save}
									handlePress={() => saveMonetization(monetization)}
									disabled={!canEdit || !hasPendingChanges || savingMonetization}
								/>
							</div>
						</S.ConfigForm>
					</S.Section>

					{/* Tips History */}
					<S.Section>
						<S.SectionHeader>
							<h6>{language.tipsHistory}</h6>
							<Button
								type={'alt4'}
								label={language.refresh}
								handlePress={() => setReloadKey((k) => k + 1)}
								disabled={!hasMonetization || loadingTips}
							/>
						</S.SectionHeader>

						{hasMonetization && loadingTips && (
							<S.LoadingWrapper className={'border-wrapper-alt2'}>
								<p>{`${language.loading}...`}</p>
							</S.LoadingWrapper>
						)}

						{!hasMonetization && (
							<S.WrapperEmpty className={'border-wrapper-alt2'}>
								<p>{language.monetizationDisabledHistoryInfo}</p>
							</S.WrapperEmpty>
						)}

						{hasMonetization && !loadingTips && tipsError && (
							<S.WrapperEmpty className={'border-wrapper-alt2'}>
								<p>{tipsError}</p>
							</S.WrapperEmpty>
						)}

						{hasMonetization && !loadingTips && !tipsError && tips.length === 0 && (
							<>
								{/* Show banner only if: button doesn't exist, OR button exists but user hasn't seen it yet */}
								{(!homePageHasTipsButton || (homePageHasTipsButton && !hasTipButtonBeenSeen)) && (
									<S.SetupBanner>
										{homePageHasTipsButton ? (
											<>
												<h6>{language?.tipsButtonAddedTitle ?? 'Tip button added!'}</h6>
												<p>
													{language?.tipsButtonAddedDescription ??
														'A tip button has been added to your home page. Visit the page editor to customize its position or style.'}
												</p>
												<S.SetupBannerActions>
													{portalProvider.current?.id && (
														<Button
															type={'alt1'}
															label={language?.tipsGoToHomePage ?? 'Go to Home Page'}
															handlePress={() => navigate(`${URLS.pageEditMain(portalProvider.current.id)}/home`)}
														/>
													)}
												</S.SetupBannerActions>
											</>
										) : (
											<>
												<h6>{language.tipsSetupBannerTitle}</h6>
												<p>{language.tipsSetupBannerDescription}</p>
												<S.SetupBannerActions>
													{portalProvider.current?.id && (
														<>
															<Button
																type={'alt1'}
																label={language.tipsSetupBannerMainPage}
																handlePress={() => navigate(`${URLS.pageEditMain(portalProvider.current.id)}/home`)}
															/>
															<Button
																type={'alt2'}
																label={language.tipsSetupBannerInfoPages}
																handlePress={() => navigate(URLS.pageEditInfo(portalProvider.current.id))}
															/>
														</>
													)}
												</S.SetupBannerActions>
											</>
										)}
									</S.SetupBanner>
								)}
								{/* Show empty state message when banner is not shown (user has seen button) */}
								{homePageHasTipsButton && hasTipButtonBeenSeen && (
									<S.WrapperEmpty className={'border-wrapper-alt2'}>
										<p>{language?.noTipsYet ?? 'No tips received yet for this portal.'}</p>
									</S.WrapperEmpty>
								)}
							</>
						)}

						{hasMonetization && !loadingTips && !tipsError && tips.length > 0 && (
							<>
								<S.TableWrapper className={'scroll-wrapper'}>
									<S.Table>
										<thead>
											<tr>
												<th>{language.amount}</th>
												<th>{language.from}</th>
												<th>Transaction</th>
												<th>Location</th>
												<th>{language.date}</th>
											</tr>
										</thead>
										<tbody>
											{paginatedTips.map((row) => (
												<tr key={row.id}>
													<td>
														{`${formatAmountDisplay(row.amount || row.amountAr || '0')} ${row.tokenSymbol || 'AR'}`}
														{row.usdValue && (
															<span
																style={{
																	display: 'block',
																	fontSize: '0.85em',
																	color: 'var(--color-text-secondary)',
																	marginTop: '2px',
																}}
															>
																${row.usdValue} USD
															</span>
														)}
													</td>
													<td>
														<TxAddress address={getFrom(row)} wrap={false} />
													</td>
													<td>
														<TxAddress address={row.id} wrap={false} />
													</td>
													<td>{row.location?.toUpperCase() || '–'}</td>
													<td>{renderDate(row.timestamp)}</td>
												</tr>
											))}
										</tbody>
									</S.Table>
								</S.TableWrapper>
								<Pagination
									totalItems={totalItems}
									totalPages={totalPages}
									currentPage={currentPage}
									currentRange={currentRange}
									setCurrentPage={setCurrentPage}
									showRange={true}
									showControls={true}
									iconButtons={true}
								/>
							</>
						)}
					</S.Section>
				</S.BodyWrapper>
			</S.Wrapper>
			{savingMonetization && <Loader message={`${language.loading}...`} />}
		</>
	);
}
