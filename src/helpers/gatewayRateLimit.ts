export type GatewayRateLimitConfig = {
	'rate-limit-period': number;
	'rate-limit-requests': number;
	'rate-limit-max': number;
	'rate-limit-min': number;
};

// Opt in only when a deployment needs proactive throttling. Keep this module
// independent of SDK/feature imports so fetch is installed before SDK evaluation.
export const GATEWAY_PACING_ENABLED = import.meta.env.VITE_ENABLE_GATEWAY_PACING === 'true';

// Configure the gateway limits here. Runtime code can override them with
// setGatewayRateLimitConfig(); browser preferences never override these values.
export const DEFAULT_GATEWAY_RATE_LIMIT: GatewayRateLimitConfig = {
	'rate-limit-period': 240,
	'rate-limit-requests': 360,
	'rate-limit-max': 1200,
	'rate-limit-min': -120,
};

const BUDGET_KEY = 'portal:gateway-request-budget:v1';
const LOCK_KEY = 'portal:gateway-request-budget:v1';
// Retry-only mode must not inherit estimated debt or long inferred cooldowns
// persisted by the older, always-on pacing policy.
const RETRY_KEY = 'portal:gateway-retry-cooldown:v1';
const SAFETY_FACTOR = 0.8;
const MAX_CONCURRENCY = 4;
const MAX_BACKOFF_MS = 300_000;
const RETRY_ONLY_BASE_MS = 2000;
const RETRY_ONLY_MAX_MS = 30_000;

type Budget = {
	lastRequestAt: number | null;
	cooldownUntil: number;
	balance: number;
	updatedAt: number;
	requests: number[];
	totalRequests: number;
	rateLimitResponses: number;
};

export type GatewayRequestSnapshot = {
	config: GatewayRateLimitConfig;
	pacingEnabled: boolean;
	requestsInPeriod: number;
	totalRequests: number;
	queuedRequests: number;
	activeRequests: number;
	retryingRequests: number;
	rateLimitResponses: number;
	cooldownUntil: number;
	estimatedBalance: number;
	requestsPerSecond: number | null;
};

function validateConfig(value: unknown): GatewayRateLimitConfig {
	const config = value as GatewayRateLimitConfig;
	if (
		!config ||
		Object.keys(DEFAULT_GATEWAY_RATE_LIMIT).some((key) => !Number.isSafeInteger(config[key])) ||
		config['rate-limit-period'] < 1 ||
		config['rate-limit-period'] > 86_400 ||
		config['rate-limit-requests'] < 1 ||
		config['rate-limit-requests'] > 1_000_000 ||
		config['rate-limit-max'] < 2 ||
		config['rate-limit-max'] > 1_000_000 ||
		config['rate-limit-min'] > 0 ||
		config['rate-limit-min'] < -1_000_000
	) {
		throw new Error(
			'Use whole numbers: period 1–86400 seconds, requests 1–1000000, maximum 2–1000000, minimum -1000000–0.'
		);
	}
	return Object.fromEntries(
		Object.keys(DEFAULT_GATEWAY_RATE_LIMIT).map((key) => [key, config[key]])
	) as GatewayRateLimitConfig;
}

function readStorage(key: string): unknown {
	try {
		return JSON.parse(globalThis.localStorage?.getItem(key) || 'null');
	} catch {
		return null;
	}
}

function writeStorage(key: string, value: unknown) {
	try {
		if (!globalThis.localStorage) return false;
		globalThis.localStorage.setItem(key, JSON.stringify(value));
		return true;
	} catch {
		// Browsers that disallow storage still get a working in-memory limiter.
		return false;
	}
}

export function isRateLimitedGateway(input: RequestInfo | URL): boolean {
	try {
		const url = new URL(
			typeof input === 'string' ? input : input instanceof URL ? input.href : input.url,
			globalThis.location?.href
		);
		return (
			['https:', 'http:'].includes(url.protocol) &&
			(url.hostname === 'arweave.net' || url.hostname.endsWith('.arweave.net'))
		);
	} catch {
		return false;
	}
}

function throwIfAborted(signal?: AbortSignal) {
	if (signal?.aborted) throw signal.reason ?? new DOMException('The request was aborted.', 'AbortError');
}

class GatewayRequestManager {
	private config = validateConfig(DEFAULT_GATEWAY_RATE_LIMIT);
	private nativeFetch = globalThis.fetch.bind(globalThis);
	private installed = false;
	private budgetStorageAvailable = true;
	private listeners = new Set<() => void>();
	private waiters = new Set<() => void>();
	private active = 0;
	private queued = 0;
	private retrying = 0;
	private budget: Budget = {
		lastRequestAt: null,
		cooldownUntil: 0,
		// Do not assume a fresh browser owns the IP's full 1200-token burst.
		balance: 2,
		updatedAt: Date.now(),
		requests: [],
		totalRequests: 0,
		rateLimitResponses: 0,
	};

	constructor() {
		globalThis.addEventListener?.('storage', (event: StorageEvent) => {
			if (event.key === BUDGET_KEY || event.key === RETRY_KEY || event.key === null) this.changed();
		});
	}

	private changed() {
		this.waiters.forEach((wake) => wake());
		this.listeners.forEach((listener) => {
			try {
				listener();
			} catch (error) {
				console.error('Gateway request listener failed', error);
			}
		});
	}

	private interval() {
		return Math.ceil((this.config['rate-limit-period'] * 1000) / (this.config['rate-limit-requests'] * SAFETY_FACTOR));
	}

	private tokenInterval() {
		return (this.config['rate-limit-period'] * 1000) / this.config['rate-limit-requests'];
	}

	private readBudget() {
		const saved = (GATEWAY_PACING_ENABLED && this.budgetStorageAvailable ? readStorage(BUDGET_KEY) : null) as Budget;
		if (
			saved &&
			(saved.lastRequestAt === null || Number.isFinite(saved.lastRequestAt)) &&
			['cooldownUntil', 'balance', 'updatedAt', 'totalRequests', 'rateLimitResponses'].every((key) =>
				Number.isFinite(saved[key])
			) &&
			Array.isArray(saved.requests) &&
			saved.requests.every((time) => Number.isFinite(time))
		) {
			this.budget = saved;
		}
		if (!GATEWAY_PACING_ENABLED && this.budgetStorageAvailable) {
			const retry = readStorage(RETRY_KEY) as { cooldownUntil?: number };
			if (Number.isFinite(retry?.cooldownUntil)) {
				this.budget.cooldownUntil = Math.max(this.budget.cooldownUntil, retry.cooldownUntil);
			}
		}
		const now = Date.now();
		this.budget.balance = Math.min(
			this.config['rate-limit-max'],
			this.budget.balance + Math.max(0, now - this.budget.updatedAt) / this.tokenInterval()
		);
		this.budget.updatedAt = now;
		this.budget.requests = this.budget.requests.filter((time) => time > now - this.config['rate-limit-period'] * 1000);
		return this.budget;
	}

	private saveBudget() {
		// A quota failure must not let an older persisted budget replace newer
		// in-memory starts or cooldowns on the next reservation.
		this.budgetStorageAvailable = GATEWAY_PACING_ENABLED
			? writeStorage(BUDGET_KEY, this.budget)
			: writeStorage(RETRY_KEY, { cooldownUntil: this.budget.cooldownUntil });
	}

	private async locked<T>(action: () => T, signal?: AbortSignal): Promise<T> {
		const locks = globalThis.navigator?.locks;
		if (locks) {
			let started = false;
			try {
				return await locks.request(GATEWAY_PACING_ENABLED ? LOCK_KEY : RETRY_KEY, signal ? { signal } : {}, () => {
					started = true;
					return action();
				});
			} catch (error) {
				// Embedded/restricted contexts may expose Web Locks but deny access.
				// Never retry an action that ran, or swallow caller cancellation.
				if (started || !['SecurityError', 'NotSupportedError'].includes(error?.name)) throw error;
			}
		}
		throwIfAborted(signal);
		return action();
	}

	private wait(ms: number, signal: AbortSignal) {
		return new Promise<void>((resolve, reject) => {
			throwIfAborted(signal);
			const cleanup = () => {
				clearTimeout(timer);
				this.waiters.delete(wake);
				signal.removeEventListener('abort', abort);
			};
			const wake = () => {
				cleanup();
				resolve();
			};
			const abort = () => {
				cleanup();
				reject(signal.reason ?? new DOMException('The request was aborted.', 'AbortError'));
			};
			// Long Retry-After values must never overflow the browser timer range.
			const timer = setTimeout(wake, Math.min(Math.max(1, ms), 2_147_483_647));
			this.waiters.add(wake);
			signal.addEventListener('abort', abort, { once: true });
		});
	}

	private async acquire(signal: AbortSignal) {
		this.queued += 1;
		this.changed();
		try {
			while (true) {
				throwIfAborted(signal);
				const reserve = () => {
					throwIfAborted(signal);
					if (GATEWAY_PACING_ENABLED && this.active >= MAX_CONCURRENCY) return 1000;
					const budget = this.readBudget();
					const now = Date.now();
					// Recompute from the previous start so live edits affect queued work.
					const nextStart =
						GATEWAY_PACING_ENABLED && budget.lastRequestAt !== null ? budget.lastRequestAt + this.interval() : 0;
					const balanceDelay = GATEWAY_PACING_ENABLED ? Math.max(0, (2 - budget.balance) * this.tokenInterval()) : 0;
					const delay = Math.max(nextStart - now, budget.cooldownUntil - now, balanceDelay);
					if (delay > 0) return Math.ceil(delay);
					budget.balance -= 1;
					budget.lastRequestAt = now;
					budget.requests.push(now);
					budget.totalRequests += 1;
					if (GATEWAY_PACING_ENABLED) this.saveBudget();
					this.active += 1;
					return 0;
				};
				// Successful traffic has no artificial spacing/concurrency cap, Web
				// Lock contention, or per-request budget writes in the default mode.
				const delay = GATEWAY_PACING_ENABLED ? await this.locked(reserve, signal) : reserve();
				if (delay === 0) return;
				await this.wait(delay, signal);
			}
		} finally {
			this.queued -= 1;
			this.changed();
		}
	}

	private async rateLimited(response: Response, failures: number) {
		const retryAfter = response.headers.get('retry-after');
		const now = Date.now();
		let serverDelay: number | null = null;
		if (retryAfter !== null && retryAfter.trim() !== '') {
			if (/^\d+(?:\.\d+)?$/.test(retryAfter.trim())) serverDelay = Number(retryAfter) * 1000;
			else {
				const date = Date.parse(retryAfter);
				if (Number.isFinite(date)) serverDelay = Math.max(0, date - now);
			}
		}
		if (!Number.isFinite(serverDelay)) serverDelay = null;
		const tokenMs = this.tokenInterval();
		const recoveryMs = GATEWAY_PACING_ENABLED
			? Math.max(1000, (1 - this.config['rate-limit-min']) * tokenMs)
			: RETRY_ONLY_BASE_MS;
		const baseDelay = serverDelay ?? recoveryMs;
		const backoff = Math.min(
			GATEWAY_PACING_ENABLED ? MAX_BACKOFF_MS : RETRY_ONLY_MAX_MS,
			Math.max(1000, baseDelay) * Math.pow(2, Math.min(failures - 1, 10))
		);
		// Edge's Retry-After only recovers to zero. Add one token plus jitter,
		// and never cap a server-specified delay to our exponential-backoff cap.
		const recoveryTokenMs = GATEWAY_PACING_ENABLED || serverDelay !== null ? tokenMs : 0;
		const delay = Math.ceil(
			Math.max(baseDelay, backoff) + recoveryTokenMs + Math.random() * Math.min(1000, tokenMs / 4)
		);
		await this.locked(() => {
			const budget = this.readBudget();
			budget.balance = Math.min(
				budget.balance,
				serverDelay === null ? this.config['rate-limit-min'] : -serverDelay / tokenMs
			);
			budget.cooldownUntil = Math.max(budget.cooldownUntil, now + delay);
			budget.rateLimitResponses += 1;
			this.saveBudget();
		});
		this.changed();
	}

	private async attempt(request: Request, timeoutMs?: number) {
		if (!timeoutMs) return this.nativeFetch(request);
		const controller = new AbortController();
		const abort = () => controller.abort(request.signal.reason);
		request.signal.addEventListener('abort', abort, { once: true });
		if (request.signal.aborted) abort();
		const timer = setTimeout(
			() => controller.abort(new DOMException('The request timed out.', 'TimeoutError')),
			timeoutMs
		);
		try {
			const response = await this.nativeFetch(request, { signal: controller.signal });
			// The explicit timeout helper serves Engine Lite's JSON/text reads.
			// Buffer a clone so its deadline covers the body as well as headers,
			// while returning the original Response with its metadata intact.
			// Ordinary gatewayFetch remains streaming; 429 bodies are discarded.
			if (response.status !== 429) await response.clone().arrayBuffer();
			return response;
		} finally {
			clearTimeout(timer);
			request.signal.removeEventListener('abort', abort);
		}
	}

	async fetch(input: RequestInfo | URL, init?: RequestInit, timeoutMs?: number): Promise<Response> {
		if (!isRateLimitedGateway(input)) {
			if (!timeoutMs) return this.nativeFetch(input, init);
			return this.attempt(new Request(input, init), timeoutMs);
		}
		const source = typeof input === 'string' ? new URL(input, globalThis.location?.href).href : input;
		// Retain an unused template: Request bodies are otherwise consumed by the
		// first attempt (GraphQL POSTs and SDK requests also need safe 429 replay).
		const template = new Request(source, init);
		let failures = 0;
		try {
			while (true) {
				await this.acquire(template.signal);
				let response: Response;
				try {
					throwIfAborted(template.signal);
					const retryRead = failures > 0 && ['GET', 'HEAD'].includes(template.method);
					// Immutable reads use force-cache. If a browser has retained an error,
					// retry from the network and replace it with the successful response.
					// Preserve no-store for callers that explicitly prohibit storage.
					const request =
						retryRead && template.cache !== 'no-store'
							? new Request(template.clone(), { cache: 'reload' })
							: template.clone();
					response = await this.attempt(request, timeoutMs);
					if (response.status !== 429) return response;
					if (failures === 0) this.retrying += 1;
					failures += 1;
					await this.rateLimited(response, failures);
					// Do not retain unconsumed 429 bodies/connections during long waits.
					void response.body?.cancel().catch(() => undefined);
				} finally {
					this.active -= 1;
					this.changed();
				}
			}
		} finally {
			if (failures > 0) {
				this.retrying -= 1;
				this.changed();
			}
		}
	}

	install() {
		if (this.installed) return;
		this.installed = true;
		globalThis.fetch = this.fetch.bind(this);
	}

	getConfig() {
		return { ...this.config };
	}

	setConfig(value: GatewayRateLimitConfig) {
		this.config = validateConfig(value);
		// Existing IP debt and Retry-After deadlines survive configuration edits.
		this.changed();
	}

	snapshot(): GatewayRequestSnapshot {
		const budget = this.readBudget();
		return {
			config: this.getConfig(),
			pacingEnabled: GATEWAY_PACING_ENABLED,
			requestsInPeriod: budget.requests.length,
			totalRequests: budget.totalRequests,
			queuedRequests: this.queued,
			activeRequests: this.active,
			retryingRequests: this.retrying,
			rateLimitResponses: budget.rateLimitResponses,
			cooldownUntil: budget.cooldownUntil,
			estimatedBalance: Math.max(this.config['rate-limit-min'], budget.balance),
			requestsPerSecond: GATEWAY_PACING_ENABLED
				? (this.config['rate-limit-requests'] / this.config['rate-limit-period']) * SAFETY_FACTOR
				: null,
		};
	}

	subscribe(listener: () => void) {
		this.listeners.add(listener);
		return () => {
			this.listeners.delete(listener);
		};
	}
}

// The editor can embed another Portal bundle; never wrap fetch twice or split
// its budget when both entrypoints run in the same window.
const shared = globalThis as typeof globalThis & { __portalGatewayRequestManager?: GatewayRequestManager };
const manager = (shared.__portalGatewayRequestManager ??= new GatewayRequestManager());

export const gatewayFetch = (input: RequestInfo | URL, init?: RequestInit) => manager.fetch(input, init);
export const fetchGatewayWithTimeout = (input: RequestInfo | URL, init: RequestInit, timeoutMs: number) =>
	manager.fetch(input, init, timeoutMs);
export const installGatewayFetch = () => manager.install();
export const getGatewayRateLimitConfig = () => manager.getConfig();
export const setGatewayRateLimitConfig = (config: GatewayRateLimitConfig) => manager.setConfig(config);
export const getGatewayRequestSnapshot = () => manager.snapshot();
export const subscribeGatewayRequests = (listener: () => void) => manager.subscribe(listener);
