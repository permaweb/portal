import React from 'react';
import { ReactSVG } from 'react-svg';

import { Button } from 'components/atoms/Button';
import { FormField } from 'components/atoms/FormField';
import { ICONS } from 'helpers/config';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';

// Supported embed providers
export const EMBED_PROVIDERS: Record<string, { name: string; icon?: string }> = {
	'odysee.com': {
		name: 'Odysee',
		icon: ICONS.odysee,
	},
	'twitter.com': {
		name: 'Twitter',
		icon: ICONS.link,
	},
	'x.com': {
		name: 'Twitter',
		icon: ICONS.link,
	},
};

export type OEmbedResponse = {
	type: string;
	version: string;
	title?: string;
	author_name?: string;
	author_url?: string;
	provider_name?: string;
	provider_url?: string;
	thumbnail_url?: string;
	thumbnail_width?: number;
	thumbnail_height?: number;
	html?: string;
	width?: number;
	height?: number;
};

export type EmbedData = {
	url?: string;
	embedUrl?: string;
	collapsed?: boolean;
	title?: string;
	authorName?: string;
	authorUrl?: string;
	thumbnailUrl?: string;
	provider?: string;
	providerName?: string;
	embedHtml?: string;
};

// Twitter Embed Preview component that handles Twitter widget rendering
function TwitterEmbedPreview({ html }: { html: string }) {
	const containerRef = React.useRef<HTMLDivElement>(null);

	React.useEffect(() => {
		if (!containerRef.current) return;

		// Load Twitter widget script if not already loaded
		const scriptId = 'twitter-widgets-js';
		if (!document.getElementById(scriptId)) {
			const script = document.createElement('script');
			script.id = scriptId;
			script.src = 'https://platform.twitter.com/widgets.js';
			script.async = true;
			document.body.appendChild(script);
			script.onload = () => {
				// @ts-ignore - Twitter widgets global
				if (window.twttr?.widgets) {
					window.twttr.widgets.load(containerRef.current);
				}
			};
		} else {
			// Script already loaded, just re-render widgets
			// @ts-ignore - Twitter widgets global
			if (window.twttr?.widgets) {
				window.twttr.widgets.load(containerRef.current);
			}
		}
	}, [html]);

	return <div ref={containerRef} dangerouslySetInnerHTML={{ __html: html }} />;
}

// Get provider config from URL
export function getProviderFromUrl(url: string): { domain: string; config: (typeof EMBED_PROVIDERS)[string] } | null {
	if (!url) return null;
	try {
		const urlObj = new URL(url);
		const hostname = urlObj.hostname.replace('www.', '');

		for (const [domain, config] of Object.entries(EMBED_PROVIDERS)) {
			if (hostname === domain || hostname.endsWith(`.${domain}`)) {
				return { domain, config };
			}
		}
	} catch {
		return null;
	}
	return null;
}

// Check if URL is from a supported provider
export function isSupportedEmbedUrl(url: string): boolean {
	return getProviderFromUrl(url) !== null;
}

// Parse Odysee URL to get embed URL (no network request needed)
export function parseOdyseeUrl(input: string): string | null {
	if (!input) return null;

	const trimmed = input.trim();

	// Check if it's already an embed URL
	if (trimmed.includes('odysee.com/$/embed/')) {
		const match = trimmed.match(/https?:\/\/odysee\.com\/\$\/embed\/[^"'\s]+/);
		return match ? match[0] : null;
	}

	// Check if it's an iframe embed code
	const iframeMatch = trimmed.match(/src=["']?(https?:\/\/odysee\.com\/\$\/embed\/[^"'\s]+)["']?/);
	if (iframeMatch) {
		return iframeMatch[1];
	}

	// Try to convert a regular Odysee URL to embed URL
	// Format: https://odysee.com/@channel/video-name:claim-id
	const urlMatch = trimmed.match(/https?:\/\/odysee\.com\/@[^/]+\/([^:]+):([a-f0-9]+)/i);
	if (urlMatch) {
		const [, videoName, claimId] = urlMatch;
		return `https://odysee.com/$/embed/${videoName}/${claimId}`;
	}

	// Alternative format: https://odysee.com/@channel:id/video-name:claim-id
	const altMatch = trimmed.match(/https?:\/\/odysee\.com\/@[^:]+:[^/]+\/([^:]+):([a-f0-9]+)/i);
	if (altMatch) {
		const [, videoName, claimId] = altMatch;
		return `https://odysee.com/$/embed/${videoName}/${claimId}`;
	}

	return null;
}

// Parse Twitter/X URL to get tweet ID for embedding
export function parseTwitterUrl(input: string): { tweetId: string; embedUrl: string } | null {
	if (!input) return null;

	const trimmed = input.trim();

	// Match twitter.com or x.com status URLs
	const match = trimmed.match(/https?:\/\/(?:twitter\.com|x\.com)\/[^/]+\/status\/(\d+)/i);
	if (match) {
		const tweetId = match[1];
		// Use Twitter's official embed endpoint
		const embedUrl = `https://platform.twitter.com/embed/Tweet.html?dnt=true&id=${tweetId}&theme=light`;
		return { tweetId, embedUrl };
	}

	return null;
}

// Parse URL for any supported provider
export function parseEmbedUrl(
	url: string
): { embedUrl?: string; embedHtml?: string; provider: string; providerName: string } | null {
	const providerInfo = getProviderFromUrl(url);
	if (!providerInfo) return null;

	if (providerInfo.domain === 'odysee.com') {
		const embedUrl = parseOdyseeUrl(url);
		if (embedUrl) {
			return { embedUrl, provider: providerInfo.domain, providerName: providerInfo.config.name };
		}
	}

	if (providerInfo.domain === 'twitter.com' || providerInfo.domain === 'x.com') {
		const twitterData = parseTwitterUrl(url);
		if (twitterData) {
			return { embedUrl: twitterData.embedUrl, provider: providerInfo.domain, providerName: providerInfo.config.name };
		}
	}

	return null;
}

// Fetch OEmbed data from provider's endpoint
export async function fetchOEmbed(url: string): Promise<OEmbedResponse | null> {
	const providerInfo = getProviderFromUrl(url);
	if (!providerInfo) return null;

	// Use Odysee's OEmbed endpoint
	if (providerInfo.domain === 'odysee.com') {
		try {
			const oembedUrl = `https://odysee.com/$/oembed?url=${encodeURIComponent(url)}`;
			const response = await fetch(oembedUrl);
			if (!response.ok) {
				console.error('OEmbed fetch failed:', response.status);
				return null;
			}
			const data = await response.json();
			return data as OEmbedResponse;
		} catch (error) {
			console.error('OEmbed fetch error:', error);
			return null;
		}
	}

	// Use Twitter's public OEmbed endpoint
	if (providerInfo.domain === 'twitter.com' || providerInfo.domain === 'x.com') {
		try {
			const oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}&omit_script=true`;
			const response = await fetch(oembedUrl);
			if (!response.ok) {
				console.error('Twitter OEmbed fetch failed:', response.status);
				return null;
			}
			const data = await response.json();
			return data as OEmbedResponse;
		} catch (error) {
			console.error('Twitter OEmbed fetch error:', error);
			return null;
		}
	}

	return null;
}

// Extract embed URL from oEmbed HTML response
export function extractEmbedUrlFromHtml(html: string): string | null {
	if (!html) return null;
	const match = html.match(/src=["']([^"']+)["']/);
	return match ? match[1] : null;
}

// Build HTML content for the embed
export function buildEmbedHtml(
	embedUrl: string,
	collapsed?: boolean,
	url?: string,
	title?: string,
	oembedHtml?: string
): string {
	if (collapsed && url) {
		return `<div class="embed-wrapper embed-collapsed"><a href="${url}" target="_blank" rel="noopener noreferrer">${
			title || url
		}</a></div>`;
	}

	// Use oEmbed HTML if available (preserves provider's preferred embed format)
	if (oembedHtml) {
		return `<div class="embed-wrapper">${oembedHtml}</div>`;
	}

	// Fallback to iframe
	return `<div class="embed-wrapper" style="position: relative; width: 100%; padding-bottom: 56.25%; height: 0; overflow: hidden;"><iframe src="${embedUrl}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" allowfullscreen></iframe></div>`;
}

export default function EmbedBlock(props: { content: any; data: EmbedData; onChange: any }) {
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [inputValue, setInputValue] = React.useState<string>(props.data?.url || '');
	const [embedUrl, setEmbedUrl] = React.useState<string | null>(props.data?.embedUrl || null);
	const [collapsed, setCollapsed] = React.useState<boolean>(props.data?.collapsed || false);
	const [title, setTitle] = React.useState<string | null>(props.data?.title || null);
	const [provider, setProvider] = React.useState<string | null>(props.data?.provider || null);
	const [error, setError] = React.useState<string | null>(null);
	const [oembedHtml, setOembedHtml] = React.useState<string | null>(props.data?.embedHtml || null);
	const [loading, setLoading] = React.useState<boolean>(false);

	React.useEffect(() => {
		if (props.data?.embedUrl && !embedUrl) {
			setEmbedUrl(props.data.embedUrl);
		}
		if (props.data?.url && !inputValue) {
			setInputValue(props.data.url);
		}
		if (props.data?.collapsed !== undefined) {
			setCollapsed(props.data.collapsed);
		}
		if (props.data?.title) {
			setTitle(props.data.title);
		}
		if (props.data?.provider) {
			setProvider(props.data.provider);
		}
		if (props.data?.embedHtml && !oembedHtml) {
			setOembedHtml(props.data.embedHtml);
		}
	}, [props.data]);

	const handleEmbed = async () => {
		setError(null);
		setLoading(true);

		const providerInfo = getProviderFromUrl(inputValue);
		if (!providerInfo) {
			setError(language?.unsupportedProvider || 'This URL is not from a supported provider or is invalid');
			setLoading(false);
			return;
		}

		// Try to fetch OEmbed data for supported providers
		const oembedData = await fetchOEmbed(inputValue);
		if (oembedData && oembedData.html) {
			const embedHtmlFromOembed = oembedData.html;
			const embedUrlFromHtml = extractEmbedUrlFromHtml(embedHtmlFromOembed);

			// For Odysee, we can extract an iframe URL; for Twitter, we use the HTML directly
			let finalEmbedUrl: string | null = embedUrlFromHtml;
			if (providerInfo.domain === 'odysee.com' && !finalEmbedUrl) {
				finalEmbedUrl = parseOdyseeUrl(inputValue);
			}

			setEmbedUrl(finalEmbedUrl);
			setProvider(providerInfo.domain);
			setTitle(oembedData.title || null);
			setOembedHtml(embedHtmlFromOembed);

			const content = buildEmbedHtml(finalEmbedUrl || '', false, inputValue, oembedData.title, embedHtmlFromOembed);

			props.onChange(content, {
				url: inputValue,
				embedUrl: finalEmbedUrl,
				collapsed: false,
				provider: providerInfo.domain,
				providerName: providerInfo.config.name,
				title: oembedData.title,
				authorName: oembedData.author_name,
				authorUrl: oembedData.author_url,
				thumbnailUrl: oembedData.thumbnail_url,
				embedHtml: embedHtmlFromOembed,
			});
			setLoading(false);
			return;
		}

		// Fallback to local parsing if OEmbed fails
		const parsed = parseEmbedUrl(inputValue);
		if (!parsed) {
			setError(language?.unsupportedProvider || 'This URL is not from a supported provider or is invalid');
			setLoading(false);
			return;
		}

		setEmbedUrl(parsed.embedUrl || null);
		setProvider(parsed.provider);
		setOembedHtml(parsed.embedHtml || null);

		const content = buildEmbedHtml(parsed.embedUrl || '', false, inputValue, undefined, parsed.embedHtml);

		props.onChange(content, {
			url: inputValue,
			embedUrl: parsed.embedUrl,
			collapsed: false,
			provider: parsed.provider,
			providerName: parsed.providerName,
			embedHtml: parsed.embedHtml,
		});
		setLoading(false);
	};

	const handleClear = () => {
		setInputValue('');
		setEmbedUrl(null);
		setCollapsed(false);
		setTitle(null);
		setProvider(null);
		setOembedHtml(null);
		setError(null);
		props.onChange('', { url: null, embedUrl: null, collapsed: false, title: null, provider: null });
	};

	const handleCollapse = () => {
		const newCollapsed = !collapsed;
		setCollapsed(newCollapsed);
		const content = buildEmbedHtml(
			embedUrl || '',
			newCollapsed,
			inputValue || props.data?.url,
			title || props.data?.title,
			newCollapsed ? undefined : oembedHtml || undefined
		);
		props.onChange(content, { ...props.data, collapsed: newCollapsed });
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setInputValue(e.target.value);
		setError(null);
	};

	// Get provider icon
	const getProviderIcon = () => {
		if (provider && EMBED_PROVIDERS[provider]?.icon) {
			return EMBED_PROVIDERS[provider].icon;
		}
		return ICONS.link;
	};

	// Check if this is a Twitter embed
	const isTwitterEmbed =
		provider === 'twitter.com' ||
		provider === 'x.com' ||
		embedUrl?.includes('platform.twitter.com') ||
		inputValue?.includes('twitter.com') ||
		inputValue?.includes('x.com');

	if ((embedUrl || oembedHtml) && props.content) {
		// Show collapsed link view
		if (collapsed) {
			return (
				<S.Wrapper>
					<S.CollapsedWrapper className={'border-wrapper-alt2'}>
						<S.CollapsedLink>
							<ReactSVG src={getProviderIcon()} />
							<a href={inputValue || props.data?.url} target="_blank" rel="noopener noreferrer">
								{title || props.data?.title || inputValue || props.data?.url}
							</a>
						</S.CollapsedLink>
						<S.ActionsWrapper>
							<Button type={'primary'} label={language?.showEmbed || 'Show Embed'} handlePress={handleCollapse} />
							<Button type={'alt1'} label={language?.remove || 'Remove'} handlePress={handleClear} />
						</S.ActionsWrapper>
					</S.CollapsedWrapper>
				</S.Wrapper>
			);
		}

		// Show embed view
		return (
			<S.Wrapper>
				<S.PreviewWrapper>
					{oembedHtml ? (
						isTwitterEmbed && oembedHtml.includes('twitter-tweet') ? (
							<S.TwitterEmbedContainer>
								<TwitterEmbedPreview html={oembedHtml} />
							</S.TwitterEmbedContainer>
						) : (
							<S.EmbedContainer dangerouslySetInnerHTML={{ __html: oembedHtml }} />
						)
					) : embedUrl ? (
						isTwitterEmbed ? (
							<S.TwitterIframeContainer>
								<iframe src={embedUrl} allowFullScreen title={title || 'Twitter embed'} />
							</S.TwitterIframeContainer>
						) : (
							<S.IframeContainer>
								<iframe src={embedUrl} allowFullScreen title={title || 'Embedded content'} />
							</S.IframeContainer>
						)
					) : null}
				</S.PreviewWrapper>
				<S.ActionsWrapper>
					<Button type={'primary'} label={language?.showLink || 'Show Link Only'} handlePress={handleCollapse} />
					<Button type={'alt1'} label={language?.remove || 'Remove'} handlePress={handleClear} />
				</S.ActionsWrapper>
			</S.Wrapper>
		);
	}

	// Get supported providers list for display
	const supportedProviders = Object.values(EMBED_PROVIDERS)
		.map((p) => p.name)
		.filter((name, index, arr) => arr.indexOf(name) === index)
		.join(', ');

	return (
		<S.Wrapper>
			<S.InputWrapper className={'border-wrapper-alt2'}>
				<S.InputHeader>
					<ReactSVG src={ICONS.link} />
					<p>{language?.embed || 'Embed'}</p>
				</S.InputHeader>
				<S.InputDescription>
					<span>{language?.embedInfo || `Paste a URL from: ${supportedProviders}`}</span>
				</S.InputDescription>
				<S.InputActions>
					<FormField
						label={language?.url || 'URL'}
						value={inputValue}
						onChange={handleInputChange}
						invalid={{ status: !!error, message: error }}
						disabled={loading}
						placeholder={'https://...'}
						sm
					/>
					<S.InputActionsFlex>
						<Button
							type={'alt1'}
							label={loading ? language?.loading || 'Loading...' : language?.embed || 'Embed'}
							handlePress={handleEmbed}
							disabled={!inputValue || loading}
						/>
					</S.InputActionsFlex>
				</S.InputActions>
			</S.InputWrapper>
		</S.Wrapper>
	);
}
