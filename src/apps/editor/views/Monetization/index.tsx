import React from 'react';

import Arweave from 'arweave';

import { ViewHeader } from 'editor/components/atoms/ViewHeader';
import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
import { FormField } from 'components/atoms/FormField';
import { Loader } from 'components/atoms/Loader';
import { PortalPatchMapEnum } from 'helpers/types';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { useNotifications } from 'providers/NotificationProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';

import * as S from './styles';

type MonetizationConfig = {
	enabled: boolean;
	walletAddress: string;
	tokenAddress: string;
};

type TipRow = {
	id: string;
	timestamp: number | null;
	amountAr: string;
	fromAddress: string;
	fromName?: string;
	fromProfile?: string;
	location?: string;
	winston: string;
};

const arweave = Arweave.init({
	host: 'arweave.net',
	port: 443,
	protocol: 'https',
});

export default function Monetization() {
	const portalProvider = usePortalProvider();
	const arProvider = useArweaveProvider();
	const permawebProvider = usePermawebProvider();
	const { addNotification } = useNotifications();

	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const ownerWallet = (portalProvider.current as any)?.ownerWallet || (portalProvider.current as any)?.owner || '';

	const [savingMonetization, setSavingMonetization] = React.useState(false);

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

	async function handleSaveMonetization() {
		if (!portalProvider.current?.id || !portalProvider.permissions?.updatePortalMeta) {
			return;
		}
		if (!arProvider.wallet || !permawebProvider.libs) {
			addNotification(language?.walletNotConnected ?? 'Connect a wallet to update monetization.', 'warning');
			return;
		}

		const payload: MonetizationConfig = {
			enabled: monetization.enabled,
			walletAddress: monetization.walletAddress.trim(),
			tokenAddress: monetization.tokenAddress || 'AR',
		};

		setSavingMonetization(true);

		try {
			const body: any = {
				Monetization: permawebProvider.libs.mapToProcessCase
					? permawebProvider.libs.mapToProcessCase(payload)
					: payload,
			};

			const updateId = await permawebProvider.libs.updateZone(body, portalProvider.current.id, arProvider.wallet);
			console.log('[PortalMonetization] Monetization update:', updateId);

			// keep in-memory portal up to date
			(portalProvider.current as any).monetization = { monetization: payload };
			(portalProvider.current as any).Monetization = payload;

			if (portalProvider.refreshCurrentPortal) {
				portalProvider.refreshCurrentPortal(PortalPatchMapEnum.Monetization);
			}

			addNotification(language?.monetizationSaved ?? 'Monetization settings saved.', 'success');
		} catch (e: any) {
			console.error(e);
			addNotification(e?.message ?? 'Error saving monetization settings.', 'warning');
		} finally {
			setSavingMonetization(false);
		}
	}

	// --- Tips history state ---

	const [tips, setTips] = React.useState<TipRow[]>([]);
	const [loadingTips, setLoadingTips] = React.useState(false);
	const [tipsError, setTipsError] = React.useState<string | null>(null);
	const [reloadKey, setReloadKey] = React.useState(0);

	const hasMonetization = !!monetization.enabled && !!monetization.walletAddress;

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
								first: 50
							) {
								edges {
									node {
										id
										quantity {
											winston
										}
										block {
											timestamp
										}
										owner {
											address
										}
										tags {
											name
											value
										}
									}
								}
							}
						}
					`,
					variables: {
						toAddr: [monetization.walletAddress],
					},
				};

				const res = await fetch('https://arweave.net/graphql', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
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

					return {
						id: node.id,
						timestamp: node.block?.timestamp ?? null,
						winston,
						amountAr,
						fromAddress: getTag('From-Address') || node.owner?.address || '',
						fromName: getTag('From-Name'),
						fromProfile: getTag('From-Profile'),
						location: getTag('Location'),
					};
				});

				if (!cancelled) {
					setTips(parsed);
				}
			} catch (e: any) {
				if (!cancelled) {
					console.error('[PortalMonetization] Failed to fetch tips', e);
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
	}, [hasMonetization, monetization.walletAddress, portalProvider.current?.id, reloadKey]);

	function renderFrom(row: TipRow) {
		if (row.fromName) return row.fromName;
		if (row.fromProfile) return row.fromProfile;
		if (row.fromAddress) {
			return `${row.fromAddress.slice(0, 6)}...${row.fromAddress.slice(-4)}`;
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

	return (
		<S.Wrapper>
			<ViewHeader
				header={language?.monetization ?? 'Monetization'}
				actions={[
					<>
						{hasMonetization && (
							<S.Summary>
								<span>{language?.totalReceived ?? 'Total received:'}</span>
								<strong>{totalReceivedAr} AR</strong>
							</S.Summary>
						)}
					</>,
				]}
			/>
			<S.Section>
				<S.SectionHeader>
					<span>Configuration</span>
				</S.SectionHeader>

				<S.ConfigForm>
					<div className="row">
						<span className="field-label">{language?.enableMonetization ?? 'Enable AR monetization'}</span>
						<Button
							type={monetization.enabled ? 'primary' : 'alt1'}
							label={monetization.enabled ? language?.on ?? 'On' : language?.off ?? 'Off'}
							handlePress={() =>
								canEdit &&
								setMonetization((prev) => ({
									...prev,
									enabled: !prev.enabled,
								}))
							}
							disabled={!canEdit}
						/>
					</div>

					<FormField
						label={language?.walletAddress ?? 'Wallet address'}
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
						label={language?.tokenAddress ?? 'Token'}
						value={monetization.tokenAddress}
						onChange={() => {}}
						invalid={{ status: false, message: null }}
						disabled={true} // fixed to AR for v1
						hideErrorMessage
					/>

					<div className="actions">
						<Button
							type={'primary'}
							label={savingMonetization ? language?.saving ?? 'Saving...' : language?.save ?? 'Save'}
							handlePress={handleSaveMonetization}
							disabled={savingMonetization || !canEdit || !portalProvider.current?.id}
						/>
					</div>
				</S.ConfigForm>
			</S.Section>

			{/* Tips history */}
			<S.Section>
				<S.SectionHeader>
					<span>{language?.tipsHistory ?? 'Tips history'}</span>
					<Button
						type="alt1"
						label={language?.refresh ?? 'Refresh'}
						handlePress={() => setReloadKey((k) => k + 1)}
						disabled={loadingTips}
					/>
				</S.SectionHeader>

				{!hasMonetization && (
					<S.Info className="warning">
						<span>
							{language?.monetizationDisabledMessage ??
								'Monetization is disabled or no payout wallet is set for this portal.'}
						</span>
					</S.Info>
				)}

				{hasMonetization && loadingTips && <Loader message={language?.loading ?? 'Loading tips...'} />}

				{hasMonetization && !loadingTips && tipsError && (
					<S.Info className="warning">
						<span>{tipsError}</span>
					</S.Info>
				)}

				{hasMonetization && !loadingTips && !tipsError && tips.length === 0 && (
					<S.Info className="info">
						<span>{language?.noTipsYet ?? 'No tips received yet for this portal.'}</span>
					</S.Info>
				)}

				{hasMonetization && !loadingTips && !tipsError && tips.length > 0 && (
					<S.TableWrapper className="scroll-wrapper">
						<S.Table>
							<thead>
								<tr>
									<th>{language?.date ?? 'Date'}</th>
									<th>{language?.from ?? 'From'}</th>
									<th>{language?.amount ?? 'Amount (AR)'}</th>
									<th>{language?.location ?? 'Location'}</th>
									<th>Tx</th>
								</tr>
							</thead>
							<tbody>
								{tips.map((row) => (
									<tr key={row.id}>
										<td>{renderDate(row.timestamp)}</td>
										<td>{renderFrom(row)}</td>
										<td>{row.amountAr}</td>
										<td>{row.location || '–'}</td>
										<td>
											<a href={`https://arweave.net/${row.id}`} target="_blank" rel="noopener noreferrer">
												{row.id.slice(0, 6)}...{row.id.slice(-4)}
											</a>
										</td>
									</tr>
								))}
							</tbody>
						</S.Table>
					</S.TableWrapper>
				)}
			</S.Section>
		</S.Wrapper>
	);
}
