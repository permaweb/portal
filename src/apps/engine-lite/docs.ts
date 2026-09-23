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
	if (!shell || !sidebar || !search) return () => undefined;
	const controller = new AbortController();
	const { signal } = controller;
	const mobile = window.matchMedia('(max-width: 800px)');
	const main = root.querySelector<HTMLElement>('[data-docs-main]');
	const backdrop = root.querySelector<HTMLButtonElement>('[data-docs-sidebar-close]');
	const opener = root.querySelector<HTMLButtonElement>('[data-docs-sidebar-open]');
	const groups = Array.from(root.querySelectorAll<HTMLElement>('[data-docs-group]'));
	const previousOverflow = document.body.style.overflow;

	const syncSidebar = () => {
		const open = mobile.matches ? state.mobileOpen : !state.collapsed;
		shell.classList.toggle('is-sidebar-collapsed', state.collapsed);
		shell.classList.toggle('is-sidebar-open', mobile.matches && open);
		sidebar.inert = !open;
		if (main) main.inert = mobile.matches && open;
		if (backdrop) backdrop.hidden = !(mobile.matches && open);
		if (opener) opener.inert = mobile.matches && open;
		document.body.style.overflow = mobile.matches && open ? 'hidden' : previousOverflow;
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
		if (focus) (open ? search : opener)?.focus({ preventScroll: true });
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
	const filterNavigation = () => {
		const query = state.query.trim().toLowerCase();
		let matches = 0;
		groups.forEach((group) => {
			let groupMatches = 0;
			group.querySelectorAll<HTMLElement>('[data-docs-search-text]').forEach((item) => {
				item.hidden = Boolean(query && !item.dataset.docsSearchText?.includes(query));
				if (!item.hidden) groupMatches += 1;
			});
			matches += groupMatches;
			group.hidden = groupMatches === 0;
			const open = Boolean(query) || !state.collapsedCategories.has(group.dataset.docsGroup || '');
			const list = group.querySelector('ul');
			if (list) list.hidden = !open;
			const button = group.querySelector<HTMLButtonElement>('[data-docs-category-toggle]');
			button?.setAttribute('aria-expanded', String(open));
		});
		const status = root.querySelector<HTMLElement>('[data-docs-search-status]');
		if (status) {
			status.hidden = !query;
			status.textContent = matches ? `${matches} ${matches === 1 ? 'page' : 'pages'} found` : 'No pages found.';
		}
	};
	groups.forEach((group) => {
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
			filterNavigation();
		},
		{ signal }
	);
	search.addEventListener(
		'keydown',
		(event) => {
			if (event.key === 'Enter') {
				const first = groups.find((group) => !group.hidden)?.querySelector<HTMLAnchorElement>('li:not([hidden]) a');
				first?.click();
			}
		},
		{ signal }
	);
	const shortcut = root.querySelector('.lite-docs-search kbd');
	if (shortcut && !/Mac|iPhone|iPad/.test(navigator.platform)) shortcut.textContent = 'Ctrl K';
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
			if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
				event.preventDefault();
				setOpen(true);
				search.select();
			}
			if (event.key === 'Escape') {
				if (document.activeElement === search && search.value) {
					event.preventDefault();
					search.value = state.query = '';
					filterNavigation();
				} else if (mobile.matches && state.mobileOpen) setOpen(false);
			}
			if (event.key === 'Tab' && mobile.matches && state.mobileOpen) {
				const focusable = Array.from(sidebar.querySelectorAll<HTMLElement>('a[href], button, input')).filter(
					(element) => !element.closest('[hidden]')
				);
				const first = focusable[0];
				const last = focusable[focusable.length - 1];
				if (event.shiftKey && document.activeElement === first) {
					event.preventDefault();
					last?.focus();
				} else if (!event.shiftKey && document.activeElement === last) {
					event.preventDefault();
					first?.focus();
				}
			}
		},
		{ signal }
	);
	syncSidebar();
	filterNavigation();
	return () => {
		controller.abort();
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
		link.href = `#${heading.id}`;
		link.textContent = heading.textContent;
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
	const updateActive = () => {
		frame = 0;
		let next = 0;
		sections.forEach((heading, index) => {
			if (heading.getBoundingClientRect().top <= 112) next = index;
		});
		if (window.scrollY > 0 && window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2)
			next = sections.length - 1;
		if (next === activeIndex) return;
		activeIndex = next;
		links.forEach((link, index) => {
			link.classList.toggle('is-active', index === next);
			if (index === next) link.setAttribute('aria-current', 'location');
			else link.removeAttribute('aria-current');
		});
	};
	const schedule = () => {
		if (!frame) frame = window.requestAnimationFrame(updateActive);
	};
	window.addEventListener('scroll', schedule, { passive: true, signal });
	window.addEventListener('resize', schedule, { signal });
	updateActive();
	return () => {
		controller.abort();
		window.cancelAnimationFrame(frame);
	};
}
