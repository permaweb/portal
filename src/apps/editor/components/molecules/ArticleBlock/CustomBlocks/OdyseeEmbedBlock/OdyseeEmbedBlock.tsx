import React from 'react';
import { ReactSVG } from 'react-svg';

import { Button } from 'components/atoms/Button';
import { FormField } from 'components/atoms/FormField';
import { ICONS } from 'helpers/config';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';

function parseOdyseeUrl(input: string): string | null {
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

function buildEmbedHtml(embedUrl: string): string {
	return `<div class="odysee-embed-wrapper" style="position: relative; width: 100%; padding-bottom: 56.25%; height: 0; overflow: hidden;"><iframe src="${embedUrl}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" allowfullscreen></iframe></div>`;
}

export default function OdyseeEmbedBlock(props: { content: any; data: any; onChange: any }) {
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [inputValue, setInputValue] = React.useState<string>(props.data?.url || '');
	const [embedUrl, setEmbedUrl] = React.useState<string | null>(props.data?.embedUrl || null);
	const [error, setError] = React.useState<string | null>(null);

	React.useEffect(() => {
		if (props.data?.embedUrl && !embedUrl) {
			setEmbedUrl(props.data.embedUrl);
		}
		if (props.data?.url && !inputValue) {
			setInputValue(props.data.url);
		}
	}, [props.data]);

	const handleEmbed = () => {
		const parsedUrl = parseOdyseeUrl(inputValue);
		if (parsedUrl) {
			setEmbedUrl(parsedUrl);
			setError(null);
			const content = buildEmbedHtml(parsedUrl);
			props.onChange(content, { url: inputValue, embedUrl: parsedUrl });
		} else {
			setError(language?.invalidOdyseeUrl || 'Invalid Odysee URL or embed code');
		}
	};

	const handleClear = () => {
		setInputValue('');
		setEmbedUrl(null);
		setError(null);
		props.onChange('', { url: null, embedUrl: null });
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setInputValue(e.target.value);
		setError(null);
	};

	if (embedUrl && props.content) {
		return (
			<S.Wrapper>
				<S.PreviewWrapper>
					<S.IframeContainer>
						<iframe src={embedUrl} allowFullScreen title="Odysee video" />
					</S.IframeContainer>
				</S.PreviewWrapper>
				<S.ActionsWrapper>
					<Button type={'primary'} label={language?.remove || 'Remove'} handlePress={handleClear} />
				</S.ActionsWrapper>
			</S.Wrapper>
		);
	}

	return (
		<S.Wrapper>
			<S.InputWrapper className={'border-wrapper-alt2'}>
				<S.InputHeader>
					<ReactSVG src={ICONS.odysee} />
					<p>{language?.odyseeEmbed || 'Odysee Embed'}</p>
				</S.InputHeader>
				<S.InputDescription>
					<span>{language?.odyseeEmbedInfo || 'Paste an Odysee video URL or embed code'}</span>
				</S.InputDescription>
				<S.InputActions>
					<FormField
						label={language?.odyseeUrl || 'Odysee URL'}
						value={inputValue}
						onChange={handleInputChange}
						invalid={{ status: !!error, message: error }}
						disabled={false}
						placeholder={'https://odysee.com/@channel/video'}
						sm
					/>
					<S.InputActionsFlex>
						<Button type={'alt1'} label={language?.embed || 'Embed'} handlePress={handleEmbed} disabled={!inputValue} />
					</S.InputActionsFlex>
				</S.InputActions>
			</S.InputWrapper>
		</S.Wrapper>
	);
}
