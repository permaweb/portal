import { ENGINE_LITE_FALLBACK_LOGO } from './constants';

export function createSiteLoader(root: HTMLElement) {
	let loader = document.getElementById('portal-site-loader');
	if (!loader) {
		loader = document.createElement('div');
		loader.id = 'portal-site-loader';
		loader.innerHTML = `<div id="portal-site-loader-logo">${ENGINE_LITE_FALLBACK_LOGO}</div>`;
		document.body.appendChild(loader);
	}
	loader.classList.add('lite-site-loader');
	loader.setAttribute('role', 'status');
	loader.setAttribute('aria-live', 'polite');
	const status = document.createElement('div');
	status.className = 'lite-site-loader-status';
	status.innerHTML = '<span class="lite-site-loader-spinner" aria-hidden="true"></span><span></span>';
	const label = status.lastElementChild;
	loader.appendChild(status);
	let revision = 0;
	let frame = 0;
	let timer = 0;
	let loading = false;
	let previousInert = root.inert;

	const cancelHide = () => {
		window.cancelAnimationFrame(frame);
		window.clearTimeout(timer);
	};

	return {
		show(message = 'Loading site…') {
			revision += 1;
			cancelHide();
			if (!loading) previousInert = root.inert;
			loading = true;
			label.textContent = message;
			loader.setAttribute('aria-label', message);
			loader.removeAttribute('aria-hidden');
			loader.hidden = false;
			loader.classList.remove('is-hidden');
			root.setAttribute('aria-busy', 'true');
			root.inert = true;
			document.body.classList.add('lite-site-loading');
		},
		hide() {
			const request = ++revision;
			cancelHide();
			// Let the newly rendered page paint before fading the overlay away.
			frame = window.requestAnimationFrame(() => {
				frame = window.requestAnimationFrame(() => {
					if (request !== revision) return;
					loader.classList.add('is-hidden');
					loader.setAttribute('aria-hidden', 'true');
					root.setAttribute('aria-busy', 'false');
					root.inert = previousInert;
					loading = false;
					document.body.classList.remove('lite-site-loading');
					timer = window.setTimeout(() => {
						if (request === revision) loader.hidden = true;
					}, 180);
				});
			});
		},
	};
}
