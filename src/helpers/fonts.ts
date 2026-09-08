const requestedFonts = new Set<string>();

/** Load only selected fonts, sharing stylesheets across providers and previews. */
export function loadPortalFonts(fonts: Array<string | null | undefined>) {
	if (typeof document === 'undefined') return;

	// These variable fonts are already provided in full by the editor/viewer HTML.
	const eagerFamilies = new Set(
		Array.from(document.querySelectorAll<HTMLLinkElement>('link[data-portal-fonts]')).flatMap((link) =>
			(link.dataset.portalFonts || '').split('|')
		)
	);
	const families = [
		...new Set(fonts.filter((font): font is string => typeof font === 'string').map((font) => font.trim())),
	]
		.filter(Boolean)
		.filter((font) => !eagerFamilies.has(font.split(':')[0].trim()) && !requestedFonts.has(font));
	if (!families.length) return;

	const link = document.createElement('link');
	link.rel = 'stylesheet';
	link.href = `https://fonts.googleapis.com/css?family=${families.map(encodeURIComponent).join('|')}&display=swap`;
	families.forEach((family) => requestedFonts.add(family));
	link.addEventListener('error', () => {
		// A failed stylesheet must not prevent a later mount or selection from retrying.
		families.forEach((family) => requestedFonts.delete(family));
		link.remove();
	});
	document.head.appendChild(link);
}
