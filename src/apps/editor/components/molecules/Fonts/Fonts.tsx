import React from 'react';
import WebFont from 'webfontloader';

import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
import { Loader } from 'components/atoms/Loader';
import { Select } from 'components/atoms/Select';
import { FONT_OPTIONS } from 'helpers/config';
import { SelectOptionType } from 'helpers/types';
import { stripFontWeights } from 'helpers/utils';
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

	const headerOptions = getFontOptions('headers');
	const bodyOptions = getFontOptions('body');

	const [headerFont, setHeaderFont] = React.useState<SelectOptionType | null>(
		getDefaultOption('headers', headerOptions)
	);
	const [bodyFont, setBodyFont] = React.useState<SelectOptionType | null>(getDefaultOption('body', bodyOptions));

	const [loading, setLoading] = React.useState<boolean>(false);
	const { addNotification } = useNotifications();

	React.useEffect(() => {
		if (headerFont?.id) loadFont(headerFont.id);
	}, [headerFont]);

	React.useEffect(() => {
		if (bodyFont?.id) loadFont(bodyFont.id);
	}, [bodyFont]);

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

				portalProvider.refreshCurrentPortal();

				console.log(`Font update: ${fontUpdateId}`);

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
		return opts[0];
	}

	function loadFont(family: string) {
		WebFont.load({ google: { families: [family] } });
	}

	function getFontOptions(key: 'headers' | 'body') {
		return FONT_OPTIONS[key].map((option: string) => ({ id: option, label: stripFontWeights(option) }));
	}

	function getPreview(family: string) {
		return (
			<S.Preview fontFamily={family}>
				<p>Lorem Ipsum</p>
			</S.Preview>
		);
	}

	function hasChanges() {
		const currentHeaderFont = portalProvider.current?.fonts?.headers || headerOptions[0].id;
		const currentBodyFont = portalProvider.current?.fonts?.body || bodyOptions[0].id;

		return headerFont?.id !== currentHeaderFont || bodyFont?.id !== currentBodyFont;
	}

	return (
		<>
			<S.Wrapper>
				<S.Section>
					<Select
						label={language?.headers}
						activeOption={headerFont ?? headerOptions[0]}
						setActiveOption={(option) => setHeaderFont(option)}
						options={headerOptions}
						disabled={unauthorized || loading}
					/>
					{getPreview(headerFont.label)}
				</S.Section>
				<S.Section>
					<Select
						label={language?.bodyText}
						activeOption={bodyFont ?? bodyOptions[0]}
						setActiveOption={(option) => setBodyFont(option)}
						options={bodyOptions}
						disabled={unauthorized || loading}
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
