import React from 'react';
import WebFont from 'webfontloader';

import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
import { Loader } from 'components/atoms/Loader';
import { Notification } from 'components/atoms/Notification';
import { Select } from 'components/atoms/Select';
import { FONT_OPTIONS } from 'helpers/config';
import { NotificationType, SelectOptionType } from 'helpers/types';
import { stripFontWeights } from 'helpers/utils';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';

import * as S from './styles';

export default function Fonts(props: { handleClose?: () => void }) {
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
	const [response, setResponse] = React.useState<NotificationType | null>(null);

	React.useEffect(() => {
		if (headerFont?.id) loadFont(headerFont.id);
	}, [headerFont]);

	React.useEffect(() => {
		if (bodyFont?.id) loadFont(bodyFont.id);
	}, [bodyFont]);

	const handleFontChange = async () => {
		if (arProvider.wallet && portalProvider.current?.id) {
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

				setResponse({ status: 'success', message: `${language.fontsUpdated}!` });
			} catch (e: any) {
				setResponse({ status: 'warning', message: e.message ?? 'Error updating fonts' });
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

	return (
		<>
			<S.Wrapper>
				<S.Section>
					<Select
						label={language.headers}
						activeOption={headerFont ?? headerOptions[0]}
						setActiveOption={(option) => setHeaderFont(option)}
						options={headerOptions}
						disabled={loading}
					/>
					{getPreview(headerFont.label)}
				</S.Section>
				<S.Section>
					<Select
						label={language.bodyText}
						activeOption={bodyFont ?? bodyOptions[0]}
						setActiveOption={(option) => setBodyFont(option)}
						options={bodyOptions}
						disabled={loading}
					/>
					{getPreview(bodyFont.label)}
				</S.Section>
				<S.SAction>
					{props.handleClose && (
						<Button
							type={'primary'}
							label={language.close}
							handlePress={() => props.handleClose()}
							disabled={loading}
							loading={false}
						/>
					)}
					<Button
						type={'alt1'}
						label={language.save}
						handlePress={handleFontChange}
						disabled={loading}
						loading={false}
					/>
				</S.SAction>
			</S.Wrapper>
			{loading && <Loader message={`${language.updatingFonts}...`} />}
			{response && (
				<Notification type={response.status} message={response.message} callback={() => setResponse(null)} />
			)}
		</>
	);
}
