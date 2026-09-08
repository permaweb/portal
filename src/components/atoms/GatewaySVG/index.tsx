import React from 'react';
import { Props, ReactSVG as SVGInjector } from 'react-svg';

import { getBundledIcon } from 'helpers/config/iconAssets';
import { ICONS } from 'helpers/config/icons';
import { acquireGatewayAsset, isGatewayAsset } from 'helpers/gatewayAssets';

// Use bundled bytes for built-in icons, including saved social icon IDs. Custom
// gateway SVGs use scheduled fetch while retaining react-svg's injection behavior.
export function ReactSVG(props: Omit<Props, 'ref'>) {
	const { httpRequestWithCredentials = false } = props;
	const bundledSrc = getBundledIcon(props.src);
	const src = bundledSrc ?? props.src;
	const managed = isGatewayAsset(src);
	const [asset, setAsset] = React.useState<{ source: string; url?: string; error?: Error } | null>(null);
	const afterInjectionRef = React.useRef(props.afterInjection);
	afterInjectionRef.current = props.afterInjection;

	React.useEffect(() => {
		if (!managed) return;
		let active = true;
		let objectUrl: string | undefined;
		const request = acquireGatewayAsset(src, httpRequestWithCredentials);
		setAsset(null);
		request.promise.then(
			(blob) => {
				if (!active) return;
				// The injector validates MIME type for transaction URLs without .svg.
				// Keep the original type so raster logos still use their fallback.
				objectUrl = URL.createObjectURL(blob);
				setAsset({ source: src, url: objectUrl });
			},
			(error) => {
				if (!active) return;
				const failure = error instanceof Error ? error : new Error(String(error));
				setAsset({ source: src, error: failure });
				afterInjectionRef.current?.(failure);
			}
		);
		return () => {
			active = false;
			request.release();
			if (objectUrl) URL.revokeObjectURL(objectUrl);
		};
	}, [src, managed, httpRequestWithCredentials]);

	const beforeInjection = React.useCallback(
		(svg: SVGSVGElement) => {
			// Preserve the source for theme rules even when using a blob URL.
			svg.setAttribute('data-src', src);
			if (bundledSrc) svg.setAttribute('data-portal-icon', src === ICONS.logo ? 'logo' : 'true');
			else svg.removeAttribute('data-portal-icon');
			props.beforeInjection?.(svg);
		},
		[src, bundledSrc, props.beforeInjection]
	);

	if (!managed) return <SVGInjector {...props} src={src} beforeInjection={beforeInjection} />;
	if (asset?.source === src && asset.url) {
		return <SVGInjector {...props} src={asset.url} useRequestCache={false} beforeInjection={beforeInjection} />;
	}

	const {
		afterInjection: _afterInjection,
		beforeInjection: _beforeInjection,
		evalScripts: _evalScripts,
		fallback: Fallback,
		httpRequestWithCredentials: _credentials,
		loading: Loading,
		renumerateIRIElements: _renumerate,
		src: _src,
		useRequestCache: _cache,
		wrapper: Wrapper = 'div',
		...wrapperProps
	} = props;
	return (
		<Wrapper {...wrapperProps}>
			{asset?.source === src && asset.error ? Fallback && <Fallback /> : Loading && <Loading />}
		</Wrapper>
	);
}
