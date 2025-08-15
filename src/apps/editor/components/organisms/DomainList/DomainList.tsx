import React from 'react';

import { ARIO, ArconnectSigner, ANT, ANTRegistry, defaultTargetManifestId } from '@ar.io/sdk';

import { IS_TESTNET } from 'helpers/config';
import { getArnsCost } from 'helpers/arnsCosts';
import { getARAmountFromWinc, toReadableARIO } from 'helpers/utils';
import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
import { PayWithSelector, PaymentSummary, InsufficientBalanceCTA } from 'components/molecules/Payment';
import { Panel } from 'components/atoms/Panel';
import { IconButton } from 'components/atoms/IconButton';
import { Loader } from 'components/atoms/Loader';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useNotifications } from 'providers/NotificationProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { ASSETS } from 'helpers/config';
import { TurboBalanceFund } from 'components/molecules/TurboBalanceFund';
import { useLatestANTVersion } from 'hooks/useLatestANTVersion';
import { useArIOBalance } from 'hooks/useArIOBalance';
import { loadCachedDomains, saveCachedDomains } from 'helpers/domainCache';

import * as S from './styles';

interface UserOwnedDomain {
	name: string;
	antId: string;
	target?: string;
	isRedirectedToPortal: boolean;
    // Optional metadata derived from network ArNS records
    startTimestamp?: number;
    recordType?: 'lease' | 'permabuy' | string;
    endTimestamp?: number;
    status?: 'loading' | 'resolved' | 'failed';
    requiresAntUpdate?: boolean;
}

export default function DomainList() {
	const arProvider = useArweaveProvider();
	const portalProvider = usePortalProvider();
	const { addNotification } = useNotifications();
	const languageProvider = useLanguageProvider();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const language: any = languageProvider.object[languageProvider.current];

    // Fine-grained loading flags (do not block the page render)
    const [loadingOwnedAnts, setLoadingOwnedAnts] = React.useState<boolean>(false);
    const [loadingArnsRecords, setLoadingArnsRecords] = React.useState<boolean>(false);
    // Track total intersected for logs/analytics (not used in render)
    // totalToValidate kept for potential metrics; we no longer read it directly in render
    const [, setTotalToValidate] = React.useState<number>(0);
    const [listReady, setListReady] = React.useState<boolean>(false);
    const [userOwnedDomains, setUserOwnedDomains] = React.useState<UserOwnedDomain[]>([]);
	const [redirectingDomains, setRedirectingDomains] = React.useState<Set<string>>(new Set());
	const [extendingDomains, setExtendingDomains] = React.useState<Set<string>>(new Set());
	const [upgradingDomains, setUpgradingDomains] = React.useState<Set<string>>(new Set());
    const [updatingAnts, setUpdatingAnts] = React.useState<Set<string>>(new Set());
    const [extendModal, setExtendModal] = React.useState<{ open: boolean; domain?: UserOwnedDomain; years: number }>( { open: false, years: 1 });
    const [upgradeModal, setUpgradeModal] = React.useState<{ open: boolean; domain?: UserOwnedDomain }>( { open: false });
    const [showFund, setShowFund] = React.useState<boolean>(false);
    // startTransition removed - using direct state updates for speed
    const [expandedDetails, setExpandedDetails] = React.useState<Set<string>>(new Set());
    // Shared timeout helper
    function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            const id = setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms);
            p.then((v) => { clearTimeout(id); resolve(v); })
             .catch((e) => { clearTimeout(id); reject(e); });
        });
    }


    async function detectRequiresAntUpdate(processId: string, timeoutMs = 6000): Promise<boolean> {
        try {
            const ant = ANT.init({ processId });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const info: any = await withTimeout((ant as any).getInfo?.() ?? (ant as any).info?.() ?? Promise.resolve(null), timeoutMs);
            // Try multiple shapes used across SDK versions
            const modules = info?.modules || info?.moduleStates || info?.installedModules || [];
            if (Array.isArray(modules)) {
                for (const m of modules) {
                    const updateFlag = m?.requiresUpdate || m?.updateAvailable || m?.needsUpdate;
                    const cur = Number(m?.version ?? m?.currentVersion);
                    const latest = Number(m?.latest ?? m?.latestVersion ?? m?.recommendedVersion);
                    if (updateFlag === true) return true;
                    if (Number.isFinite(cur) && Number.isFinite(latest) && latest > cur) return true;
                }
                return false;
            }
            if (modules && typeof modules === 'object') {
                for (const key of Object.keys(modules)) {
                    const m: any = modules[key];
                    const updateFlag = m?.requiresUpdate || m?.updateAvailable || m?.needsUpdate;
                    const cur = Number(m?.version ?? m?.currentVersion);
                    const latest = Number(m?.latest ?? m?.latestVersion ?? m?.recommendedVersion);
                    if (updateFlag === true) return true;
                    if (Number.isFinite(cur) && Number.isFinite(latest) && latest > cur) return true;
                }
                return false;
            }
            return false;
        } catch {
            return false;
        }
    }


    // Abort in-flight validation when inputs change/unmount
    const validationAbortRef = React.useRef<AbortController | null>(null);

    // Track ArNS records available on current network
    // Keep as refs to avoid re-renders; no direct reads in render
    const allowedAntIdsRef = React.useRef<Set<string>>(new Set());
    const allowedNamesRef = React.useRef<Set<string>>(new Set());
    const arnsByProcessIdRef = React.useRef<Map<string, any>>(new Map());
    // Cache validated domains to avoid duplicate network calls across re-renders
    const domainCacheRef = React.useRef<Map<string, UserOwnedDomain>>(new Map());
    // Track in-flight validations to prevent duplicate dryruns
    const inFlightValidationRef = React.useRef<Set<string>>(new Set());
    const ownedAntIdsRef = React.useRef<string[] | null>(null);
    const initializedRef = React.useRef<boolean>(false);
    const startedValidationIdsRef = React.useRef<Set<string>>(new Set());
    const hadCachedAtMountRef = React.useRef<boolean>(false);

    // Default target id ref (from SDK or from records page) when a domain is not assigned to any transactionid
    const defaultTargetIdRef = React.useRef<string | undefined>(defaultTargetManifestId);

    const ario = React.useMemo(() => (IS_TESTNET ? ARIO.testnet() : ARIO.mainnet()), []);
    const { data: latestAntVersion } = useLatestANTVersion();
    const { balance: arIOBalance } = useArIOBalance();

    // Costs cache for expanded domains
    const [costsByAntId, setCostsByAntId] = React.useState<Record<string, { extend?: { winc: number; mario: number; fiatUSD: string | null }; upgrade?: { winc: number; mario: number; fiatUSD: string | null } }>>({});
    const [extendPaymentMethod, setExtendPaymentMethod] = React.useState<'turbo' | 'ario'>(IS_TESTNET ? 'ario' : 'turbo');
    const [upgradePaymentMethod, setUpgradePaymentMethod] = React.useState<'turbo' | 'ario'>(IS_TESTNET ? 'ario' : 'turbo');
    const costsLoadingRef = React.useRef<Set<string>>(new Set());

    // Dynamic cost for extend modal (updates when years change)
    const [extendCost, setExtendCost] = React.useState<{ winc: number; mario: number; fiatUSD: string | null } | null>(null);
    const [extendCostLoading, setExtendCostLoading] = React.useState<boolean>(false);
    React.useEffect(() => {
        if (!extendModal.open || !extendModal.domain?.name || !extendModal.years) return;
        let cancelled = false;
        (async () => {
            try {
                setExtendCostLoading(true);
                const res = await getArnsCost({ intent: 'Extend-Lease', name: extendModal.domain.name, years: extendModal.years });
                if (!cancelled) setExtendCost(res);
            } catch {
                if (!cancelled) setExtendCost(null);
            } finally {
                if (!cancelled) setExtendCostLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [extendModal.open, extendModal.domain?.name, extendModal.years]);

    // Fetch ArNS records filtered by owned ANT process ids; no pagination, limit 1000
    async function fetchNetworkArns(ownedProcessIds: string[]): Promise<{ antIds: Set<string>; names: Set<string> }> {
        const antIds = new Set<string>();
        const names = new Set<string>();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const page: any = await ario.getArNSRecords({
            limit: 1000,
            // Use server-side filtering to avoid scanning the full registry
            filters: {
                processId: Array.isArray(ownedProcessIds) && ownedProcessIds.length > 0 ? ownedProcessIds : undefined,
            },
        });

        const items = page?.items ?? page?.records ?? [];
        for (const it of items) {
            if (typeof it?.processId === 'string') antIds.add(it.processId);
            if (typeof it?.name === 'string') names.add(it.name);
            if (typeof it?.processId === 'string') {
                arnsByProcessIdRef.current.set(it.processId, it);
            }
        }

        return { antIds, names };
    }

    // Fetch ANT Ids from registry - this includes both testnet and mainnet
    async function fetchOwnedAntIds(ownerAddress: string): Promise<string[]> {
        try {
            const antRegistry = ANTRegistry.init({ processId: 'i_le_yKKPVstLTDSmkHRqf-wYphMnwB9OhleiTgMkWc' });

            const accessControlList = await withTimeout(
                antRegistry.accessControlList({ address: ownerAddress }),
                12000
            );

            if (!accessControlList || typeof accessControlList !== 'object') return [];

            if (Array.isArray((accessControlList as any).Owned)) return (accessControlList as any).Owned as string[];
            if (Array.isArray((accessControlList as any).Controlled)) return (accessControlList as any).Controlled as string[];

            return Object.values(accessControlList as any)
                .filter((v: any) => Array.isArray(v))
                .flat() as string[];
        } catch (error) {
            console.error('Error fetching ANT ids from registry:', error);
            return [];
        }
    }

    // Validate a single ANT id into a domain entry with timeout and abort support
    async function resolveAntToDomain(args: {
        antId: string;
        portalId?: string;
        signal?: AbortSignal;
        timeoutMs?: number;
    }): Promise<UserOwnedDomain | null> {
        const { antId, portalId, signal, timeoutMs = 1500 } = args;
        if (!antId || typeof antId !== 'string' || antId.length < 10) return null;

        if (signal?.aborted) return null;

        try {
            // Prefer registry-provided name
            const arnsItem = arnsByProcessIdRef.current.get(antId);
            let nameForLookup: string | undefined = (arnsItem?.name as string) || undefined;

            // If name is missing, fetch by processId (avoid calling resolver with placeholder)
            if (!nameForLookup) {
                try {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const page: any = await withTimeout(ario.getArNSRecords({ limit: 1, filters: { processId: [antId] } }), timeoutMs);
                    const it = page?.items?.[0] ?? page?.records?.[0];
                    if (it?.name) {
                        nameForLookup = it.name as string;
                        arnsByProcessIdRef.current.set(antId, it);
                    }
                } catch {}
            }

            let resolved: any = null;
            if (nameForLookup) {
                resolved = await withTimeout(ario.resolveArNSName({ name: nameForLookup }), timeoutMs);
            }
            if (signal?.aborted) return null;

            const guessedName = `[${language.unassignedAnt}: ${antId.slice(0, 8)}…]`;
            const domainName = nameForLookup || resolved?.name || guessedName;
            const targetTxId = resolved?.txId;
            const isRedirectedToPortal = !!portalId && targetTxId === portalProvider.current?.id;
            const endTs = typeof (arnsItem as any)?.endTimestamp === 'number' ? (arnsItem as any).endTimestamp : (resolved as any)?.endTimestamp;
            // Detect ANT update via module version comparison, similar to arns-react
            const requiresAntUpdate: boolean = await detectRequiresAntUpdate(antId).catch(() => false);

            return {
                name: domainName,
                antId,
                target: targetTxId,
                isRedirectedToPortal,
                startTimestamp: typeof arnsItem?.startTimestamp === 'number' ? arnsItem.startTimestamp : undefined,
                recordType: (arnsItem?.type as any) || resolved?.type,
                endTimestamp: typeof endTs === 'number' ? endTs : undefined,
                requiresAntUpdate,
            };
        } catch (e: any) {
            if (e?.name === 'AbortError') return null;
            return null;
        }
    }

    React.useEffect(() => {
        if (!arProvider.walletAddress) {
            setUserOwnedDomains([]);
            setTotalToValidate(0);
            return;
        }

        // Try cached snapshot first for fast paint; preserve while we revalidate
        let hydratedFromCache = false;
        const cached = loadCachedDomains(
            arProvider.walletAddress,
            IS_TESTNET ? 'testnet' : 'mainnet'
        );
        if (cached && Array.isArray(cached)) {
            // Minimal shape to hydrate UI quickly; statuses will re-resolve
            const cachedSkeleton = cached.map((c) => ({
                name: c.name,
                antId: c.antId,
                target: c.target,
                isRedirectedToPortal: c.isRedirectedToPortal,
                startTimestamp: c.startTimestamp,
                recordType: c.recordType,
                endTimestamp: c.endTimestamp,
                requiresAntUpdate: c.requiresAntUpdate,
                status: 'resolved' as const,
            }));
            setUserOwnedDomains(cachedSkeleton);
            setListReady(true);
            hadCachedAtMountRef.current = true;
            hydratedFromCache = true;
        } else {
            hadCachedAtMountRef.current = false;
        }

        // Mark loading flags (does not block UI)
        setLoadingOwnedAnts(true);
        setLoadingArnsRecords(true);
        if (!hydratedFromCache) {
            setUserOwnedDomains([]);
            setTotalToValidate(0);
        }

        // Cancel any previous work
        validationAbortRef.current?.abort();
        domainCacheRef.current.clear();
        inFlightValidationRef.current.clear();

        fetchDomains();

    }, [arProvider.walletAddress]);

    function fetchDomains() {
        // Fetch owned first, then fetch only matching ArNS records via server-side filter
        fetchOwnedAntIds(arProvider.walletAddress!)
            .then((owned) => {
                ownedAntIdsRef.current = owned;
                setLoadingOwnedAnts(false);
                return fetchNetworkArns(owned);
            })
            .then((networkRecords) => {
                allowedAntIdsRef.current = networkRecords.antIds;
                allowedNamesRef.current = networkRecords.names;
                setLoadingArnsRecords(false);
                intersectOwnedIdsWithNetworkArns();
            })
            .catch((err) => {
                console.error('Error initializing domain lists:', err);
                setLoadingArnsRecords(false);
            });
    }

    function intersectOwnedIdsWithNetworkArns() {
        if (initializedRef.current) return;
        const owned = ownedAntIdsRef.current;
        if (!owned || allowedAntIdsRef.current.size === 0) return;

        // Intersect owned ids with current network ArNS registry entries
        const antIds = owned.filter((id) => allowedAntIdsRef.current.has(id));
        initializedRef.current = true;
        setTotalToValidate(antIds.length);

        // Seed intersection skeletons
        const skeleton: UserOwnedDomain[] = antIds.map((id) => {
            const item = arnsByProcessIdRef.current.get(id);
            return {
                name: (item?.name as string) || `[${language.resolving} ${id.slice(0, 6)}…]`,
                antId: id,
                target: undefined,
                isRedirectedToPortal: false,
                startTimestamp: item?.startTimestamp,
                recordType: item?.type,
                status: 'loading',
            };
        });
        if (hadCachedAtMountRef.current) {
            setUserOwnedDomains((prev) => {
                const allowed = new Set(antIds);
                const filteredPrev = prev.filter((d) => allowed.has(d.antId));
                const existingIds = new Set(filteredPrev.map((d) => d.antId));
                const additions = skeleton.filter((d) => !existingIds.has(d.antId));
                return [...filteredPrev, ...additions];
            });
            setListReady(true);
        } else {
            setUserOwnedDomains(skeleton);
            setListReady(true);
        }

        // Start validations only for intersected ids
        getTargetIdsforAnts(antIds);       

        // Save a snapshot asynchronously for fast next load only if not hydrated from cache
        setTimeout(() => {
            try {
                if (!hadCachedAtMountRef.current) {
                    const snapshot = skeleton.map((d) => ({
                        name: d.name,
                        antId: d.antId,
                        target: d.target,
                        isRedirectedToPortal: d.isRedirectedToPortal,
                        startTimestamp: d.startTimestamp,
                        recordType: d.recordType,
                        endTimestamp: (arnsByProcessIdRef.current.get(d.antId)?.endTimestamp as number) ?? undefined,
                        requiresAntUpdate: undefined,
                    }));
                    saveCachedDomains(
                        arProvider.walletAddress!,
                        IS_TESTNET ? 'testnet' : 'mainnet',
                        snapshot
                    );
                }
            } catch {}
        }, 0);
    }

    function getTargetIdsforAnts(antIds: string[]) {
        const abortController = new AbortController();
        validationAbortRef.current = abortController;
        
        // Fire each validation independently
        antIds.forEach((antId) => {
            setTimeout(() => {
                if (abortController.signal.aborted) return;
                if (inFlightValidationRef.current.has(antId)) return;
                if (startedValidationIdsRef.current.has(antId)) return;
                
                inFlightValidationRef.current.add(antId);
                startedValidationIdsRef.current.add(antId);
                
                resolveAntToDomain({
                    antId,
                    portalId: portalProvider.current?.id,
                    signal: abortController.signal,
                    timeoutMs: 60000,
                }).then((domain) => {
                    if (abortController.signal.aborted) return;
                    
                    if (domain) {
                        setUserOwnedDomains((prev) => prev.map((d) => {
                            if (d.antId !== antId) return d;
                            const hydrated: UserOwnedDomain = {
                                ...d,
                                ...domain,
                                status: 'resolved',
                            };
                            return hydrated;
                        }));
                        domainCacheRef.current.set(antId, { ...domain, status: 'resolved' });
                        // Write-through: update cache entry for this domain
                        try {
                            const existing = loadCachedDomains(
                                arProvider.walletAddress!,
                                IS_TESTNET ? 'testnet' : 'mainnet'
                            ) || [];
                            const updated = [
                                ...existing.filter((x) => x.antId !== antId),
                                {
                                    name: domain.name,
                                    antId: domain.antId,
                                    target: domain.target,
                                    isRedirectedToPortal: domain.isRedirectedToPortal,
                                    startTimestamp: domain.startTimestamp,
                                    recordType: domain.recordType,
                                    endTimestamp: domain.endTimestamp,
                                    requiresAntUpdate: domain.requiresAntUpdate,
                                },
                            ];
                            saveCachedDomains(
                                arProvider.walletAddress!,
                                IS_TESTNET ? 'testnet' : 'mainnet',
                                updated
                            );
                        } catch {}
                    } // else keep as loading; not a hard failure
                    
                    inFlightValidationRef.current.delete(antId);
                }).catch(() => {
                    if (abortController.signal.aborted) return;
                    // Treat network errors as transient; keep loading
                    inFlightValidationRef.current.delete(antId);
                });
            }, Math.random() * 100); // Stagger starts slightly
        });
    }

    // Fetch costs for expanded lease domains
    React.useEffect(() => {
        const expandedIds = Array.from(expandedDetails.values());
        expandedIds.forEach((antId) => {
            const domain = userOwnedDomains.find((d) => d.antId === antId);
            if (!domain || domain.recordType !== 'lease') return;
            if (costsByAntId[antId] && costsByAntId[antId].extend && costsByAntId[antId].upgrade) return;
            if (costsLoadingRef.current.has(antId)) return;
            costsLoadingRef.current.add(antId);
            (async () => {
                try {
                    const [extend, upgrade] = await Promise.all([
                        getArnsCost({ intent: 'Extend-Lease', name: domain.name, years: 1 }),
                        getArnsCost({ intent: 'Upgrade-Name', name: domain.name }),
                    ]);
                    setCostsByAntId((prev) => ({ ...prev, [antId]: { extend, upgrade } }));
                } catch {}
                finally {
                    costsLoadingRef.current.delete(antId);
                }
            })();
        });
    }, [expandedDetails, userOwnedDomains]);

	async function getSignedArio() {
		await window.arweaveWallet?.connect([
			'SIGN_TRANSACTION',
			'ACCESS_ADDRESS',
			'ACCESS_PUBLIC_KEY',
			'DISPATCH',
		]);
		const signer = new ArconnectSigner(window.arweaveWallet);
		return IS_TESTNET ? ARIO.testnet({ signer }) : ARIO.mainnet({ signer });
	}

	async function pollAndHydrateAfterChange(args: { name: string; antId: string; previousEndTimestamp?: number; shouldStop?: (rec: any) => boolean }) {
		const client = IS_TESTNET ? ARIO.testnet() : ARIO.mainnet();
		for (let attempt = 0; attempt < 10; attempt++) {
			try {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const rec: any = await client.getArNSRecord({ name: args.name });
				let didUpdate = false;
				if (rec) {
					if (typeof args.previousEndTimestamp === 'number') {
						const nextEnd = typeof rec?.endTimestamp === 'number' ? rec.endTimestamp : undefined;
						didUpdate = typeof nextEnd === 'number' && nextEnd > args.previousEndTimestamp;
					} else if (typeof args.shouldStop === 'function') {
						didUpdate = !!args.shouldStop(rec);
					}
				}
				if (didUpdate) {
					arnsByProcessIdRef.current.set(args.antId, rec);
					const hydrated = await resolveAntToDomain({ antId: args.antId, portalId: portalProvider.current?.id, timeoutMs: 6000 });
					if (hydrated) {
						// Prefer fresh values from polled record where available
						const merged = {
							...hydrated,
							endTimestamp: typeof rec?.endTimestamp === 'number' ? rec.endTimestamp : hydrated.endTimestamp,
							recordType: (rec?.type as any) || hydrated.recordType,
						};
						setUserOwnedDomains((prev) => prev.map((d) => (d.antId === args.antId ? { ...d, ...merged, status: 'resolved' } : d)));
					}
					return true;
				}
			} catch {}
			await new Promise((r) => setTimeout(r, 3000));
		}
		return false;
	}

    // Removed in-modal cost fetching; we reuse costs already shown in details

    function renderUpgradeandCosts(domain: UserOwnedDomain) {
        if (domain.recordType !== 'lease') return null;
        const entry = costsByAntId[domain.antId];
        const valueText = (c?: { winc: number; mario: number; fiatUSD: string | null }) => {
            if (IS_TESTNET) return c ? `${toReadableARIO(c.mario)} tario` : '…';
            if (!c) return '…';
            const creditsText = `${getARAmountFromWinc(c.winc)} Credits${c.fiatUSD ? ` ($${c.fiatUSD})` : ''}`;
            const showArio = !!(arIOBalance && arIOBalance > 0);
            return showArio ? `${creditsText} • ${toReadableARIO(c.mario)} ARIO` : creditsText;
        };
        return (
            <>
                <div className="details-grid">
                    <div className="label">Extend (1y)</div>
                    <div className="value">{valueText(entry?.extend)}</div>
                    <div className="label">Go Permanent</div>
                    <div className="value">{valueText(entry?.upgrade)}</div>
                </div>
                <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <Button type={'primary'} label={extendingDomains.has(domain.name) ? 'Extending…' : 'Extend Lease'} handlePress={() => setExtendModal({ open: true, domain, years: 1 })} disabled={extendingDomains.has(domain.name)} />
                    <Button type={'alt1'} label={upgradingDomains.has(domain.name) ? 'Upgrading…' : 'Go Permanent'} handlePress={() => setUpgradeModal({ open: true, domain })} disabled={upgradingDomains.has(domain.name)} />
                </div>
            </>
        );
    }

    function renderDomainActions(domain: UserOwnedDomain, sectionId: 'expiring' | 'failed' | 'assignedHere' | 'unassigned' | 'assignedElsewhere') {
        return (
            <S.DomainActions style={{ display: 'flex', alignItems: 'center', columnGap: 12, rowGap: 8, flexWrap: 'wrap' }}>
                <Button type={'alt3'} label={language.goToSite} handlePress={() => window.open(`https://${domain.name}.arweave.net`, '_blank')} />
                {domain.requiresAntUpdate && (
                    <Button
                        type={'alt1'}
                        label={updatingAnts.has(domain.name) ? 'Updating…' : 'Update Available'}
                        handlePress={() => {
                            (async () => {
                                if (!window.arweaveWallet) return;
                                const confirmed = window.confirm('An update is available for this domain. Apply update now?');
                                if (!confirmed) return;
                                try {
                                    setUpdatingAnts((s) => new Set([...s, domain.name]));
                                    const signer = new ArconnectSigner(window.arweaveWallet);
                                    const ant = ANT.init({ processId: domain.antId, signer });
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    const antInfo: any = await (ant as any).getInfo?.();
                                    if (!antInfo?.state) throw new Error('No state found for domain');
                                    const previousState = {
                                        controllers: antInfo.state.Controllers,
                                        records: antInfo.state.Records,
                                        owner: antInfo.state.Owner || (await window.arweaveWallet.getActiveAddress?.()),
                                        ticker: antInfo.state.Ticker,
                                        name: antInfo.state.Name,
                                        description: antInfo.state.Description ?? '',
                                        keywords: antInfo.state.Keywords ?? [],
                                        balances: antInfo.state.Balances ?? {},
                                        logo: antInfo.logo ?? undefined,
                                    } as any;

                                    const moduleId = latestAntVersion?.moduleId;
                                    const luaCodeTxId = latestAntVersion?.luaSourceId;
                                    if (!moduleId || !luaCodeTxId) throw new Error('Latest ANT version unavailable');

                                    if (typeof (ant as any).upgradeWithModule === 'function') {
                                        await (ant as any).upgradeWithModule({ moduleId, luaCodeTxId, previousState });
                                    } else if (typeof (ant as any).dispatchUpgrade === 'function') {
                                        await (ant as any).dispatchUpgrade({ moduleId, luaCodeTxId, state: previousState });
                                    } else {
                                        throw new Error('ANT upgrade method not available in SDK');
                                    }
                                    await pollAndHydrateAfterChange({ name: domain.name, antId: domain.antId });
                                    addNotification('Updated successfully.', 'success');
                                } catch (e: any) {
                                    console.error('ANT update failed:', e);
                                    addNotification(`${language.errorOccurred}: ${e?.message || e}`, 'warning');
                                } finally {
                                    setUpdatingAnts((s) => { const n = new Set(s); n.delete(domain.name); return n; });
                                }
                            })();
                        }}
                    />
                )}
                {sectionId === 'assignedHere' && (
                    <Button
                        type={'alt1'}
                        label={language.removeFromPortal}
                        handlePress={() => {
                            (async () => {
                                const confirmed = window.confirm(language.removeAssignmentConfirm);
                                if (!confirmed) return;
                                try {
                                    await window.arweaveWallet.connect(['SIGN_TRANSACTION','ACCESS_ADDRESS','ACCESS_PUBLIC_KEY','DISPATCH']);
                                    const signer = new ArconnectSigner(window.arweaveWallet);
                                    const ant = ANT.init({ processId: domain.antId, signer });
                                    const def = defaultTargetIdRef.current || defaultTargetManifestId;
                                    if (def) {
                                        await ant.setBaseNameRecord({ transactionId: def, ttlSeconds: 3600 });
                                    } else if (domain.target) {
                                        await ant.setBaseNameRecord({ transactionId: domain.target, ttlSeconds: 60 });
                                    }
                                    setUserOwnedDomains(prev => prev.map(d => d.name === domain.name ? { ...d, target: defaultTargetManifestId, isRedirectedToPortal: false } : d));
                                    addNotification(language.assignmentRemoved, 'success');
                                } catch (err: any) {
                                    console.error('Error removing assignment:', err);
                                    addNotification(`${language.errorOccurred}: ${err.message}`, 'warning');
                                }
                            })();
                        }}
                    />
                )}
                {(sectionId === 'failed' || sectionId === 'unassigned' || sectionId === 'assignedElsewhere') && (
                    <Button
                        type={'primary'}
                        label={redirectingDomains.has(domain.name) ? language.assigning : language.assignToThisPortal}
                        handlePress={() => redirectDomainToPortal(domain)}
                        disabled={redirectingDomains.has(domain.name)}
                    />
                )}
            </S.DomainActions>
        );
    }

    function renderDomainRow(domain: UserOwnedDomain, sectionId: 'expiring' | 'failed' | 'assignedHere' | 'unassigned' | 'assignedElsewhere') {
        return (
            <S.DomainWrapper key={`${sectionId}-${domain.antId}`} className={'fade-in'}>
                <S.DomainHeader>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <IconButton
                            type={'alt1'}
                            src={ASSETS.arrow}
                            className={`expand-btn ${expandedDetails.has(domain.antId) ? 'is-open' : ''}`}
                            handlePress={() => setExpandedDetails(prev => {
                                const next = new Set(prev);
                                next.has(domain.antId) ? next.delete(domain.antId) : next.add(domain.antId);
                                return next;
                            })}
                            dimensions={{ wrapper: 16, icon: 14 }}
                            noFocus
                        />
                        <h4 style={{ margin: 0 }}>{domain.name}</h4>
                        {sectionId === 'assignedHere' && (
                            <S.StatusBadge className="redirected">✓ {language.toThisPortal}</S.StatusBadge>
                        )}
                    </div>
                </S.DomainHeader>
                {expandedDetails.has(domain.antId) && (
                    <S.DomainDetails>
                        <div className="details-grid">
                            <div className="label">{language.detailId}</div>
                            <div className="value"><code className="code">{domain.antId}</code></div>
                            {domain.requiresAntUpdate && (
                                <>
                                    <div className="label">Update available</div>
                                    <div className="value"><span className="badge permanent" style={{ background: '#16a34a', color: '#0a0a0a' }}>Recommended</span></div>
                                </>
                            )}
                            {domain.startTimestamp && (
                                <>
                                    <div className="label">{language.detailRegistered}</div>
                                    <div className="value">{new Date(domain.startTimestamp).toLocaleString()}</div>
                                </>
                            )}
                            {domain.recordType && (
                                <>
                                    <div className="label">{language.detailType}</div>
                                    <div className="value">
                                        <span className={`badge ${domain.recordType === 'permabuy' ? 'permanent' : 'lease'}`}>
                                            {domain.recordType === 'permabuy' ? language.permanent : domain.recordType === 'lease' ? language.lease : domain.recordType}
                                        </span>
                                    </div>
                                </>
                            )}
                            {domain.recordType === 'lease' && domain.endTimestamp && (
                                <>
                                    <div className="label">Expiration date</div>
                                    <div className="value">{new Date(domain.endTimestamp).toLocaleString()}</div>
                                </>
                            )}
                            {domain.target && (
                                <>
                                    <div className="label">{language.detailTarget}</div>
                                    <div className="value"><code className="code">{domain.target}</code></div>
                                </>
                            )}
                        </div>
                        {renderUpgradeandCosts(domain)}
                    </S.DomainDetails>
                )}
                <S.DomainDetail>
                    {renderDomainActions(domain, sectionId)}
                </S.DomainDetail>
            </S.DomainWrapper>
        );
    }

    function renderSection(section: { id: 'expiring' | 'failed' | 'assignedHere' | 'unassigned' | 'assignedElsewhere'; title: string; subtitle?: string; domains: UserOwnedDomain[]; }) {
        return (
            <div key={`sec-${section.id}`}>
                <S.SectionHeader>
                    <h3>{section.title}</h3>
                    {section.subtitle && <p>{section.subtitle}</p>}
                </S.SectionHeader>
                {section.domains.map((domain) => renderDomainRow(domain, section.id))}
            </div>
        );
    }

	// Redirect domain to current portal
	async function redirectDomainToPortal(domain: UserOwnedDomain) {
		if (!arProvider.wallet || !window.arweaveWallet || !portalProvider.current?.id) {
			addNotification(language.walletOrPortalUnavailable, 'warning');
			return;
		}
        
		setRedirectingDomains(prev => new Set([...prev, domain.name]));

		try {
			// Ensure wallet permissions
			await window.arweaveWallet.connect([
				'SIGN_TRANSACTION', 
				'ACCESS_ADDRESS', 
				'ACCESS_PUBLIC_KEY',
			]);

			// Initialize ANT with signer
			const signer = new ArconnectSigner(window.arweaveWallet);
			const ant = ANT.init({
				processId: domain.antId,
				signer: signer,
			});

			// Update base name record to point to current portal (short TTL)
			await ant.setBaseNameRecord({
				transactionId: portalProvider.current.id,
				ttlSeconds: 60,
			});

			// Update local state
			setUserOwnedDomains(prev => prev.map(d => 
				d.name === domain.name 
					? { ...d, target: portalProvider.current.id, isRedirectedToPortal: true }
					: d
			));

			addNotification(language.redirectSuccess, 'success');

		} catch (error: any) {
			console.error('Error redirecting domain:', error);
			addNotification(`${language.redirectFailed} ${error.message}`, 'warning');
		} finally {
			setRedirectingDomains(prev => {
				const newSet = new Set(prev);
				newSet.delete(domain.name);
				return newSet;
			});
		}
	}

	if (!arProvider.walletAddress) {
			return (
				<S.WrapperEmpty>
                <p>{language.connectWallet}</p>
				</S.WrapperEmpty>
			);
		}

    // Partition domains into 3 sections based on target; also calculate expiring soon
    const now = Date.now();
    const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;
    const expiringSoon = userOwnedDomains.filter((d) => d.recordType === 'lease' && d.endTimestamp && d.endTimestamp > now && d.endTimestamp < now + ONE_MONTH_MS);
    const expiringIds = new Set(expiringSoon.map((d) => d.antId));
    const domainsAssignedToPortal = userOwnedDomains.filter((d) => d.target === portalProvider.current?.id && !expiringIds.has(d.antId));
    const domainsAssignedElsewhere = userOwnedDomains.filter(
        (d) => d.target && d.target !== portalProvider.current?.id && (!defaultTargetIdRef.current || d.target !== defaultTargetIdRef.current) && !expiringIds.has(d.antId)
    );
    const domainsUnassigned = userOwnedDomains.filter(
        (d) => (!d.target || (defaultTargetIdRef.current && d.target === defaultTargetIdRef.current)) && !expiringIds.has(d.antId)
    );
    const validating = React.useMemo(() => userOwnedDomains.filter(d => d.status === 'loading'), [userOwnedDomains]);
    const failed = userOwnedDomains.filter(d => d.status === 'failed');

    return (
			<S.Wrapper>
            {!listReady && (
                <div style={{ margin: '4px 0 12px 0', padding: '6px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Loader xSm />
                    <p style={{ margin: 0, opacity: 0.85 }}>{language.fetchingYourDomains}…</p>
                </div>
            )}
            <Panel
                open={extendModal.open}
                width={520}
                header={'Extend Lease'}
                handleClose={() => setExtendModal({ open: false, years: 1 })}
                className={'modal-wrapper'}
            >
                {extendModal.domain && (
                    <div style={{ padding: 16 }}>
                        <div style={{ marginBottom: 10 }}>
                            <div style={{ fontWeight: 600, marginBottom: 6 }}>Domain</div>
                            <div>{extendModal.domain.name}</div>
                        </div>
                        <div style={{ marginBottom: 10 }}>
                            <div style={{ fontWeight: 600, marginBottom: 6 }}>Years</div>
                            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                {[1,2,3,4,5].map((y) => (
                                    <Button key={y} type={extendModal.years === y ? 'alt1' : 'primary'} label={`${y}`} handlePress={() => setExtendModal((p) => ({ ...p, years: y }))} />
                                ))}
                            </div>
                        </div>
                        <div style={{ marginTop: 8 }}>
                            <div style={{ fontWeight: 600, marginBottom: 6 }}>Costs</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', rowGap: 6 }}>
                                {IS_TESTNET ? (
                                    <>
                                        <div style={{ opacity: 0.75 }}>Amount</div>
                                        <div>{extendCostLoading ? (
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Loader xSm /> Fetching…</span>
                                        ) : (
                                            extendCost?.mario != null ? `${toReadableARIO(extendCost.mario)} tario` : '—'
                                        )}</div>
                                    </>
                                ) : (
                                    <>
                                        <div style={{ opacity: 0.75 }}>Credits</div>
                                        <div>{extendCostLoading ? (
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Loader xSm /> Fetching…</span>
                                        ) : (
                                            (() => {
                                                const credits = extendCost?.winc != null ? `${getARAmountFromWinc(extendCost.winc)} Credits` : '—';
                                                const usd = extendCost?.fiatUSD ? ` ($${extendCost.fiatUSD})` : '';
                                                return `${credits}${usd}`;
                                            })()
                                        )}</div>
                                        {!!(arIOBalance && arIOBalance > 0) && (
                                            <>
                                                <div style={{ opacity: 0.75 }}>ARIO</div>
                                                <div>{extendCostLoading ? (
                                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Loader xSm /> Fetching…</span>
                                                ) : (
                                                    extendCost?.mario != null ? `${toReadableARIO(extendCost.mario)} ARIO` : '—'
                                                )}</div>
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                        {/* Pay-with options */}
                        {!IS_TESTNET && (
                            <PayWithSelector
                                method={extendPaymentMethod}
                                onChange={setExtendPaymentMethod}
                                arioSelectable={!!(arIOBalance && arIOBalance > 0)}
                                style={{ marginTop: 12 }}
                            />
                        )}

                        {/* Summary: total due, current balance, final balance */}
                        {(() => {
                            const due = IS_TESTNET || extendPaymentMethod === 'ario' ? extendCost?.mario : extendCost?.winc;
                            const unit = IS_TESTNET ? 'tario' : (extendPaymentMethod === 'ario' ? 'ARIO' : 'Credits');
                            const bal = IS_TESTNET || extendPaymentMethod === 'ario' ? arIOBalance : arProvider.turboBalance;
                            const loadingCost = extendCostLoading || due == null;
                            const loadingBal = IS_TESTNET ? (arIOBalance == null) : (extendPaymentMethod === 'ario' ? (arIOBalance == null) : (arProvider.turboBalance == null));
                            return (
                                <PaymentSummary
                                    method={IS_TESTNET ? 'ario' : extendPaymentMethod}
                                    unitLabel={unit}
                                    loadingCost={loadingCost}
                                    loadingBalance={loadingBal}
                                    cost={due}
                                    balance={bal}
                                    style={{ marginTop: 12 }}
                                />
                            );
                        })()}

                        {/* Insufficient balance CTA */}
                        {(() => {
                            const due = IS_TESTNET || extendPaymentMethod === 'ario' ? extendCost?.mario : extendCost?.winc;
                            const bal = IS_TESTNET || extendPaymentMethod === 'ario' ? arIOBalance : arProvider.turboBalance;
                            const loadingCost = extendCostLoading || due == null;
                            const loadingBal = IS_TESTNET ? (arIOBalance == null) : (extendPaymentMethod === 'ario' ? (arIOBalance == null) : (arProvider.turboBalance == null));
                            const insufficient = !(due != null && bal != null && bal >= due);
                            const isLoading = loadingCost || loadingBal;
                            return (
                                <InsufficientBalanceCTA
                                    method={IS_TESTNET ? 'ario' : extendPaymentMethod}
                                    insufficient={insufficient}
                                    isLoading={isLoading}
                                    onGetTokens={() => window.open('https://botega.arweave.net/#/swap?to=qNvAoz0TgcH7DMg8BCVn8jF32QH5L6T29VjHxhHqqGE', '_blank')}
                                    onAddCredits={() => setShowFund(true)}
                                    style={{ marginTop: 8 }}
                                />
                            );
                        })()}

                        {/* Actions below */}
                        <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-start' }}>
                            <Button type={'primary'} label={language.cancel} handlePress={() => setExtendModal({ open: false, years: 1 })} />
                            <Button
                                type={'alt1'}
                                label={language.confirm}
                                handlePress={async () => {
                                    if (!extendModal.domain) return;
                                    setExtendingDomains((s) => new Set([...s, extendModal.domain!.name]));
                                    setExtendModal({ open: false, years: 1 });
                                    try {
                                        const signed = await getSignedArio();
                                        await signed.extendLease({ name: extendModal.domain.name, years: extendModal.years, ...(IS_TESTNET ? {} : extendPaymentMethod === 'turbo' ? { fundFrom: 'turbo' } : {}) });
                                        const previousEnd = userOwnedDomains.find(d => d.antId === extendModal.domain!.antId)?.endTimestamp;
                                        await pollAndHydrateAfterChange({
                                            name: extendModal.domain.name,
                                            antId: extendModal.domain.antId,
                                            previousEndTimestamp: previousEnd,
                                        });
                                        addNotification(language.leaseExtendedSuccessfully, 'success');
                                    } catch (e) {
                                        console.error('Extend lease failed:', e);
                                        addNotification(language.errorExtendingLease, 'warning');
                                    } finally {
                                        setExtendingDomains((s) => {
                                            const next = new Set(s);
                                            next.delete(extendModal.domain!.name);
                                            return next;
                                        });
                                    }
                                }}
                                disabled={(() => {
                                    const due = IS_TESTNET || extendPaymentMethod === 'ario' ? extendCost?.mario : extendCost?.winc;
                                    const bal = IS_TESTNET || extendPaymentMethod === 'ario' ? arIOBalance : arProvider.turboBalance;
                                    return due == null || bal == null || bal < due || extendingDomains.has(extendModal.domain!.name);
                                })()}
                            />
                        </div>
                    </div>
                )}
            </Panel>

            {/* Upgrade to Permanent Modal with live costs */}
            <Panel
                open={upgradeModal.open}
                width={520}
                header={'Go Permanent'}
                handleClose={() => setUpgradeModal({ open: false })}
                className={'modal-wrapper'}
            >
                {upgradeModal.domain && (
                    <div style={{ padding: 16 }}>
                        <div style={{ marginBottom: 10 }}>
                            <div style={{ fontWeight: 600, marginBottom: 6 }}>Domain</div>
                            <div>{upgradeModal.domain.name}</div>
                        </div>
                        <div style={{ marginTop: 8 }}>
                            <div style={{ fontWeight: 600, marginBottom: 6 }}>Costs</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', rowGap: 6 }}>
                                {IS_TESTNET ? (
                                    <>
                                        <div style={{ opacity: 0.75 }}>Amount</div>
                                        <div>{(() => {
                                            const entry = costsByAntId[upgradeModal.domain.antId]?.upgrade;
                                            if (!entry || entry.mario == null) return (<span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Loader xSm /> Fetching…</span>);
                                            return `${toReadableARIO(entry.mario)} tario`;
                                        })()}</div>
                                    </>
                                ) : (
                                    <>
                                        <div style={{ opacity: 0.75 }}>Credits</div>
                                        <div>{(() => {
                                            const entry = costsByAntId[upgradeModal.domain.antId]?.upgrade;
                                            if (!entry || entry.winc == null) return (<span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Loader xSm /> Fetching…</span>);
                                            const credits = `${getARAmountFromWinc(entry.winc)} Credits`;
                                            const usd = entry?.fiatUSD ? ` ($${entry.fiatUSD})` : '';
                                            return `${credits}${usd}`;
                                        })()}</div>
                                        {!!(arIOBalance && arIOBalance > 0) && (
                                            <>
                                                <div style={{ opacity: 0.75 }}>ARIO</div>
                                                <div>{(() => {
                                                    const entry = costsByAntId[upgradeModal.domain.antId]?.upgrade;
                                                    if (!entry || entry.mario == null) return (<span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Loader xSm /> Fetching…</span>);
                                                    return `${toReadableARIO(entry.mario)} ARIO`;
                                                })()}</div>
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                        {/* Pay-with options */}
                        {!IS_TESTNET && (
                            <PayWithSelector
                                method={upgradePaymentMethod}
                                onChange={setUpgradePaymentMethod}
                                arioSelectable={!!(arIOBalance && arIOBalance > 0)}
                                style={{ marginTop: 12 }}
                            />
                        )}

                        {/* Summary: total due, current balance, final balance */}
                        {(() => {
                            const entry = costsByAntId[upgradeModal.domain!.antId]?.upgrade;
                            const due = IS_TESTNET || upgradePaymentMethod === 'ario' ? entry?.mario : entry?.winc;
                            const unit = IS_TESTNET ? 'tario' : (upgradePaymentMethod === 'ario' ? 'ARIO' : 'Credits');
                            const bal = IS_TESTNET || upgradePaymentMethod === 'ario' ? arIOBalance : arProvider.turboBalance;
                            const loadingCost = entry == null || due == null;
                            const loadingBal = IS_TESTNET ? (arIOBalance == null) : (upgradePaymentMethod === 'ario' ? (arIOBalance == null) : (arProvider.turboBalance == null));
                            return (
                                <PaymentSummary
                                    method={IS_TESTNET ? 'ario' : upgradePaymentMethod}
                                    unitLabel={unit}
                                    loadingCost={loadingCost}
                                    loadingBalance={loadingBal}
                                    cost={due}
                                    balance={bal}
                                    style={{ marginTop: 12 }}
                                />
                            );
                        })()}

                        {/* Insufficient balance CTA */}
                        {(() => {
                            const entry = costsByAntId[upgradeModal.domain!.antId]?.upgrade;
                            const due = IS_TESTNET || upgradePaymentMethod === 'ario' ? entry?.mario : entry?.winc;
                            const bal = IS_TESTNET || upgradePaymentMethod === 'ario' ? arIOBalance : arProvider.turboBalance;
                            const loadingCost = entry == null || due == null;
                            const loadingBal = IS_TESTNET ? (arIOBalance == null) : (upgradePaymentMethod === 'ario' ? (arIOBalance == null) : (arProvider.turboBalance == null));
                            const insufficient = !(due != null && bal != null && bal >= due);
                            const isLoading = loadingCost || loadingBal;
                            return (
                                <InsufficientBalanceCTA
                                    method={IS_TESTNET ? 'ario' : upgradePaymentMethod}
                                    insufficient={insufficient}
                                    isLoading={isLoading}
                                    onGetTokens={() => window.open('https://botega.arweave.net/#/swap?to=qNvAoz0TgcH7DMg8BCVn8jF32QH5L6T29VjHxhHqqGE', '_blank')}
                                    onAddCredits={() => setShowFund(true)}
                                    style={{ marginTop: 8 }}
                                />
                            );
                        })()}

                        {/* Upgrade / Extend Actions */}
                        <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                            <Button type={'primary'} label={language.cancel} handlePress={() => setUpgradeModal({ open: false })} />
                            <Button
                                type={'alt1'}
                                label={language.confirm}
                                handlePress={async () => {
                                    if (!upgradeModal.domain) return;
                                    setUpgradingDomains((s) => new Set([...s, upgradeModal.domain!.name]));
                                    setUpgradeModal({ open: false });
                                    try {
                                        const signed = await getSignedArio();
                                        await signed.upgradeRecord({ name: upgradeModal.domain.name, ...(IS_TESTNET ? {} : upgradePaymentMethod === 'turbo' ? { fundFrom: 'turbo' } : {}) });
                                        await pollAndHydrateAfterChange({
                                            name: upgradeModal.domain.name,
                                            antId: upgradeModal.domain.antId,
                                            shouldStop: (rec) => (rec?.type === 'permabuy') || (rec?.recordType === 'permabuy'),
                                        });
                                        addNotification(language.upgradeToPermanentSuccessfully, 'success');
                                    } catch (e) {
                                        console.error('Upgrade failed:', e);
                                        addNotification(language.errorUpgradingRecord, 'warning');
                                    } finally {
                                        setUpgradingDomains((s) => {
                                            const next = new Set(s);
                                            next.delete(upgradeModal.domain!.name);
                                            return next;
                                        });
                                    }
                                }}
                                disabled={(() => {
                                    const entry = costsByAntId[upgradeModal.domain!.antId]?.upgrade;
                                    const due = IS_TESTNET || upgradePaymentMethod === 'ario' ? entry?.mario : entry?.winc;
                                    const bal = IS_TESTNET || upgradePaymentMethod === 'ario' ? arIOBalance : arProvider.turboBalance;
                                    return due == null || bal == null || bal < due || upgradingDomains.has(upgradeModal.domain!.name);
                                })()}
                            />
                        </div>
                    </div>
                )}
            </Panel>

            {/* Turbo Top-up Modal */}
            <Panel open={showFund} width={575} header={language.fundTurboBalance} handleClose={() => setShowFund(false)} className={'modal-wrapper'}>
                {!IS_TESTNET && <TurboBalanceFund handleClose={() => setShowFund(false)} />}
            </Panel>

            {/* While validating, show which domains are still loading as compact chips */}
            {listReady && validating.length > 0 && (
                <S.LoadingBanner>
                    <span className={'label'}>{language.loadingDataFor}</span>
                    <div className={'chips'}>
                        {validating.map((d) => (
                            <span className={'chip'} key={`chip-${d.antId}`}>
                                <Loader xSm />
                                <span>{d.name}</span>
                            </span>
                        ))}
                    </div>
                </S.LoadingBanner>
            )}

            {/* Domain Groupings */}
            {(() => {
                const sections = [
                    { id: 'expiring' as const, title: `Expiring soon (${expiringSoon.length})`, subtitle: 'These domains have leases ending within 30 days. Extend or upgrade to avoid interruption.', domains: expiringSoon },
                    { id: 'failed' as const, title: `${language.validationFailed} (${failed.length})`, subtitle: language.validationFailedInfo, domains: failed },
                    { id: 'assignedHere' as const, title: `${language.assignedToThisPortal} (${domainsAssignedToPortal.length})`, subtitle: language.assignedToThisPortalInfo, domains: domainsAssignedToPortal },
                    { id: 'unassigned' as const, title: `${language.unassigned} (${domainsUnassigned.filter(d => d.status !== 'loading').length})`, subtitle: language.unassignedInfo, domains: domainsUnassigned.filter(d => d.status !== 'loading') },
                    { id: 'assignedElsewhere' as const, title: `${language.assignedElsewhere} (${domainsAssignedElsewhere.length})`, subtitle: language.assignedElsewhereInfo, domains: domainsAssignedElsewhere },
                ];
                return sections.filter(s => s.domains.length > 0).map(renderSection);
            })()}

            {userOwnedDomains.length === 0 && !(loadingOwnedAnts || loadingArnsRecords) && (
                <S.WrapperEmpty style={{ marginTop: '20px' }}>
                    <h3>{language.noDomainsFound}</h3>
                    <p>{language.noDomainsFoundInfo}</p>
                </S.WrapperEmpty>
            )}
			</S.Wrapper>
    );
}
