import { getGatewayRequestSnapshot, subscribeGatewayRequests } from './gatewayRateLimit';

export const GATEWAY_RETRY_MESSAGE =
	'The gateway is rate limiting requests. Portal is waiting and retrying automatically.';

type GatewayRetryNoticeMount = {
	users: number;
	nativeNoticeUsers: number;
	reactNoticeOwners: Set<(ownsNotice: boolean) => void>;
	setShowRetryNotice: (show: boolean) => void;
	dispose: () => void;
};

const shared = globalThis as typeof globalThis & { __portalGatewayRetryNotice?: GatewayRetryNoticeMount };

function updateNoticeOwner(notice: GatewayRetryNoticeMount) {
	const owner = notice.reactNoticeOwners.values().next().value;
	for (const listener of notice.reactNoticeOwners) listener(listener === owner);
	notice.setShowRetryNotice(notice.nativeNoticeUsers === notice.users);
}

// Embedded Portal bundles share one notice, with a React NotificationProvider
// taking ownership when mounted alongside the native Engine Lite notice.
export function mountGatewayRetryNotice({
	showRetryNotice = false,
	onRetryNoticeOwnershipChange,
}: { showRetryNotice?: boolean; onRetryNoticeOwnershipChange?: (ownsNotice: boolean) => void } = {}): () => void {
	const notice = (shared.__portalGatewayRetryNotice ??= {
		...createRetryNotice(),
		users: 0,
		nativeNoticeUsers: 0,
		reactNoticeOwners: new Set<(ownsNotice: boolean) => void>(),
	});
	notice.users += 1;
	if (showRetryNotice) notice.nativeNoticeUsers += 1;
	if (onRetryNoticeOwnershipChange) notice.reactNoticeOwners.add(onRetryNoticeOwnershipChange);
	updateNoticeOwner(notice);
	let released = false;
	return () => {
		if (released) return;
		released = true;
		notice.users -= 1;
		if (showRetryNotice) notice.nativeNoticeUsers -= 1;
		if (onRetryNoticeOwnershipChange) notice.reactNoticeOwners.delete(onRetryNoticeOwnershipChange);
		if (notice.users === 0) {
			notice.dispose();
			delete shared.__portalGatewayRetryNotice;
		} else {
			updateNoticeOwner(notice);
		}
	};
}

function createRetryNotice() {
	const wrapper = document.createElement('div');
	wrapper.dataset.gatewayRetryNotice = '';
	wrapper.innerHTML = `
		<style>
			[data-gateway-retry-notice] [role="status"] { position: fixed; z-index: 31; left: 50%; bottom: 20px; transform: translateX(-50%); box-sizing: border-box; width: max-content; max-width: calc(100vw - 32px); padding: 12px 16px; border: 1px solid #ddbe75; border-radius: 10px; background: #fff8e5; color: #664716; box-shadow: 0 4px 18px #0002; font: 14px/1.5 system-ui, sans-serif; }
			[data-gateway-retry-notice] [hidden] { display: none !important; }
		</style>
		<div role="status" aria-live="polite" hidden></div>
	`;
	// Keep retry status visible while Engine Lite replaces its application root.
	document.body.appendChild(wrapper);
	const notice = wrapper.querySelector<HTMLElement>('[role="status"]')!;
	let frame: number | undefined;
	let disposed = false;
	let showRetryNotice = false;

	function update() {
		const retrying = showRetryNotice && getGatewayRequestSnapshot().retryingRequests > 0;
		if (retrying && notice.hidden) notice.textContent = GATEWAY_RETRY_MESSAGE;
		notice.hidden = !retrying;
	}

	const unsubscribe = subscribeGatewayRequests(() => {
		if (disposed || frame !== undefined || !showRetryNotice) return;
		frame = requestAnimationFrame(() => {
			frame = undefined;
			update();
		});
	});

	return {
		setShowRetryNotice(show: boolean) {
			showRetryNotice = show;
			update();
		},
		dispose() {
			disposed = true;
			unsubscribe();
			if (frame !== undefined) cancelAnimationFrame(frame);
			wrapper.remove();
		},
	};
}
