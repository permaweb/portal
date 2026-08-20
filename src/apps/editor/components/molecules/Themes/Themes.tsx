import React from 'react';
import { HexColorInput, HexColorPicker } from 'react-colorful';
import { ReactSVG } from 'react-svg';

import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
import { Loader } from 'components/atoms/Loader';
import { Modal } from 'components/atoms/Modal';
import { ICONS } from 'helpers/config';
import {
	DEFAULT_PORTAL_THEME,
	getPortalThemeContrast,
	hexToRgbChannels,
	normalizePortalTheme,
	PortalThemeColorKey,
	PortalThemeScheme,
	rgbChannelsToHex,
	SimplePortalTheme,
} from 'helpers/portalTheme';
import { PortalPatchMapEnum } from 'helpers/types';
import { debugLog } from 'helpers/utils';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { useNotifications } from 'providers/NotificationProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';

import * as S from './styles';

const COLOR_FIELDS: Array<{ key: PortalThemeColorKey; label: string; description: string }> = [
	{ key: 'background', label: 'Background', description: 'The page behind your content.' },
	{ key: 'surface', label: 'Surface', description: 'Navigation, cards, and content panels.' },
	{ key: 'text', label: 'Text', description: 'Primary text and headings.' },
	{ key: 'accent', label: 'Accent', description: 'Buttons, highlights, and active states.' },
	{ key: 'link', label: 'Links', description: 'Links and inline navigation text.' },
	{ key: 'border', label: 'Border', description: 'Dividers and component outlines.' },
];

function ColorField(props: {
	label: string;
	description: string;
	value: string;
	disabled: boolean;
	onChange: (value: string) => void;
}) {
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];
	const [open, setOpen] = React.useState(false);
	const [draft, setDraft] = React.useState(() => rgbChannelsToHex(props.value));

	React.useEffect(() => setDraft(rgbChannelsToHex(props.value)), [props.value]);
	const closePicker = () => {
		setDraft(rgbChannelsToHex(props.value));
		setOpen(false);
	};

	return (
		<>
			<S.ColorRow>
				<S.ColorInfo>
					<S.ColorLabel>{props.label}</S.ColorLabel>
					<S.ColorDescription>{props.description}</S.ColorDescription>
				</S.ColorInfo>
				<S.ColorButton type="button" onClick={() => setOpen(true)} disabled={props.disabled}>
					<S.ColorSwatch $color={rgbChannelsToHex(props.value)} />
					<span>{rgbChannelsToHex(props.value).toUpperCase()}</span>
				</S.ColorButton>
			</S.ColorRow>
			{open && (
				<Modal header={`${props.label} Color`} handleClose={closePicker}>
					<S.Picker>
						<S.PickerPreview $color={draft} />
						<HexColorPicker color={draft} onChange={setDraft} />
						<S.PickerFooter>
							<HexColorInput prefixed color={draft} onChange={setDraft} />
							<S.PickerActions>
								<Button type={'primary'} label={language?.cancel} handlePress={closePicker} />
								<Button
									type={'alt1'}
									label={language?.save}
									handlePress={() => {
										props.onChange(hexToRgbChannels(draft));
										setOpen(false);
									}}
								/>
							</S.PickerActions>
						</S.PickerFooter>
					</S.Picker>
				</Modal>
			)}
		</>
	);
}

function ThemePreview(props: { palette: SimplePortalTheme['colors'][PortalThemeScheme]; radius: number }) {
	const { background, surface, text, accent, link, border } = props.palette;
	const accentContrast = getPortalThemeContrast(accent);
	return (
		<S.Preview $background={background} $text={text}>
			<S.PreviewNav $surface={surface} $border={border} $radius={props.radius}>
				<span>Portal</span>
				<S.PreviewLink $color={link}>Documentation</S.PreviewLink>
			</S.PreviewNav>
			<S.PreviewCard $surface={surface} $border={border} $radius={props.radius}>
				<S.PreviewKicker $accent={accent}>GETTING STARTED</S.PreviewKicker>
				<h3>Build something permanent</h3>
				<p>Muted text, borders, hover states, and controls are derived from this compact palette.</p>
				<S.PreviewButton $accent={accent} $color={accentContrast} $radius={props.radius}>
					Read the guide
				</S.PreviewButton>
			</S.PreviewCard>
		</S.Preview>
	);
}

function Palette(props: {
	scheme: PortalThemeScheme;
	theme: SimplePortalTheme;
	disabled: boolean;
	onChange: (key: PortalThemeColorKey, value: string) => void;
}) {
	return (
		<S.Palette>
			<S.PaletteHeader>
				<S.PaletteTitle>
					<ReactSVG src={props.scheme === 'light' ? ICONS.light : ICONS.dark} />
					<h3>{props.scheme === 'light' ? 'Light Palette' : 'Dark Palette'}</h3>
				</S.PaletteTitle>
			</S.PaletteHeader>
			<S.PaletteBody>
				{COLOR_FIELDS.map((field) => (
					<ColorField
						key={field.key}
						label={field.label}
						description={field.description}
						value={props.theme.colors[props.scheme][field.key]}
						disabled={props.disabled}
						onChange={(value) => props.onChange(field.key, value)}
					/>
				))}
			</S.PaletteBody>
			<ThemePreview palette={props.theme.colors[props.scheme]} radius={props.theme.borderRadius} />
		</S.Palette>
	);
}

export default function Themes(props: { compact?: boolean }) {
	const arProvider = useArweaveProvider();
	const permawebProvider = usePermawebProvider();
	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];
	const { addNotification } = useNotifications();

	const [savedTheme, setSavedTheme] = React.useState<SimplePortalTheme>(DEFAULT_PORTAL_THEME);
	const [theme, setTheme] = React.useState<SimplePortalTheme>(DEFAULT_PORTAL_THEME);
	const [loading, setLoading] = React.useState(false);
	const unauthorized = !portalProvider.permissions?.updatePortalMeta;

	React.useEffect(() => {
		const normalized = normalizePortalTheme(portalProvider.current?.themes?.[0]);
		setSavedTheme(normalized);
		setTheme(normalized);
	}, [portalProvider.current?.id, portalProvider.current?.themes]);

	const hasChanges = JSON.stringify(theme) !== JSON.stringify(savedTheme);

	function updateColor(scheme: PortalThemeScheme, key: PortalThemeColorKey, value: string) {
		setTheme((current) => ({
			...current,
			colors: {
				...current.colors,
				[scheme]: { ...current.colors[scheme], [key]: value },
			},
		}));
	}

	async function saveTheme() {
		if (unauthorized || !arProvider.wallet || !portalProvider.current?.id || !hasChanges) return;
		setLoading(true);
		try {
			const themeUpdateId = await permawebProvider.libs.updateZone(
				{ Themes: permawebProvider.libs.mapToProcessCase([theme]) },
				portalProvider.current.id,
				arProvider.wallet
			);
			debugLog('info', 'Themes', `Theme update: ${themeUpdateId}`);
			setSavedTheme(theme);
			portalProvider.refreshCurrentPortal(PortalPatchMapEnum.Presentation);
			addNotification(`${language?.themesUpdated}!`, 'success');
		} catch (error: any) {
			addNotification(error.message ?? 'Error updating theme', 'warning');
		} finally {
			setLoading(false);
		}
	}

	if (!portalProvider.current?.id) return null;

	return (
		<S.Wrapper>
			<S.Header $compact={props.compact}>
				<S.HeaderCopy>
					<h2>Portal Palette</h2>
					<p>
						Choose the core colors for each appearance. Buttons, cards, navigation, muted text, and hover states are
						generated automatically from them.
					</p>
				</S.HeaderCopy>
				<S.HeaderActions $compact={props.compact}>
					<Button
						type={'primary'}
						label={'Reset'}
						handlePress={() => setTheme(savedTheme)}
						disabled={!hasChanges || loading}
					/>
					<Button
						type={'alt1'}
						label={language?.saveChanges || 'Save Changes'}
						handlePress={saveTheme}
						disabled={!hasChanges || loading || unauthorized}
						loading={loading}
						icon={ICONS.save}
						iconLeftAlign
					/>
				</S.HeaderActions>
			</S.Header>

			<S.Palettes $compact={props.compact}>
				<Palette
					scheme={'light'}
					theme={theme}
					disabled={unauthorized || loading}
					onChange={(key, value) => updateColor('light', key, value)}
				/>
				<Palette
					scheme={'dark'}
					theme={theme}
					disabled={unauthorized || loading}
					onChange={(key, value) => updateColor('dark', key, value)}
				/>
			</S.Palettes>

			<S.Radius>
				<S.RadiusCopy>
					<h3>Corner Radius</h3>
					<p>Applied consistently to cards, inputs, code blocks, and panels.</p>
				</S.RadiusCopy>
				<S.RadiusControl>
					<input
						type="range"
						min="0"
						max="24"
						step="1"
						value={theme.borderRadius}
						onChange={(event) => setTheme((current) => ({ ...current, borderRadius: Number(event.target.value) }))}
						disabled={unauthorized || loading}
					/>
					<span>{theme.borderRadius}px</span>
				</S.RadiusControl>
			</S.Radius>
			{loading && <Loader message={`${language?.updatingTheme}...`} />}
		</S.Wrapper>
	);
}
