import React from 'react';
import WebFont from 'webfontloader';

import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
import { Loader } from 'components/atoms/Loader';
import { Select } from 'components/atoms/Select';
import { DEFAULT_FONTS, FONT_OPTIONS } from 'helpers/config';
import { PortalPatchMapEnum, SelectOptionType } from 'helpers/types';
import { debugLog, stripFontWeights } from 'helpers/utils';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { useNotifications } from 'providers/NotificationProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';

import * as S from './styles';

export default function Fonts() {
	const arProvider = useArweaveProvider();
	const permawebProvider = usePermawebProvider();
	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const fontOptions = getFontOptions();

	const [headerFont, setHeaderFont] = React.useState<SelectOptionType | null>(getDefaultOption('headers', fontOptions));
	const [bodyFont, setBodyFont] = React.useState<SelectOptionType | null>(getDefaultOption('body', fontOptions));

	const [loading, setLoading] = React.useState<boolean>(false);
	const { addNotification } = useNotifications();

	React.useEffect(() => {
		WebFont.load({ google: { families: FONT_OPTIONS } });
	}, []);

	const unauthorized = !portalProvider.permissions?.updatePortalMeta;

	const handleFontChange = async () => {
		if (!unauthorized && arProvider.wallet && portalProvider.current?.id) {
			setLoading(true);
			try {
				const updatedFonts = {
					headers: headerFont.id,
					body: bodyFont.id,
				};

				const fontUpdateId = await permawebProvider.libs.updateZone(
					{ Fonts: permawebProvider.libs.mapToProcessCase(updatedFonts) },
					portalProvider.current.id,
					arProvider.wallet
				);

				portalProvider.refreshCurrentPortal(PortalPatchMapEnum.Presentation);

				debugLog('info', 'Fonts', `Font update: ${fontUpdateId}`);

				addNotification(`${language?.fontsUpdated}!`, 'success');
			} catch (e: any) {
				addNotification(e.message ?? 'Error updating fonts', 'warning');
			}

			setLoading(false);
		}
	};

	function getDefaultOption(type: 'headers' | 'body', opts: SelectOptionType[]) {
		if (portalProvider.current?.fonts?.[type]) {
			const family = portalProvider.current?.fonts?.[type];
			return { id: family, label: stripFontWeights(family) };
		}
		const defaultFont = DEFAULT_FONTS[type];
		return opts.find((option) => option.id === defaultFont) || opts[0];
	}

	function getFontOptions() {
		return FONT_OPTIONS.map((option: string) => ({ id: option, label: stripFontWeights(option) }));
	}

	function renderFontOption(option: SelectOptionType) {
		return <span style={{ fontFamily: option.label }}>{option.label}</span>;
	}

	function getPreview(family: string) {
		return (
			<S.Preview fontFamily={family}>
				<p>Lorem Ipsum</p>
			</S.Preview>
		);
	}

	function hasChanges() {
		const currentHeaderFont = portalProvider.current?.fonts?.headers || DEFAULT_FONTS.headers;
		const currentBodyFont = portalProvider.current?.fonts?.body || DEFAULT_FONTS.body;

		return headerFont?.id !== currentHeaderFont || bodyFont?.id !== currentBodyFont;
	}

	return (
		<>
			<S.Wrapper>
				<S.Section>
					<Select
						label={language?.headers}
						activeOption={headerFont ?? fontOptions[0]}
						setActiveOption={(option) => setHeaderFont(option)}
						options={fontOptions}
						disabled={unauthorized || loading}
						renderOption={renderFontOption}
					/>
					{getPreview(headerFont.label)}
				</S.Section>
				<S.Section>
					<Select
						label={language?.bodyText}
						activeOption={bodyFont ?? fontOptions[0]}
						setActiveOption={(option) => setBodyFont(option)}
						options={fontOptions}
						disabled={unauthorized || loading}
						renderOption={renderFontOption}
					/>
					{getPreview(bodyFont.label)}
				</S.Section>
				<S.SAction>
					<Button
						type={'alt1'}
						label={language?.save}
						handlePress={handleFontChange}
						disabled={unauthorized || loading || !hasChanges()}
						loading={false}
					/>
				</S.SAction>
			</S.Wrapper>
			{loading && <Loader message={`${language?.updatingFonts}...`} />}
		</>
	);
}
