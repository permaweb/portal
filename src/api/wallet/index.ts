import {
	createWebWalletClientProvider,
	openWebWallet as openPackageWebWallet,
	resolveWebWalletConnectionUrl as resolvePackageWebWalletConnectionUrl,
	type WalletAppInfo,
	type WebWalletLocation,
} from '@permaweb/web-wallet';

import { PERMAWEBOS_WALLET_URL } from 'helpers/config';

export type BrowserWalletId = 'permaweb-os' | 'wander';

export type BrowserWallet = {
	events?: {
		on(type: 'activeAddress' | 'disconnect', handler: (value: unknown) => void): void;
		off(type: 'activeAddress' | 'disconnect', handler: (value: unknown) => void): void;
	};
	connect(permissions: string[], appInfo?: WalletAppInfo): Promise<void>;
	disconnect?(): Promise<void>;
	getActiveAddress(): Promise<string>;
	getPermissions?(): Promise<string[]>;
};

type BrowserWalletScope = {
	arweaveWallet?: unknown;
	permawebConnect?: unknown;
};

const ARWEAVE_ADDRESS = /^[A-Za-z0-9_-]{43}$/;
const PORTAL_APP_INFO = { name: 'Portal' };
const WALLET_RESPONSE_TIMEOUT_MS = 10_000;
const WALLET_APPROVAL_TIMEOUT_MS = 125_000;
const SLOW_WALLET_PHASE_MS = 1_000;
let rememberedWanderWallet: BrowserWallet | undefined;

type WalletConnectionPhase = 'permissions' | 'connect' | 'active-address';

class WalletConnectionTimeoutError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'WalletConnectionTimeoutError';
	}
}

function isWalletTimeout(error: unknown): boolean {
	return (
		error instanceof WalletConnectionTimeoutError ||
		(error instanceof Error && /tim(?:e|ed)[ -]?out/i.test(error.message))
	);
}

async function runWalletPhase<T>(
	walletName: string,
	phase: WalletConnectionPhase,
	timeoutMs: number,
	timeoutMessage: string,
	operation: () => Promise<T>
): Promise<T> {
	const startedAt = Date.now();
	let outcome: 'completed' | 'failed' | 'timed-out' = 'completed';
	let timer: ReturnType<typeof globalThis.setTimeout> | undefined;
	try {
		return await Promise.race([
			operation(),
			new Promise<T>((_resolve, reject) => {
				timer = globalThis.setTimeout(() => reject(new WalletConnectionTimeoutError(timeoutMessage)), timeoutMs);
			}),
		]);
	} catch (error) {
		outcome = isWalletTimeout(error) ? 'timed-out' : 'failed';
		if (outcome === 'timed-out' && !(error instanceof WalletConnectionTimeoutError)) {
			throw new WalletConnectionTimeoutError(timeoutMessage);
		}
		throw error;
	} finally {
		if (timer !== undefined) globalThis.clearTimeout(timer);
		const durationMs = Date.now() - startedAt;
		if (durationMs >= SLOW_WALLET_PHASE_MS) {
			console.warn('[wallet-connection]', { wallet: walletName, phase, durationMs, outcome });
		}
	}
}

export const webWalletClientProvider = createWebWalletClientProvider({
	walletUrl: PERMAWEBOS_WALLET_URL,
});

export function resolveWebWalletConnectionUrl(
	location: WebWalletLocation,
	walletUrl: string | URL = PERMAWEBOS_WALLET_URL
): URL {
	return resolvePackageWebWalletConnectionUrl(location, walletUrl);
}

function isBrowserWallet(value: unknown): value is BrowserWallet {
	return Boolean(
		value &&
			typeof value === 'object' &&
			typeof (value as BrowserWallet).connect === 'function' &&
			typeof (value as BrowserWallet).getActiveAddress === 'function'
	);
}

export function resolveBrowserWallet(scope: BrowserWalletScope, walletId: BrowserWalletId) {
	if (walletId === 'permaweb-os') {
		if (
			isBrowserWallet(scope.arweaveWallet) &&
			scope.arweaveWallet !== scope.permawebConnect &&
			scope.arweaveWallet !== webWalletClientProvider
		) {
			rememberedWanderWallet = scope.arweaveWallet;
		}
		return isBrowserWallet(scope.permawebConnect) ? scope.permawebConnect : webWalletClientProvider;
	}
	if (
		isBrowserWallet(scope.arweaveWallet) &&
		scope.arweaveWallet !== scope.permawebConnect &&
		scope.arweaveWallet !== webWalletClientProvider
	) {
		rememberedWanderWallet = scope.arweaveWallet;
	}
	return rememberedWanderWallet;
}

export function hasInjectedPermawebWallet(scope: BrowserWalletScope): boolean {
	return isBrowserWallet(scope.permawebConnect);
}

export function isEmbeddedBrowserWallet(wallet: BrowserWallet | null | undefined): boolean {
	return wallet === webWalletClientProvider;
}

export function openEmbeddedWebWallet(): void {
	openPackageWebWallet(webWalletClientProvider);
}

export function isArweaveAddress(value: unknown): value is string {
	return typeof value === 'string' && ARWEAVE_ADDRESS.test(value);
}

export async function connectBrowserWallet(
	scope: BrowserWalletScope,
	walletId: BrowserWalletId,
	permissions: string[]
) {
	const wallet = resolveBrowserWallet(scope, walletId);
	const walletName = walletId === 'permaweb-os' ? 'PermawebOS' : 'Wander';
	if (!wallet) throw new Error(`${walletName} wallet was not found`);

	let alreadyApproved = false;
	if (walletId === 'permaweb-os' && wallet.getPermissions) {
		try {
			const granted = await runWalletPhase(
				walletName,
				'permissions',
				WALLET_RESPONSE_TIMEOUT_MS,
				'PermawebOS did not respond while checking permissions. Reload the wallet extension and try again.',
				() => wallet.getPermissions!()
			);
			alreadyApproved = permissions.every((permission) => granted.includes(permission));
		} catch (error) {
			if (error instanceof WalletConnectionTimeoutError) throw error;
		}
	}

	await runWalletPhase(
		walletName,
		'connect',
		alreadyApproved ? WALLET_RESPONSE_TIMEOUT_MS : WALLET_APPROVAL_TIMEOUT_MS,
		alreadyApproved
			? `${walletName} did not respond to an already-approved connection. Reload the wallet extension and try again.`
			: `${walletName} connection timed out. Open the wallet, finish approval, and try again.`,
		() => (walletId === 'permaweb-os' ? wallet.connect(permissions, PORTAL_APP_INFO) : wallet.connect(permissions))
	);
	const address = await runWalletPhase(
		walletName,
		'active-address',
		WALLET_RESPONSE_TIMEOUT_MS,
		`${walletName} connected, but its active address did not respond. Unlock or reload the wallet and try again.`,
		() => wallet.getActiveAddress()
	);
	if (!isArweaveAddress(address)) throw new Error('The wallet returned an invalid active address');
	return { address, wallet };
}

export async function restoreBrowserWallet(
	scope: BrowserWalletScope,
	walletId: BrowserWalletId,
	permissions: string[]
) {
	const wallet = resolveBrowserWallet(scope, walletId);
	if (!wallet) return undefined;
	if (walletId === 'permaweb-os' && wallet.getPermissions) {
		const granted: string[] = await wallet.getPermissions().catch(() => []);
		if (!permissions.every((permission) => granted.includes(permission))) return undefined;
	}
	const address = await wallet.getActiveAddress().catch(() => undefined);
	return isArweaveAddress(address) ? { address, wallet } : undefined;
}
