import React from 'react';

import Arweave from 'arweave';

import { ViewHeader } from 'editor/components/atoms/ViewHeader';
import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
import { FormField } from 'components/atoms/FormField';
import { Loader } from 'components/atoms/Loader';
import { Pagination } from 'components/atoms/Pagination';
import { Toggle } from 'components/atoms/Toggle';
import { TxAddress } from 'components/atoms/TxAddress';
import { MonetizationConfig, PortalPatchMapEnum, TipRow } from 'helpers/types';
import { debugLog } from 'helpers/utils';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { useNotifications } from 'providers/NotificationProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';

import * as S from './styles';

const arweave = Arweave.init({
	host: 'arweave.net',
	port: 443,
	protocol: 'https',
});

export default function Tips() {
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

		if (existing) return existing;

		return {
			enabled: false,
			walletAddress: ownerWallet,
			tokenAddress: 'AR',
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
			setMonetization(existing);
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

	const totalReceivedAr = React.useMemo(() => {
		if (!tips.length) return '0';
		try {
			let total = BigInt(0);
			for (const t of tips) {
				total += BigInt(t.winston || '0');
			}
			return arweave.ar.winstonToAr(total.toString());
		} catch {
			return '0';
		}
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

				const query = {
					query: `
				query($toAddr: [String!]!) {
					transactions(
						tags: [
							{ name: "App-Name", values: ["Portal"] },
							{ name: "Type", values: ["Tip"] },
							{ name: "To-Address", values: $toAddr }
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
						toAddr: [monetizationWalletForTips],
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

					const getTag = (name: string) => tags.find((t) => t.name === name)?.value || undefined;

					const winston = node.quantity?.winston || '0';
					const amountAr = arweave.ar.winstonToAr(winston);

					const fromProfileId = getTag('From-Profile');

					return {
						id: node.id,
						timestamp: node.block?.timestamp ?? null,
						winston,
						amountAr,
						fromAddress: getTag('From-Address') || node.owner?.address || '',
						fromProfile: fromProfileId,
						location: getTag('Location'),
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

						// tweak this line to match your profile shape
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
	}, [hasMonetization, monetizationWalletForTips, portalProvider.current?.id, reloadKey]);

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

	async function handleToggle(option: 'On' | 'Off') {
		const enabled = option === 'On';

		// Save immediately
		if (!portalProvider.current?.id || !portalProvider.permissions?.updatePortalMeta) {
			return;
		}
		if (!arProvider.wallet || !permawebProvider.libs) {
			addNotification(language.walletNotConnected, 'warning');
			return;
		}

		setSavingMonetization(true);

		setMonetization((prev) => ({
			...prev,
			enabled,
		}));

		const payload: MonetizationConfig = {
			enabled,
			walletAddress: monetization.walletAddress.trim(),
			tokenAddress: monetization.tokenAddress || 'AR',
		};

		try {
			const body: any = {
				Monetization: permawebProvider.libs.mapToProcessCase
					? permawebProvider.libs.mapToProcessCase(payload)
					: payload,
			};

			const updateId = await permawebProvider.libs.updateZone(body, portalProvider.current.id, arProvider.wallet);
			debugLog('info', 'Monetization', 'Monetization update:', updateId);

			(portalProvider.current as any).monetization = { monetization: payload };
			(portalProvider.current as any).Monetization = payload;

			if (portalProvider.refreshCurrentPortal) {
				portalProvider.refreshCurrentPortal(PortalPatchMapEnum.Monetization);
			}

			addNotification(language.monetizationSaved, 'success');
		} catch (e: any) {
			debugLog('error', 'Monetization', 'Error saving monetization settings:', e.message ?? 'Unknown error');
			addNotification(e?.message ?? 'Error saving monetization settings.', 'warning');
		} finally {
			setSavingMonetization(false);
		}
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
										<b>{`${Number(totalReceivedAr).toFixed(4)} AR `}</b>
										{language.received}
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
							</S.ConfigToggle>
						</>,
					]}
				/>
				<S.BodyWrapper>
					<S.Section>
						<S.ConfigForm>
							<S.Forms>
								<FormField
									label={language.walletAddress}
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

								<FormField
									label={language.tokenAddress}
									value={monetization.tokenAddress}
									onChange={() => {}}
									invalid={{ status: false, message: null }}
									disabled={true}
									hideErrorMessage
								/>
							</S.Forms>
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
							<S.WrapperEmpty className={'border-wrapper-alt2'}>
								<p>{language.noTipsYet}</p>
							</S.WrapperEmpty>
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
													<td>{Number(row.amountAr).toFixed(4)}</td>
													<td>
														<TxAddress address={getFrom(row)} wrap={false} />
													</td>
													<td>
														<TxAddress address={row.id} wrap={false} />
													</td>
													<td>{row.location.toUpperCase()}</td>
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
