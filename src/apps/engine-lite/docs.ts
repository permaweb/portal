export type DocsSidebarState = {
	collapsed: boolean;
	mobileOpen: boolean;
	query: string;
	collapsedCategories: Set<string>;
};

// Keep these initializers self-contained so the editor iframe can use the same interactions.
export function attachDocsSidebar(root: ParentNode, state: DocsSidebarState) {
	const shell = root.querySelector<HTMLElement>('.lite-shell.is-docs');
	const sidebar = root.querySelector<HTMLElement>('.lite-docs-sidebar');
	const search = root.querySelector<HTMLInputElement>('[data-docs-search]');
	const dialog = root.querySelector<HTMLElement>('[data-docs-search-dialog]');
	const results = dialog?.querySelector<HTMLElement>('.lite-docs-search-results');
	if (!shell || !sidebar || !search || !dialog || !results) return () => undefined;
	const controller = new AbortController();
	const { signal } = controller;
	const mobile = window.matchMedia('(max-width: 800px)');
	const main = root.querySelector<HTMLElement>('[data-docs-main]');
	const backdrop = root.querySelector<HTMLButtonElement>('[data-docs-sidebar-close]');
	const opener = root.querySelector<HTMLButtonElement>('[data-docs-sidebar-open]');
	const mobileBar = root.querySelector<HTMLElement>('.lite-docs-mobile-bar');
	const searchTrigger = sidebar.querySelector<HTMLButtonElement>('[data-docs-search-open]');
	const mobileSearchTrigger = root.querySelector<HTMLButtonElement>('[data-docs-search-mobile]');
	const groups = Array.from(root.querySelectorAll<HTMLElement>('[data-docs-group]'));
	const searchItems = Array.from(results.querySelectorAll<HTMLElement>('[data-docs-search-text]'));
	const previousOverflow = document.body.style.overflow;
	let searchOpen = false;
	let previousFocus: HTMLElement | null = null;

	const syncSidebar = () => {
		const open = mobile.matches ? state.mobileOpen : !state.collapsed;
		shell.classList.toggle('is-sidebar-collapsed', state.collapsed);
		shell.classList.toggle('is-sidebar-open', mobile.matches && open);
		sidebar.inert = searchOpen || !open;
		if (main) main.inert = searchOpen || (mobile.matches && open);
		if (mobileBar) mobileBar.inert = searchOpen || (mobile.matches && open);
		if (backdrop) backdrop.hidden = !(mobile.matches && open);
		if (opener) opener.inert = mobile.matches && open;
		document.body.style.overflow = searchOpen || (mobile.matches && open) ? 'hidden' : previousOverflow;
		root.querySelectorAll<HTMLButtonElement>('[data-docs-sidebar-toggle]').forEach((button) => {
			button.setAttribute('aria-expanded', String(open));
			button.setAttribute('aria-label', open ? 'Collapse sidebar' : 'Expand sidebar');
			button.title = open ? 'Collapse sidebar' : 'Expand sidebar';
		});
	};
	const setOpen = (open: boolean, focus = true) => {
		if (mobile.matches) state.mobileOpen = open;
		else state.collapsed = !open;
		syncSidebar();
		if (focus) (open ? searchTrigger : opener)?.focus({ preventScroll: true });
	};
	root.querySelectorAll<HTMLButtonElement>('[data-docs-sidebar-toggle]').forEach((button) => {
		button.addEventListener('click', () => setOpen(mobile.matches ? !state.mobileOpen : state.collapsed), { signal });
	});
	backdrop?.addEventListener('click', () => setOpen(false), { signal });
	mobile.addEventListener(
		'change',
		() => {
			state.mobileOpen = false;
			syncSidebar();
		},
		{ signal }
	);
	const filterSearch = () => {
		const terms = state.query.trim().toLowerCase().split(/\s+/).filter(Boolean);
		let matches = 0;
		searchItems.forEach((item) => {
			item.hidden = !terms.length || !terms.every((term) => item.dataset.docsSearchText?.includes(term));
			if (!item.hidden) matches += 1;
		});
		results.hidden = matches === 0;
		results.scrollTop = 0;
		const status = dialog.querySelector<HTMLElement>('[data-docs-search-status]');
		if (status) {
			status.textContent = !terms.length
				? 'Search all documentation pages.'
				: matches
				? `${matches} ${matches === 1 ? 'page' : 'pages'} found`
				: 'No pages found.';
		}
	};
	const openSearch = () => {
		if (searchOpen) return;
		previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
		searchOpen = true;
		state.mobileOpen = false;
		dialog.hidden = false;
		syncSidebar();
		filterSearch();
		search.focus({ preventScroll: true });
		search.select();
	};
	const closeSearch = () => {
		if (!searchOpen) return;
		searchOpen = false;
		dialog.hidden = true;
		syncSidebar();
		const fallback = mobile.matches || state.collapsed ? mobileSearchTrigger : searchTrigger;
		const toolbarHidden = !mobile.matches && !state.collapsed && mobileBar?.contains(previousFocus);
		const focus =
			previousFocus?.isConnected && !previousFocus.closest('[inert], [hidden]') && !toolbarHidden
				? previousFocus
				: fallback;
		(focus === document.body ? fallback : focus)?.focus({ preventScroll: true });
	};
	root.querySelectorAll('[data-docs-search-open]').forEach((button) => {
		button.addEventListener('click', openSearch, { signal });
	});
	dialog.querySelector('[data-docs-search-close]')?.addEventListener('click', closeSearch, { signal });
	dialog.addEventListener(
		'click',
		(event) => {
			if (event.target === dialog) closeSearch();
		},
		{ signal }
	);
	results.querySelectorAll('a').forEach((link) =>
		link.addEventListener(
			'click',
			(event) => {
				if (!event.button && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) closeSearch();
			},
			{ signal }
		)
	);
	groups.forEach((group) => {
		const open = !state.collapsedCategories.has(group.dataset.docsGroup || '');
		const list = group.querySelector('ul');
		if (list) list.hidden = !open;
		group.querySelector('[data-docs-category-toggle]')?.setAttribute('aria-expanded', String(open));
		group.querySelector('[data-docs-category-toggle]')?.addEventListener(
			'click',
			() => {
				const key = group.dataset.docsGroup || '';
				const list = group.querySelector('ul');
				const open = Boolean(list?.hidden);
				if (open) state.collapsedCategories.delete(key);
				else state.collapsedCategories.add(key);
				if (list) list.hidden = !open;
				group.querySelector('[data-docs-category-toggle]')?.setAttribute('aria-expanded', String(open));
			},
			{ signal }
		);
	});
	search.value = state.query;
	search.addEventListener(
		'input',
		() => {
			state.query = search.value;
			filterSearch();
		},
		{ signal }
	);
	search.addEventListener(
		'keydown',
		(event) => {
			if (event.key === 'Enter' && !event.isComposing) {
				event.preventDefault();
				const first = results.querySelector<HTMLAnchorElement>('li:not([hidden]) a');
				first?.click();
			}
		},
		{ signal }
	);
	root.querySelectorAll<HTMLAnchorElement>('[data-docs-link], .lite-docs-brand a').forEach((link) => {
		link.addEventListener(
			'click',
			(event) => {
				if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
				if (mobile.matches) setOpen(false);
			},
			{ signal }
		);
	});
	document.addEventListener(
		'keydown',
		(event) => {
			if (event.defaultPrevented || event.isComposing) return;
			const target = event.target;
			const editing =
				target instanceof Element &&
				target.closest(
					'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"], [role="combobox"], [role="spinbutton"]'
				);
			const shortcut =
				(event.key === '/' && !event.metaKey && !event.ctrlKey) ||
				((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k');
			if (
				shortcut &&
				!event.altKey &&
				!event.repeat &&
				!editing &&
				!searchOpen &&
				!document.querySelector('[role="dialog"][aria-modal="true"]:not([hidden]), dialog[open]')
			) {
				event.preventDefault();
				openSearch();
				return;
			}
			if (event.key === 'Escape') {
				if (searchOpen) {
					event.preventDefault();
					closeSearch();
				} else if (mobile.matches && state.mobileOpen) setOpen(false);
			}
			if (searchOpen && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
				const links = Array.from(results.querySelectorAll<HTMLAnchorElement>('li:not([hidden]) a'));
				const index = links.findIndex((link) => link === document.activeElement);
				if (links.length && (document.activeElement === search || index >= 0)) {
					event.preventDefault();
					const next =
						index < 0
							? event.key === 'ArrowDown'
								? 0
								: links.length - 1
							: (index + (event.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length;
					links[next].focus();
				}
			}
			if (event.key === 'Tab' && (searchOpen || (mobile.matches && state.mobileOpen))) {
				const container = searchOpen ? dialog : sidebar;
				const focusable = Array.from(container.querySelectorAll<HTMLElement>('a[href], button, input')).filter(
					(element) => !element.closest('[hidden]')
				);
				const first = focusable[0];
				const last = focusable[focusable.length - 1];
				if (event.shiftKey && (document.activeElement === first || !container.contains(document.activeElement))) {
					event.preventDefault();
					last?.focus();
				} else if (
					!event.shiftKey &&
					(document.activeElement === last || !container.contains(document.activeElement))
				) {
					event.preventDefault();
					first?.focus();
				}
			}
		},
		{ signal }
	);
	syncSidebar();
	filterSearch();
	return () => {
		controller.abort();
		searchOpen = false;
		state.mobileOpen = false;
		dialog.hidden = true;
		syncSidebar();
		document.body.style.overflow = previousOverflow;
	};
}

export function attachDocsTableOfContents(root: ParentNode) {
	const headings = Array.from(root.querySelectorAll<HTMLElement>('.lite-docs-copy :is(h1, h2, h3, h4, h5, h6)'));
	const usedIds = new Set<string>();
	headings.forEach((heading, index) => {
		const base =
			heading.id ||
			heading.textContent
				?.toLowerCase()
				.trim()
				.replace(/\s+/g, '-')
				.replace(/[^\w-]/g, '') ||
			`section-${index + 1}`;
		let id = base;
		let suffix = 2;
		while (usedIds.has(id)) id = `${base}-${suffix++}`;
		heading.id = id;
		usedIds.add(id);
	});
	const toc = root.querySelector<HTMLElement>('[data-docs-toc]');
	const list = toc?.querySelector('ul');
	const sections = headings.filter((heading) => heading.tagName !== 'H1');
	if (!toc || !list || !sections.length) return () => undefined;
	toc.hidden = false;
	list.replaceChildren();
	const controller = new AbortController();
	const { signal } = controller;
	const baseLevel = Math.min(...sections.map((heading) => Number(heading.tagName.slice(1))));
	const links = sections.map((heading) => {
		const item = document.createElement('li');
		const link = document.createElement('a');
		const label = document.createElement('span');
		link.href = `#${heading.id}`;
		label.textContent = heading.textContent;
		link.appendChild(label);
		link.style.setProperty('--toc-depth', String(Math.min(2, Number(heading.tagName.slice(1)) - baseLevel)));
		link.addEventListener(
			'click',
			(event) => {
				event.preventDefault();
				const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
				window.scrollTo({
					top: heading.getBoundingClientRect().top + window.scrollY - 96,
					behavior: reducedMotion ? 'auto' : 'smooth',
				});
			},
			{ signal }
		);
		item.appendChild(link);
		list.appendChild(item);
		return link;
	});
	let frame = 0;
	let activeIndex = -1;
	let needsMeasure = true;
	let disposed = false;
	let sectionTops: number[] = [];
	let linkPositions: { top: number; height: number }[] = [];
	let maxScroll = 0;
	const measure = () => {
		const scrollY = window.scrollY;
		sectionTops = sections.map((heading) => heading.getBoundingClientRect().top + scrollY);
		const listTop = list.getBoundingClientRect().top;
		linkPositions = links.map((link) => {
			const textBounds = link.firstElementChild.getBoundingClientRect();
			return { top: textBounds.top - listTop, height: textBounds.height };
		});
		maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
		needsMeasure = false;
	};
	const updateActive = () => {
		frame = 0;
		const measured = needsMeasure;
		if (needsMeasure) measure();
		// Scroll frames only read scrollY; heading and TOC geometry changes are measured separately.
		const scrollY = Math.max(0, window.scrollY);
		let low = 0;
		let high = sectionTops.length;
		while (low < high) {
			const middle = (low + high) >>> 1;
			if (sectionTops[middle] <= scrollY + 112) low = middle + 1;
			else high = middle;
		}
		const next = maxScroll > 0 && scrollY >= maxScroll - 2 ? sections.length - 1 : Math.max(0, low - 1);
		if (next === activeIndex && !measured) return;
		if (next !== activeIndex) {
			links[activeIndex]?.classList.remove('is-active');
			links[activeIndex]?.removeAttribute('aria-current');
			links[next].classList.add('is-active');
			links[next].setAttribute('aria-current', 'location');
		}
		activeIndex = next;
		list.style.setProperty('--toc-indicator-top', `${linkPositions[next].top}px`);
		list.style.setProperty('--toc-indicator-height', `${linkPositions[next].height}px`);
	};
	const schedule = () => {
		if (!disposed && !frame) frame = window.requestAnimationFrame(updateActive);
	};
	const invalidate = () => {
		needsMeasure = true;
		schedule();
	};
	window.addEventListener('scroll', schedule, { passive: true, signal });
	window.addEventListener('resize', invalidate, { signal });
	const article = root.querySelector<HTMLElement>('.lite-docs-article-column');
	const resizeObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(invalidate) : null;
	if (article) {
		resizeObserver?.observe(article);
		article.addEventListener('load', invalidate, { capture: true, signal });
	}
	resizeObserver?.observe(list);
	document.fonts?.addEventListener('loadingdone', invalidate, { signal });
	void document.fonts?.ready.then(() => {
		if (!disposed) invalidate();
	});
	updateActive();
	return () => {
		disposed = true;
		controller.abort();
		resizeObserver?.disconnect();
		window.cancelAnimationFrame(frame);
	};
}
