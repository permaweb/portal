// src/providers/UndernamesProvider.tsx
import * as React from 'react';
import { UNDERNAMES_PROCESS_ID, UNDERNAMES_HANDLERS, type HandlerKey } from '../processes/undernames/constants';
import { usePermawebProvider } from './PermawebProvider';
import { getPortalIdFromURL } from 'helpers/utils';

export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export type UndernameRequest = {
	id: number;
	name: string;
	requester: string;
	status: RequestStatus;
	createdAt?: number; // normalized for UI
	decidedAt?: number;
	decidedBy?: string;
	reason?: string;
};

export type UndernameOwnerRow = { name: string; owner: string };
export type ReservedEntry = { to?: string; by: string; at: number };

export type Policy = {
	MaxPerAddr: number;
	RequireApproval: boolean;
};

/** ----- Context shape ----- */
type UndernamesContextState = {
	// status
	ready: boolean;
	loading: boolean;
	error: string | null;

	// data
	controllers: string[];
	owners: Record<string, string>; // name -> owner
	reserved: Record<string, ReservedEntry>;
	requests: UndernameRequest[];
	policy: Policy;
	requestSeq: number;
	superAdmin?: string | null;

	// refreshers
	refreshAll: () => Promise<void>;
	refreshOwners: () => Promise<void>;
	refreshRequests: () => Promise<void>;
	refreshReserved: () => Promise<void>;
	refreshControllers: () => Promise<void>;
	refreshPolicy: () => Promise<void>;

	ownerOf: (name: string) => Promise<string | null>;
	checkAvailability: (name: string) => Promise<{
		name: string;
		available: boolean;
		takenBy?: string | null;
		reserved: boolean;
		reservedFor?: string | null;
		reason?: string | null;
	}>;

	// writes (mutate + auto refresh minimal surface)
	bootstrap: () => Promise<void>;
	addController: (addr: string) => Promise<void>;
	removeController: (addr: string) => Promise<void>;

	addReserved: (name: string, to: string) => Promise<void>;
	removeReserved: (name: string) => Promise<void>;

	request: (name: string) => Promise<void>;
	cancel: (id: number) => Promise<void>;
	approve: (id: number) => Promise<void>;
	reject: (id: number, reason?: string) => Promise<void>;

	forceRelease: (name: string, reason?: string) => Promise<void>;
	setPolicy: (p: Partial<Policy>) => Promise<void>;
};

const DEFAULT_POLICY: Policy = { MaxPerAddr: 4, RequireApproval: true };

const DEFAULT_CTX: UndernamesContextState = {
	ready: Boolean(UNDERNAMES_PROCESS_ID),
	loading: false,
	error: null,

	controllers: [],
	owners: {},
	reserved: {},
	requests: [],
	policy: DEFAULT_POLICY,
	requestSeq: 0,
	superAdmin: null,

	refreshAll: async () => {},
	refreshOwners: async () => {},
	refreshRequests: async () => {},
	refreshReserved: async () => {},
	refreshControllers: async () => {},
	refreshPolicy: async () => {},

	ownerOf: async () => null,
	checkAvailability: async (name: string) => ({
		name,
		available: false,
		takenBy: null,
		reserved: false,
		reservedFor: null,
		reason: null,
	}),

	bootstrap: async () => {},
	addController: async () => {},
	removeController: async () => {},

	addReserved: async () => {},
	removeReserved: async () => {},

	request: async () => {},
	cancel: async () => {},
	approve: async () => {},
	reject: async () => {},

	forceRelease: async () => {},
	setPolicy: async () => {},
};

const Ctx = React.createContext<UndernamesContextState>(DEFAULT_CTX);
export function useUndernamesProvider(): UndernamesContextState {
	return React.useContext(Ctx);
}

/** ----- internal helpers ----- */
function act(n: string) {
	return n; // we pass the full action from handlers (already includes prefix)
}

function buildTags(params?: Record<string, string | number | boolean>) {
	const tags: { name: string; value: string }[] = [];
	if (params) {
		for (const [k, v] of Object.entries(params)) {
			if (v === undefined || v === null) continue;
			tags.push({ name: k, value: String(v) });
		}
	}
	return tags;
}

function tryParse(out: any) {
	const raw = out?.Output ?? out?.output ?? out?.Messages?.[0]?.Data ?? out?.messages?.[0]?.data ?? out?.data ?? '';
	if (typeof raw === 'string' && raw.length > 0) {
		try {
			const rawJSON = JSON.parse(raw);
			const { ok, result } = rawJSON;
			console.log('UndernamesProvider: parsed', { ok, result });
			return result;
		} catch {}
	}
	const result = out.result;
	return result;
}

/** normalize requests: add camelCase aliases for UI */
function normalizeRequests(arr: any[]): UndernameRequest[] {
	return (arr || []).map((r) => ({
		...r,
		createdAt: r.created_at ?? r.createdAt,
		decidedAt: r.decided_at ?? r.decidedAt,
		decidedBy: r.decided_by ?? r.decidedBy,
	}));
}

/** ----- Provider ----- */
export function UndernamesProvider(props: { children: React.ReactNode }) {
	const { libs } = usePermawebProvider();
	const [ready] = React.useState<boolean>(Boolean(UNDERNAMES_PROCESS_ID));
	const [loading, setLoading] = React.useState<boolean>(false);
	const [error, setError] = React.useState<string | null>(null);

	const [controllers, setControllers] = React.useState<string[]>([]);
	const [owners, setOwners] = React.useState<Record<string, string>>({});
	const [reserved, setReserved] = React.useState<Record<string, ReservedEntry>>({});
	const [requests, setRequests] = React.useState<UndernameRequest[]>([]);
	const [policy, setPolicyState] = React.useState<Policy>(DEFAULT_POLICY);
	const [requestSeq, setRequestSeq] = React.useState<number>(0);
	const [superAdmin, setSuperAdmin] = React.useState<string | null>(null);

	/** low-level read */
	const read = React.useCallback(
		async (key: HandlerKey, params?: Record<string, any>) => {
			const action = UNDERNAMES_HANDLERS[key].action;
			const res = await libs.readProcess({
				processId: UNDERNAMES_PROCESS_ID,
				action: act(action),
				tags: buildTags(params),
				data: {},
			});
			return tryParse(res);
		},
		[libs]
	);

	/** low-level write */
	const send = React.useCallback(
		async (key: HandlerKey, params?: Record<string, any>) => {
			const action = UNDERNAMES_HANDLERS[key].action;
			const msgId = await libs.sendMessage({
				processId: UNDERNAMES_PROCESS_ID,
				action: act(action),
				tags: buildTags(params),
				data: '',
			});
			console.log('UndernamesProvider: send', { action, params, msgId });
			return msgId;
		},
		[libs]
	);

	const sendByForwardAction = React.useCallback(
		async (params?: Record<string, any>) => {
			const portalId = getPortalIdFromURL();
			if (!portalId) throw new Error('No portal ID found in URL');
			const msgId = await libs.sendMessage({
				processId: portalId,
				action: 'Run-Action',
				tags: buildTags(params),
				data: '',
			});
			console.log('UndernamesProvider: sendByForwardAction', { params, msgId });
			return msgId;
		},
		[libs]
	);

	/** refresh everything with Export */
	const refreshAll = React.useCallback(async () => {
		if (!ready) return;
		setLoading(true);
		setError(null);
		try {
			const out = await read('Export');
			// expected: { controllers, policy, reserved, owners, requests, requestSeq, superAdmin? }
			setControllers(Array.isArray(out?.controllers) ? out.controllers : controllers);
			setPolicyState(
				out?.policy
					? {
							MaxPerAddr: Number(out.policy.MaxPerAddr ?? out.policy.maxPerAddr ?? DEFAULT_POLICY.MaxPerAddr),
							RequireApproval: Boolean(
								out.policy.RequireApproval ?? out.policy.requireApproval ?? DEFAULT_POLICY.RequireApproval
							),
					  }
					: DEFAULT_POLICY
			);
			setReserved(out?.reserved ?? {});
			setOwners(out?.owners ?? {});
			setRequests(normalizeRequests(Object.values(out?.requests ?? {})));
			setRequestSeq(Number(out?.requestSeq ?? 0));
			setSuperAdmin(out?.superAdmin ?? null);
		} catch (e: any) {
			setError(e?.message ?? 'Failed to refresh');
		} finally {
			setLoading(false);
		}
	}, [controllers, ready, libs]);

	const refreshOwners = React.useCallback(async () => {
		if (!ready) return;
		try {
			const out = await read('ListUndernames');
			// out.undernames: [{ name, owner }]
			const map: Record<string, string> = {};
			(out?.undernames ?? []).forEach((row: UndernameOwnerRow) => {
				map[row.name] = row.owner;
			});
			setOwners(map);
		} catch (e: any) {
			setError(e?.message ?? 'Failed to refresh owners');
		}
	}, [ready, read]);

	const refreshRequests = React.useCallback(
		async (filter?: Partial<{ Status: string; Name: string; Requester: string }>) => {
			if (!ready) return;
			try {
				const out = await read('ListRequests', filter);
				setRequests(normalizeRequests(out?.requests ?? []));
			} catch (e: any) {
				setError(e?.message ?? 'Failed to refresh requests');
			}
		},
		[ready, read]
	);

	const refreshReserved = React.useCallback(async () => {
		if (!ready) return;
		try {
			const out = await read('ListReserved');
			setReserved(out?.reserved ?? {});
		} catch (e: any) {
			setError(e?.message ?? 'Failed to refresh reserved');
		}
	}, [ready, read]);

	const refreshControllers = React.useCallback(async () => {
		if (!ready) return;
		try {
			const out = await read('Export');
			setControllers(Array.isArray(out?.controllers) ? out.controllers : []);
			if (out?.superAdmin) setSuperAdmin(out.superAdmin);
		} catch (e: any) {
			setError(e?.message ?? 'Failed to refresh controllers');
		}
	}, [ready, read]);

	const refreshPolicy = React.useCallback(async () => {
		if (!ready) return;
		try {
			const out = await read('Export');
			setPolicyState(
				out?.policy
					? {
							MaxPerAddr: Number(out.policy.MaxPerAddr ?? out.policy.maxPerAddr ?? DEFAULT_POLICY.MaxPerAddr),
							RequireApproval: Boolean(
								out.policy.RequireApproval ?? out.policy.requireApproval ?? DEFAULT_POLICY.RequireApproval
							),
					  }
					: DEFAULT_POLICY
			);
		} catch (e: any) {
			setError(e?.message ?? 'Failed to refresh policy');
		}
	}, [ready, read]);

	/** targeted reads */
	const ownerOf = React.useCallback(
		async (name: string) => {
			const out = await read('OwnerOf', { Name: name });
			return out?.owner ?? null;
		},
		[read]
	);

	const checkAvailability = React.useCallback(
		async (name: string) => {
			const out = await read('CheckAvailability', { Name: name });
			return {
				name: out?.name ?? name,
				available: !!out?.available,
				takenBy: out?.takenBy ?? null,
				reserved: !!out?.reserved,
				reservedFor: out?.reservedFor ?? null,
				reason: out?.reason ?? null,
			};
		},
		[read]
	);

	/** writes */
	const bootstrap = React.useCallback(async () => {
		await send('Bootstrap');
		await refreshAll();
	}, [send, refreshAll]);

	const addController = React.useCallback(
		async (addr: string) => {
			await send('AddController', { Addr: addr });
			await refreshControllers();
		},
		[send, refreshControllers]
	);

	const removeController = React.useCallback(
		async (addr: string) => {
			await send('RemoveController', { Addr: addr });
			await refreshControllers();
		},
		[send, refreshControllers]
	);

	const addReserved = React.useCallback(
		async (name: string, to: string) => {
			const params: any = { Name: name };
			params.To = to;
			await send('AddReserved', params);
			await refreshReserved();
		},
		[send, refreshReserved]
	);

	const removeReserved = React.useCallback(
		async (name: string) => {
			await send('RemoveReserved', { Name: name });
			await refreshReserved();
		},
		[send, refreshReserved]
	);

	const request = React.useCallback(
		async (name: string) => {
			await sendByForwardAction({
				'Forward-Action': 'PortalRegistry.Request',
				'Forward-To': UNDERNAMES_PROCESS_ID,
				Name: name,
			});
			await refreshRequests();
			await refreshOwners();
			console.log('requested undername', name);
		},
		[send, refreshRequests, refreshOwners]
	);

	const cancel = React.useCallback(
		async (id: number) => {
			await send('Cancel', { Id: id });
			await refreshRequests();
		},
		[send, refreshRequests]
	);

	const approve = React.useCallback(
		async (id: number) => {
			await send('Approve', { Id: id });
			await refreshRequests();
			await refreshOwners();
			await refreshReserved();
		},
		[send, refreshRequests, refreshOwners, refreshReserved]
	);

	const reject = React.useCallback(
		async (id: number, reason?: string) => {
			const params: any = { Id: id };
			if (reason) params.Reason = reason;
			await send('Reject', params);
			console.log('rejected undername request', id, reason);
			await refreshRequests();
		},
		[send, refreshRequests]
	);

	const forceRelease = React.useCallback(
		async (name: string, reason?: string) => {
			const params: any = { Name: name };
			if (reason) params.Reason = reason;
			await send('ForceRelease', params);
			await refreshOwners();
		},
		[send, refreshOwners]
	);

	const setPolicy = React.useCallback(
		async (p: Partial<Policy>) => {
			const params: any = {};
			if (p.MaxPerAddr !== undefined) params.MaxPerAddr = String(p.MaxPerAddr);
			if (p.RequireApproval !== undefined) params.RequireApproval = p.RequireApproval ? 'true' : 'false';
			await send('SetPolicy', params);
			await refreshPolicy();
		},
		[send, refreshPolicy]
	);

	// initial load
	React.useEffect(() => {
		if (!libs) return;
		if (!ready) return;
		refreshAll();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ready, libs]);

	const value: UndernamesContextState = {
		ready,
		loading,
		error,

		controllers,
		owners,
		reserved,
		requests,
		policy,
		requestSeq,
		superAdmin,

		refreshAll,
		refreshOwners,
		refreshRequests,
		refreshReserved,
		refreshControllers,
		refreshPolicy,

		ownerOf,
		checkAvailability,

		bootstrap,
		addController,
		removeController,

		addReserved,
		removeReserved,

		request,
		cancel,
		approve,
		reject,

		forceRelease,
		setPolicy,
	};

	return <Ctx.Provider value={value}>{props.children}</Ctx.Provider>;
}
