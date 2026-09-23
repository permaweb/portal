import DOMPurify from 'dompurify';

import { acquireGatewayAsset } from '../../helpers/gatewayAssets';

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
const preparedLogos = new WeakMap<Blob, SVGSVGElement | null>();
const pendingImages = new WeakSet<HTMLImageElement>();
const presentationProperties = new Set([
	'fill',
	'fill-rule',
	'fill-opacity',
	'stroke',
	'stroke-width',
	'stroke-linecap',
	'stroke-linejoin',
	'stroke-miterlimit',
	'stroke-dasharray',
	'stroke-dashoffset',
	'stroke-opacity',
	'opacity',
	'clip-path',
	'clip-rule',
	'mask',
	'filter',
	'transform',
	'stop-color',
	'stop-opacity',
	'display',
	'visibility',
	'font-family',
	'font-size',
	'font-weight',
	'text-anchor',
]);

function inheritedPaint(element: Element, property: 'fill' | 'stroke'): string {
	const value = element.getAttribute(property)?.trim();
	if (value && value !== 'inherit') return value;
	return element.parentElement
		? inheritedPaint(element.parentElement, property)
		: property === 'fill'
		? 'black'
		: 'none';
}

function visiblePaint(value: string) {
	return value !== 'none' && value !== 'transparent';
}

function themePaint(value: string) {
	return !visiblePaint(value) || value.startsWith('url(') ? value : 'currentColor';
}

export function prepareSvgLogo(source: string): SVGSVGElement | null {
	const parsed = new DOMParser().parseFromString(source, 'image/svg+xml');
	if (
		parsed.querySelector('parsererror') ||
		parsed.documentElement.localName !== 'svg' ||
		parsed.documentElement.namespaceURI !== SVG_NAMESPACE
	)
		return null;

	// Uploaded images become document content when inlined. Keep only SVG artwork,
	// and prevent embedded styles, scripts, or external references from affecting the page.
	const fragment = DOMPurify.sanitize(source, {
		USE_PROFILES: { svg: true, svgFilters: true },
		ADD_TAGS: ['use'],
		FORBID_TAGS: [
			'style',
			'image',
			'feImage',
			'a',
			'foreignObject',
			'animate',
			'animateMotion',
			'animateTransform',
			'set',
		],
		RETURN_DOM_FRAGMENT: true,
	});
	const svg = fragment.querySelector('svg');
	if (!svg) return null;
	for (const element of [svg, ...Array.from(svg.querySelectorAll<SVGElement>('*'))]) {
		// Preserve inline presentation without allowing arbitrary CSS on the host page.
		for (const property of Array.from(element.style)) {
			if (presentationProperties.has(property))
				element.setAttribute(property, element.style.getPropertyValue(property));
		}
		element.removeAttribute('style');
		element.removeAttribute('color');
		for (const attribute of Array.from(element.attributes)) {
			if (
				(attribute.localName === 'href' && !/^#[\w:.-]+$/.test(attribute.value)) ||
				(/url\s*\(/i.test(attribute.value) && !/^url\(\s*['"]?#[\w:.-]+['"]?\s*\)$/i.test(attribute.value))
			)
				element.removeAttributeNode(attribute);
		}
	}

	const artwork = Array.from(
		svg.querySelectorAll<SVGElement>('path, rect, circle, ellipse, polygon, polyline, line, text, tspan, use')
	)
		.filter((element) => !element.closest('mask, clipPath, pattern'))
		.map((element) => ({ element, fill: inheritedPaint(element, 'fill'), stroke: inheritedPaint(element, 'stroke') }));
	const unpainted = artwork.every(({ fill, stroke }) => !visiblePaint(fill) && !visiblePaint(stroke));
	for (const { element, fill, stroke } of artwork) {
		// Some exports set fill="none" only on the root and omit all path paints.
		// Recover those otherwise invisible shapes without filling authored outline logos.
		const recoverFill =
			unpainted &&
			svg.getAttribute('fill') === 'none' &&
			!element.hasAttribute('fill') &&
			!['line', 'polyline', 'use'].includes(element.localName);
		element.style.setProperty('fill', recoverFill ? 'currentColor' : themePaint(fill), 'important');
		element.style.setProperty('stroke', themePaint(stroke), 'important');
	}
	svg.setAttribute('aria-hidden', 'true');
	svg.setAttribute('focusable', 'false');
	return svg;
}

export async function inlineSvgLogo(image: HTMLImageElement): Promise<void> {
	if (pendingImages.has(image)) return;
	pendingImages.add(image);
	const source = image.src;
	const request = acquireGatewayAsset(source);
	try {
		const blob = await request.promise;
		if (!preparedLogos.has(blob)) {
			// Transaction URLs have no file extension. Inspect the content too, since
			// older uploads can be served with a generic MIME type.
			const raster = blob.type.startsWith('image/') && !blob.type.includes('svg');
			preparedLogos.set(blob, raster ? null : prepareSvgLogo(await blob.text()));
		}
		const svg = preparedLogos.get(blob);
		if (svg && image.isConnected && image.src === source) image.replaceWith(svg.cloneNode(true));
	} catch {
		// Keep the normal image when it is raster, unavailable, or cannot be safely inlined.
	} finally {
		request.release();
		pendingImages.delete(image);
	}
}
