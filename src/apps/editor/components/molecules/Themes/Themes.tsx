import React from 'react';
import { HexColorInput, HexColorPicker } from 'react-colorful';
import { ReactSVG } from 'react-svg';

import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
import { FormField } from 'components/atoms/FormField';
import { IconButton } from 'components/atoms/IconButton';
import { Loader } from 'components/atoms/Loader';
import { Modal } from 'components/atoms/Modal';
import { Toggle } from 'components/atoms/Toggle';
import { ICONS } from 'helpers/config';
import { PortalPatchMapEnum, PortalThemeType } from 'helpers/types';
import { debugLog } from 'helpers/utils';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { useNotifications } from 'providers/NotificationProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';

import * as S from './styles';

function Color(props: {
	label: string;
	value: string;
	basics: any;
	scheme: string;
	onChange: (newColor: string) => void;
	disabled?: boolean;
	loading: boolean;
	height?: number;
	width?: number;
	maxWidth?: boolean;
}) {
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [value, setValue] = React.useState<string | null>(null);
	const [showSelector, setShowSelector] = React.useState<boolean>(false);
	const [textValue, setTextValue] = React.useState<string>('');
	const [showTextInput, setShowTextInput] = React.useState<boolean>(false);

	const [shadowConfig, setShadowConfig] = React.useState({
		x: '0',
		y: '0',
		blur: '0',
		spread: '0',
		color: '#000000',
		opacity: '1',
	});
	const [showShadowColorPicker, setShowShadowColorPicker] = React.useState<boolean>(false);
	const [shadowEnabled, setShadowEnabled] = React.useState<boolean>(true);

	function getColor(basics: any, value: string) {
		if (!basics || !value) return null;

		switch (value) {
			case 'primary':
				return basics.primary?.[props.scheme];
			case 'secondary':
				return basics.secondary?.[props.scheme];
			case 'background':
				return basics.background?.[props.scheme];
			case 'text':
				return basics.text?.[props.scheme];
			case 'border':
				return basics.border?.[props.scheme];
			default:
				return value;
		}
	}

	const isColorValue = (val: string) => {
		if (!val) return false;
		const isBasicKey = ['primary', 'secondary', 'background', 'text', 'border'].includes(val);
		const isRgb = /^\d+,\s*\d+,\s*\d+$/.test(val);
		return isBasicKey || isRgb;
	};

	const isShadowValue = (val: string) => {
		return val && typeof val === 'string' && (val.includes('px') || val === 'none' || val === 'unset');
	};

	const parseShadow = (shadowStr: string) => {
		if (!shadowStr || shadowStr === 'none' || shadowStr === 'unset') {
			return { x: '0', y: '0', blur: '0', spread: '0', color: '#000000', opacity: '0' };
		}

		const matchWithColor = shadowStr.match(
			/([-\d.]+)px\s+([-\d.]+)px\s+([-\d.]+)px(?:\s+([-\d.]+)px)?\s+rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/
		);
		if (matchWithColor) {
			const [, x, y, blur, spread, r, g, b, a] = matchWithColor;
			const color = rgbToHex(parseInt(r), parseInt(g), parseInt(b));
			return {
				x: x || '0',
				y: y || '0',
				blur: blur || '0',
				spread: spread || '0',
				color,
				opacity: a || '1',
			};
		}

		const matchSimple = shadowStr.match(/([-\d.]+)px\s+([-\d.]+)px\s+([-\d.]+)px(?:\s+([-\d.]+)px)?/);
		if (matchSimple) {
			const [, x, y, blur, spread] = matchSimple;
			return {
				x: x || '0',
				y: y || '0',
				blur: blur || '0',
				spread: spread || '0',
				color: '#000000',
				opacity: '0.5',
			};
		}

		return { x: '0', y: '0', blur: '0', spread: '0', color: '#000000', opacity: '1' };
	};

	const shadowConfigToString = (config: typeof shadowConfig) => {
		if (parseFloat(config.opacity) === 0) return 'none';
		const rgb = hexToRgb(config.color);
		const rgbArray = rgb.split(',').map(Number);
		const spreadPart = parseFloat(config.spread) !== 0 ? ` ${config.spread}px` : '';
		return `${config.x}px ${config.y}px ${config.blur}px${spreadPart} rgba(${rgbArray[0]}, ${rgbArray[1]}, ${rgbArray[2]}, ${config.opacity})`;
	};

	React.useEffect(() => {
		if (props.value) {
			if (isColorValue(props.value) && props.basics) {
				const absoluteValue = getColor(props.basics, props.value);
				if (absoluteValue) {
					setValue(parseRgbStringToHex(absoluteValue));
				}
			} else if (isShadowValue(props.value)) {
				setTextValue(props.value);
				setShadowConfig(parseShadow(props.value));
				setShadowEnabled(props.value !== 'none' && props.value !== 'unset');
			} else {
				setTextValue(props.value);
			}
		}
	}, [props.value, props.basics, props.scheme]);

	function parseRgbStringToHex(rgbString: string) {
		if (!rgbString) return '#000000';
		const parts = rgbString.split(',').map(Number);
		if (parts.length !== 3 || parts.some(isNaN)) return '#000000';
		const [r, g, b] = parts;
		return rgbToHex(r, g, b);
	}

	function rgbToHex(r: number, g: number, b: number) {
		const toHex = (value: number) => {
			if (isNaN(value) || value === undefined) return '00';
			return value.toString(16).padStart(2, '0');
		};
		return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
	}

	function hexToRgb(hex: string) {
		hex = hex.replace(/^#/, '');

		const r = parseInt(hex.substring(0, 2), 16);
		const g = parseInt(hex.substring(2, 4), 16);
		const b = parseInt(hex.substring(4, 6), 16);

		return `${r},${g},${b}`;
	}

	function getColorContrast(hexString: string) {
		const num = parseInt(hexString.replace('#', ''), 16);
		const r = (num >> 16) & 255;
		const g = (num >> 18) & 255;
		const b = num & 255;
		const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
		return luminance > 0.5 ? 'black' : 'white';
	}

	const isColor = isColorValue(props.value);
	const isShadow = isShadowValue(props.value);
	const isBasicColorKey = ['primary', 'secondary', 'background', 'text', 'border'].includes(props.value);
	const displayText = isColor
		? isBasicColorKey
			? props.value.toUpperCase()
			: value
			? value.toUpperCase()
			: '-'
		: isShadow
		? textValue === 'none' || textValue === 'unset'
			? textValue.toUpperCase()
			: 'SHADOW'
		: textValue || '-';

	return (
		<>
			<S.ColorWrapper>
				<S.ColorBody
					onClick={() => {
						if (isColor) setShowSelector(true);
						else setShowTextInput(true);
					}}
					disabled={props.disabled}
					background={isColor ? value : '#808080'}
					height={props.height}
					width={props.width}
					maxWidth={props.maxWidth}
					text={isColor && value ? getColorContrast(value) : 'white'}
				>
					<span>{displayText}</span>
				</S.ColorBody>
			</S.ColorWrapper>
			{showSelector && (
				<Modal header={language?.colorPicker} handleClose={() => setShowSelector(false)}>
					<S.SelectorWrapper>
						<S.SelectorHeader>
							<p>{props.label}</p>
						</S.SelectorHeader>
						<S.SelectorFlexWrapper>
							<S.SelectorPreview background={value} />
							<HexColorPicker
								color={value}
								onChange={(newValue: string) => {
									setValue(newValue);
									props.onChange(newValue);
								}}
							/>
						</S.SelectorFlexWrapper>
						<S.SelectorActions>
							<S.SelectorFlexActions>
								{isBasicColorKey ? (
									<input
										type="text"
										value={props.value}
										disabled
										style={{
											textAlign: 'center',
											textTransform: 'uppercase',
											fontWeight: 'bold',
											padding: '0 10px',
										}}
									/>
								) : (
									<HexColorInput
										color={value}
										onChange={(newValue: string) => {
											setValue(newValue);
											props.onChange(newValue);
										}}
									/>
								)}
								<S.SelectorColorSwatches>
									{props.basics &&
										Object.entries(props.basics).map(([key, colorSchemes]: any) => {
											if (!colorSchemes || typeof colorSchemes !== 'object') return null;
											const rgbColor = colorSchemes[props.scheme];
											if (!rgbColor) return null;
											const hexColor = parseRgbStringToHex(rgbColor);
											const isSelected = isBasicColorKey && props.value === key;
											return (
												<S.SelectorColorSwatch
													key={key}
													background={hexColor}
													$isSelected={isSelected}
													onClick={() => {
														props.onChange(key);
													}}
													disabled={props.disabled}
													title={key.charAt(0).toUpperCase() + key.slice(1)}
												/>
											);
										})}
								</S.SelectorColorSwatches>
							</S.SelectorFlexActions>
							<S.SelectorFlexActions>
								<Button
									type={'primary'}
									label={language?.close}
									handlePress={() => {
										const absoluteValue = getColor(props.basics, props.value);
										setValue(parseRgbStringToHex(absoluteValue));
										setShowSelector(false);
									}}
									disabled={props.loading}
								/>
								<Button
									type={'alt1'}
									label={language?.save}
									handlePress={() => {
										if (value) props.onChange(hexToRgb(value));
										setShowSelector(false);
									}}
									disabled={!value || hexToRgb(value) === props.value || props.loading}
									loading={props.loading}
								/>
							</S.SelectorFlexActions>
						</S.SelectorActions>
					</S.SelectorWrapper>
				</Modal>
			)}
			{showTextInput && isShadow && (
				<Modal
					header={props.label.charAt(0).toUpperCase() + props.label.slice(1)}
					handleClose={() => setShowTextInput(false)}
				>
					<S.SelectorWrapper>
						<S.ShadowToggleRow>
							<label>Shadow</label>
							<Toggle
								options={['OFF', 'ON']}
								activeOption={shadowEnabled ? 'ON' : 'OFF'}
								handleToggle={(option) => setShadowEnabled(option === 'ON')}
								disabled={props.disabled}
							/>
						</S.ShadowToggleRow>
						<S.ShadowEditorGrid>
							<S.ShadowEditorRow $disabled={!shadowEnabled}>
								<label>X Offset</label>
								<S.RangeWrapper>
									<input
										type="range"
										value={shadowConfig.x}
										onChange={(e) => setShadowConfig({ ...shadowConfig, x: e.target.value })}
										disabled={props.disabled || !shadowEnabled}
										min="-50"
										max="50"
										step="1"
									/>
									<span>{shadowConfig.x}px</span>
								</S.RangeWrapper>
							</S.ShadowEditorRow>
							<S.ShadowEditorRow $disabled={!shadowEnabled}>
								<label>Y Offset</label>
								<S.RangeWrapper>
									<input
										type="range"
										value={shadowConfig.y}
										onChange={(e) => setShadowConfig({ ...shadowConfig, y: e.target.value })}
										disabled={props.disabled || !shadowEnabled}
										min="-50"
										max="50"
										step="1"
									/>
									<span>{shadowConfig.y}px</span>
								</S.RangeWrapper>
							</S.ShadowEditorRow>
							<S.ShadowEditorRow $disabled={!shadowEnabled}>
								<label>Blur</label>
								<S.RangeWrapper>
									<input
										type="range"
										value={shadowConfig.blur}
										onChange={(e) => setShadowConfig({ ...shadowConfig, blur: e.target.value })}
										disabled={props.disabled || !shadowEnabled}
										min="0"
										max="100"
										step="1"
									/>
									<span>{shadowConfig.blur}px</span>
								</S.RangeWrapper>
							</S.ShadowEditorRow>
							<S.ShadowEditorRow $disabled={!shadowEnabled}>
								<label>Spread</label>
								<S.RangeWrapper>
									<input
										type="range"
										value={shadowConfig.spread}
										onChange={(e) => setShadowConfig({ ...shadowConfig, spread: e.target.value })}
										disabled={props.disabled || !shadowEnabled}
										min="-50"
										max="50"
										step="1"
									/>
									<span>{shadowConfig.spread}px</span>
								</S.RangeWrapper>
							</S.ShadowEditorRow>
							<S.ShadowEditorRow $disabled={!shadowEnabled}>
								<label>Color</label>
								<S.ShadowColorWrapper>
									<S.ShadowColorPreview
										background={shadowConfig.color}
										onClick={() => !props.disabled && shadowEnabled && setShowShadowColorPicker(true)}
										disabled={props.disabled || !shadowEnabled}
									>
										<span>{shadowConfig.color.toUpperCase()}</span>
									</S.ShadowColorPreview>
								</S.ShadowColorWrapper>
							</S.ShadowEditorRow>
							<S.ShadowEditorRow $disabled={!shadowEnabled}>
								<label>Opacity</label>
								<S.RangeWrapper>
									<input
										type="range"
										value={shadowConfig.opacity}
										onChange={(e) => setShadowConfig({ ...shadowConfig, opacity: e.target.value })}
										disabled={props.disabled || !shadowEnabled}
										min="0"
										max="1"
										step="0.01"
									/>
									<span>{shadowConfig.opacity}</span>
								</S.RangeWrapper>
							</S.ShadowEditorRow>
						</S.ShadowEditorGrid>
						<S.ShadowPreview
							shadow={shadowEnabled ? shadowConfigToString(shadowConfig) : 'none'}
							backgroundColor={props.basics?.background?.[props.scheme] || '128,128,128'}
						/>
						<S.SelectorActions>
							<div></div>
							<S.SelectorFlexActions>
								<Button
									type={'primary'}
									label={language?.close}
									handlePress={() => {
										setShadowConfig(parseShadow(props.value));
										setShadowEnabled(props.value !== 'none' && props.value !== 'unset');
										setShowTextInput(false);
									}}
									disabled={props.loading}
								/>
								<Button
									type={'alt1'}
									label={language?.save}
									handlePress={() => {
										const shadowStr = shadowEnabled ? shadowConfigToString(shadowConfig) : 'none';
										props.onChange(shadowStr);
										setTextValue(shadowStr);
										setShowTextInput(false);
									}}
									disabled={props.disabled}
									loading={props.loading}
								/>
							</S.SelectorFlexActions>
						</S.SelectorActions>
					</S.SelectorWrapper>
				</Modal>
			)}
			{showShadowColorPicker && (
				<Modal header={language?.colorPicker} handleClose={() => setShowShadowColorPicker(false)}>
					<S.SelectorWrapper>
						<S.SelectorHeader>
							<p>Shadow Color</p>
						</S.SelectorHeader>
						<S.SelectorFlexWrapper>
							<S.SelectorPreview background={shadowConfig.color} />
							<HexColorPicker
								color={shadowConfig.color}
								onChange={(newColor: string) => setShadowConfig({ ...shadowConfig, color: newColor })}
							/>
						</S.SelectorFlexWrapper>
						<S.SelectorActions>
							<div>
								<HexColorInput
									color={shadowConfig.color}
									onChange={(newColor: string) => setShadowConfig({ ...shadowConfig, color: newColor })}
								/>
							</div>
							<S.SelectorFlexActions>
								<Button
									type={'primary'}
									label={language?.close}
									handlePress={() => setShowShadowColorPicker(false)}
									disabled={props.loading}
								/>
							</S.SelectorFlexActions>
						</S.SelectorActions>
					</S.SelectorWrapper>
				</Modal>
			)}
			{showTextInput && !isShadow && (
				<Modal header={`Edit ${props.label}`} handleClose={() => setShowTextInput(false)}>
					<S.SelectorWrapper>
						<S.SelectorHeader>
							<p>{props.label}</p>
						</S.SelectorHeader>
						<FormField
							value={textValue}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTextValue(e.target.value)}
							invalid={{ status: false, message: null }}
							disabled={props.disabled}
							hideErrorMessage
						/>
						<S.SelectorActions>
							<div></div>
							<S.SelectorFlexActions>
								<Button
									type={'primary'}
									label={language?.close}
									handlePress={() => {
										setTextValue(props.value);
										setShowTextInput(false);
									}}
									disabled={props.loading}
								/>
								<Button
									type={'alt1'}
									label={language?.save}
									handlePress={() => {
										props.onChange(textValue);
										setShowTextInput(false);
									}}
									disabled={!textValue || textValue === props.value || props.disabled}
									loading={props.loading}
								/>
							</S.SelectorFlexActions>
						</S.SelectorActions>
					</S.SelectorWrapper>
				</Modal>
			)}
		</>
	);
}

// Helper function to resolve color keys to RGB values for display
function resolveColorForDisplay(colorValue: string | undefined, scheme: 'light' | 'dark', basicsColors: any): string {
	if (!colorValue) return scheme === 'light' ? '0,0,0' : '255,255,255';

	// Check if it's a basic color key
	const basicColorKeys = ['primary', 'secondary', 'background', 'text', 'border'];
	if (basicColorKeys.includes(colorValue)) {
		return basicsColors?.[colorValue]?.[scheme] || (scheme === 'light' ? '0,0,0' : '255,255,255');
	}

	// Otherwise, assume it's already an RGB string
	return colorValue;
}

const ThemeSection = React.memo(function ThemeSection(props: any) {
	const portalProvider = usePortalProvider();
	const { theme, setTheme, section, loading, originalTheme } = props;
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];
	const unauthorized = !portalProvider.permissions?.updatePortalMeta;

	// Local state for name editing to prevent re-renders
	const [localName, setLocalName] = React.useState(theme.name || '');
	const [open, setOpen] = React.useState<boolean>(false);
	const [showLinksModal, setShowLinksModal] = React.useState<boolean>(false);
	const [linksScheme, setLinksScheme] = React.useState<'light' | 'dark'>('light');

	// Update local name when theme changes from outside
	React.useEffect(() => {
		if (theme.name !== localName) {
			setLocalName(theme.name || '');
		}
	}, [theme.name]);

	const order = ['text', 'hover', 'background', 'primary', 'secondary'];
	const sortedSection = Object.fromEntries([
		...order.map((k) => [k, theme[section]?.colors?.[k]]).filter(([_, v]) => v !== undefined),
		...Object.entries(theme[section]?.colors || {}).filter(([k]) => !order.includes(k)),
	]);

	const preferences = theme[section]?.preferences || {};
	const validPreferences = Object.entries(preferences).filter(
		([_, value]: any) => typeof value === 'object' && value.light !== undefined
	);

	function handleThemeChange(
		section: string,
		type: string,
		scheme: string | null,
		key: string,
		newValue: string | boolean | number
	) {
		const updatedTheme = {
			...props.theme,
			[section]: {
				...props.theme[section],
				[type]: {
					...props.theme[section][type],
					[key.toLowerCase()]: {
						...props.theme[section][type][key.toLowerCase()],
						...((scheme ? { [scheme]: newValue } : newValue) as any),
					},
				},
			},
		};

		setTheme(updatedTheme);
	}

	function handleReset(section: string, type: string, key: string) {
		const savedValue = originalTheme?.[section]?.[type]?.[key.toLowerCase()];
		if (!savedValue) return;

		const updatedTheme = {
			...props.theme,
			[section]: {
				...props.theme[section],
				[type]: {
					...props.theme[section][type],
					[key.toLowerCase()]: savedValue,
				},
			},
		};

		setTheme(updatedTheme);
	}

	return (
		<S.ThemeSectionColumnWrapper key={theme.name}>
			<S.ThemeSectionColumnAction open={open} disabled={false} onClick={() => setOpen((prev) => !prev)}>
				<p>{section.toUpperCase()}</p>
				<ReactSVG src={ICONS.arrow} />
			</S.ThemeSectionColumnAction>
			{open && (
				<S.ThemeSectionColumn>
					<S.ThemeSectionHeader>
						<span>{'Element'.toUpperCase()}</span>
						<S.ThemeSectionHeaderVariants>
							<span>
								<ReactSVG src={ICONS.light} />
								{'Light'.toUpperCase()}
							</span>
							<span>
								<ReactSVG src={ICONS.dark} /> {'Dark'.toUpperCase()}
							</span>
						</S.ThemeSectionHeaderVariants>
						<S.ThemeResetButtonPlaceholder />
					</S.ThemeSectionHeader>
					{Object.entries(sortedSection).map(([key, value]: any) => {
						const originalValue = originalTheme?.[section]?.colors?.[key.toLowerCase()];
						const hasChanges = JSON.stringify(originalValue) !== JSON.stringify(value);

						return (
							<React.Fragment key={key}>
								<S.ThemeRowWrapper>
									<S.ThemeRow>
										<S.ThemeKey>{key.charAt(0).toUpperCase() + key.slice(1)}</S.ThemeKey>
										<S.ThemeVariantsWrapper>
											<S.ThemeLight colors={props.theme.basics?.colors}>
												<S.ThemeValue>
													<Color
														key={`${key}-light`}
														label={key}
														value={value.light}
														basics={props.theme.basics?.colors}
														scheme={'light'}
														onChange={(newColor) => handleThemeChange(section, 'colors', 'light', key, newColor)}
														loading={loading}
														disabled={unauthorized}
														width={125}
													/>
												</S.ThemeValue>
											</S.ThemeLight>
											<S.ThemeDark colors={props.theme.basics?.colors}>
												<S.ThemeValue>
													<Color
														key={`${key}-dark`}
														label={key}
														value={value.dark}
														basics={props.theme.basics?.colors}
														scheme={'dark'}
														onChange={(newColor) => handleThemeChange(section, 'colors', 'dark', key, newColor)}
														loading={loading}
														disabled={unauthorized}
														width={125}
													/>
												</S.ThemeValue>
											</S.ThemeDark>
										</S.ThemeVariantsWrapper>
										<S.ThemeResetButton $hasChanges={hasChanges}>
											<IconButton
												type={'alt1'}
												active={false}
												src={ICONS.reset}
												handlePress={() => handleReset(section, 'colors', key)}
												disabled={unauthorized || !hasChanges}
												dimensions={{ wrapper: 20, icon: 11 }}
												tooltip={'Reset'}
												tooltipPosition={'left'}
												noFocus
												className={hasChanges ? 'reset-active' : ''}
											/>
										</S.ThemeResetButton>
									</S.ThemeRow>
								</S.ThemeRowWrapper>
								{section === 'basics' && key === 'text' && (
									<S.ThemeRowWrapper>
										<S.ThemeRow>
											<S.ThemeKey>Links</S.ThemeKey>
											<S.ThemeVariantsWrapper>
												<S.ThemeLight colors={props.theme.basics?.colors}>
													<S.ThemeValue>
														<button
															onClick={() => {
																setLinksScheme('light');
																setShowLinksModal(true);
															}}
															disabled={unauthorized}
															style={{
																width: '125px',
																height: '40px',
																background: `rgba(${props.theme.basics?.colors?.background?.light || '255,255,255'},1)`,
																border: `1px solid rgba(${props.theme.basics?.colors?.border?.light || '0,0,0'},0.2)`,
																borderRadius: '7.5px',
																cursor: 'pointer',
																display: 'flex',
																alignItems: 'center',
																justifyContent: 'center',
																textDecoration: theme.links?.preferences?.default?.underline ? 'underline' : 'none',
																fontWeight: theme.links?.preferences?.default?.bold ? 'bold' : 'normal',
																fontStyle: theme.links?.preferences?.default?.cursive ? 'italic' : 'normal',
																fontSize: '14px',
																color: `rgba(${resolveColorForDisplay(
																	theme.links?.colors?.default?.light,
																	'light',
																	props.theme.basics?.colors
																)},1)`,
																transition: 'all 0.2s ease',
															}}
															onMouseEnter={(e) => {
																e.currentTarget.style.color = `rgba(${resolveColorForDisplay(
																	theme.links?.colors?.hover?.light,
																	'light',
																	props.theme.basics?.colors
																)},1)`;
																e.currentTarget.style.textDecoration = theme.links?.preferences?.hover?.underline
																	? 'underline'
																	: 'none';
																e.currentTarget.style.fontWeight = theme.links?.preferences?.hover?.bold
																	? 'bold'
																	: 'normal';
																e.currentTarget.style.fontStyle = theme.links?.preferences?.hover?.cursive
																	? 'italic'
																	: 'normal';
															}}
															onMouseLeave={(e) => {
																e.currentTarget.style.color = `rgba(${resolveColorForDisplay(
																	theme.links?.colors?.default?.light,
																	'light',
																	props.theme.basics?.colors
																)},1)`;
																e.currentTarget.style.textDecoration = theme.links?.preferences?.default?.underline
																	? 'underline'
																	: 'none';
																e.currentTarget.style.fontWeight = theme.links?.preferences?.default?.bold
																	? 'bold'
																	: 'normal';
																e.currentTarget.style.fontStyle = theme.links?.preferences?.default?.cursive
																	? 'italic'
																	: 'normal';
															}}
														>
															Example Link
														</button>
													</S.ThemeValue>
												</S.ThemeLight>
												<S.ThemeDark colors={props.theme.basics?.colors}>
													<S.ThemeValue>
														<button
															onClick={() => {
																setLinksScheme('dark');
																setShowLinksModal(true);
															}}
															disabled={unauthorized}
															style={{
																width: '125px',
																height: '40px',
																background: `rgba(${props.theme.basics?.colors?.background?.dark || '0,0,0'},1)`,
																border: `1px solid rgba(${
																	props.theme.basics?.colors?.border?.dark || '255,255,255'
																},0.2)`,
																borderRadius: '7.5px',
																cursor: 'pointer',
																display: 'flex',
																alignItems: 'center',
																justifyContent: 'center',
																textDecoration: theme.links?.preferences?.default?.underline ? 'underline' : 'none',
																fontWeight: theme.links?.preferences?.default?.bold ? 'bold' : 'normal',
																fontStyle: theme.links?.preferences?.default?.cursive ? 'italic' : 'normal',
																fontSize: '14px',
																color: `rgba(${resolveColorForDisplay(
																	theme.links?.colors?.default?.dark,
																	'dark',
																	props.theme.basics?.colors
																)},1)`,
																transition: 'all 0.2s ease',
															}}
															onMouseEnter={(e) => {
																e.currentTarget.style.color = `rgba(${resolveColorForDisplay(
																	theme.links?.colors?.hover?.dark,
																	'dark',
																	props.theme.basics?.colors
																)},1)`;
																e.currentTarget.style.textDecoration = theme.links?.preferences?.hover?.underline
																	? 'underline'
																	: 'none';
																e.currentTarget.style.fontWeight = theme.links?.preferences?.hover?.bold
																	? 'bold'
																	: 'normal';
																e.currentTarget.style.fontStyle = theme.links?.preferences?.hover?.cursive
																	? 'italic'
																	: 'normal';
															}}
															onMouseLeave={(e) => {
																e.currentTarget.style.color = `rgba(${resolveColorForDisplay(
																	theme.links?.colors?.default?.dark,
																	'dark',
																	props.theme.basics?.colors
																)},1)`;
																e.currentTarget.style.textDecoration = theme.links?.preferences?.default?.underline
																	? 'underline'
																	: 'none';
																e.currentTarget.style.fontWeight = theme.links?.preferences?.default?.bold
																	? 'bold'
																	: 'normal';
																e.currentTarget.style.fontStyle = theme.links?.preferences?.default?.cursive
																	? 'italic'
																	: 'normal';
															}}
														>
															Example Link
														</button>
													</S.ThemeValue>
												</S.ThemeDark>
											</S.ThemeVariantsWrapper>
											<S.ThemeResetButton
												$hasChanges={JSON.stringify(originalTheme?.links) !== JSON.stringify(theme.links)}
											>
												<IconButton
													type={'alt1'}
													active={false}
													src={ICONS.reset}
													handlePress={() => {
														const savedValue = originalTheme?.links;
														if (!savedValue) return;
														setTheme({ ...theme, links: savedValue });
													}}
													disabled={
														unauthorized || JSON.stringify(originalTheme?.links) === JSON.stringify(theme.links)
													}
													dimensions={{ wrapper: 20, icon: 11 }}
													tooltip={'Reset'}
													tooltipPosition={'left'}
													noFocus
													className={
														JSON.stringify(originalTheme?.links) !== JSON.stringify(theme.links) ? 'reset-active' : ''
													}
												/>
											</S.ThemeResetButton>
										</S.ThemeRow>
									</S.ThemeRowWrapper>
								)}
							</React.Fragment>
						);
					})}
					{validPreferences.map(([key, value]: any) => {
						const isBoolean = typeof value.light === 'boolean';
						const isNumeric = typeof value.light === 'number';
						const originalValue = originalTheme?.[section]?.preferences?.[key.toLowerCase()];
						const hasChanges = JSON.stringify(originalValue) !== JSON.stringify(value);

						if (isNumeric) {
							return (
								<S.ThemeRowWrapper key={key}>
									<S.ThemeRow>
										<S.ThemeKey>{key.charAt(0).toUpperCase() + key.slice(1)}</S.ThemeKey>
										<S.ThemeVariantsWrapper>
											<S.ThemeLight colors={props.theme.basics?.colors}>
												<S.ThemeValue>
													<S.RangeWrapper>
														<input
															type="range"
															value={value.light}
															onChange={(e) =>
																handleThemeChange(section, 'preferences', 'light', key, parseFloat(e.target.value))
															}
															disabled={unauthorized}
															min="0"
															max="1"
															step="0.01"
														/>
														<span>{value.light}</span>
													</S.RangeWrapper>
												</S.ThemeValue>
											</S.ThemeLight>
											<S.ThemeDark colors={props.theme.basics?.colors}>
												<S.ThemeValue>
													<S.RangeWrapper>
														<input
															type="range"
															value={value.dark}
															onChange={(e) =>
																handleThemeChange(section, 'preferences', 'dark', key, parseFloat(e.target.value))
															}
															disabled={unauthorized}
															min="0"
															max="1"
															step="0.01"
														/>
														<span>{value.dark}</span>
													</S.RangeWrapper>
												</S.ThemeValue>
											</S.ThemeDark>
										</S.ThemeVariantsWrapper>
										<S.ThemeResetButton $hasChanges={hasChanges}>
											<IconButton
												type={'alt1'}
												active={false}
												src={ICONS.reset}
												handlePress={() => handleReset(section, 'preferences', key)}
												disabled={unauthorized || !hasChanges}
												dimensions={{ wrapper: 20, icon: 11 }}
												tooltip={'Reset'}
												tooltipPosition={'left'}
												noFocus
												className={hasChanges ? 'reset-active' : ''}
											/>
										</S.ThemeResetButton>
									</S.ThemeRow>
								</S.ThemeRowWrapper>
							);
						}

						if (isBoolean) {
							return (
								<S.ThemeRowWrapper key={key}>
									<S.ThemeRow>
										<S.ThemeKey>{key.charAt(0).toUpperCase() + key.slice(1)}</S.ThemeKey>
										<S.ThemeVariantsWrapper>
											<S.ThemeLight colors={props.theme.basics?.colors}>
												<S.ThemeValue>
													<Toggle
														options={['OFF', 'ON']}
														activeOption={value.light ? 'ON' : 'OFF'}
														handleToggle={(option) =>
															handleThemeChange(section, 'preferences', 'light', key, option === 'ON')
														}
														disabled={unauthorized}
													/>
												</S.ThemeValue>
											</S.ThemeLight>
											<S.ThemeDark colors={props.theme.basics?.colors}>
												<S.ThemeValue>
													<Toggle
														options={['OFF', 'ON']}
														activeOption={value.dark ? 'ON' : 'OFF'}
														handleToggle={(option) =>
															handleThemeChange(section, 'preferences', 'dark', key, option === 'ON')
														}
														disabled={unauthorized}
													/>
												</S.ThemeValue>
											</S.ThemeDark>
										</S.ThemeVariantsWrapper>
										<S.ThemeResetButton $hasChanges={hasChanges}>
											<IconButton
												type={'alt1'}
												active={false}
												src={ICONS.reset}
												handlePress={() => handleReset(section, 'preferences', key)}
												disabled={unauthorized || !hasChanges}
												dimensions={{ wrapper: 20, icon: 11 }}
												tooltip={'Reset'}
												tooltipPosition={'left'}
												noFocus
												className={hasChanges ? 'reset-active' : ''}
											/>
										</S.ThemeResetButton>
									</S.ThemeRow>
								</S.ThemeRowWrapper>
							);
						}

						return (
							<S.ThemeRowWrapper key={key}>
								<S.ThemeRow>
									<S.ThemeKey>{key.charAt(0).toUpperCase() + key.slice(1)}</S.ThemeKey>
									<S.ThemeVariantsWrapper>
										<S.ThemeLight colors={props.theme.basics?.colors}>
											<S.ThemeValue>
												<Color
													key={`${key}-light`}
													label={key}
													value={value.light}
													basics={props.theme.basics?.colors}
													scheme={'light'}
													onChange={(newValue) => handleThemeChange(section, 'preferences', 'light', key, newValue)}
													loading={loading}
													disabled={unauthorized}
													width={125}
												/>
											</S.ThemeValue>
										</S.ThemeLight>
										<S.ThemeDark colors={props.theme.basics?.colors}>
											<S.ThemeValue>
												<Color
													key={`${key}-dark`}
													label={key}
													value={value.dark}
													basics={props.theme.basics?.colors}
													scheme={'dark'}
													onChange={(newValue) => handleThemeChange(section, 'preferences', 'dark', key, newValue)}
													loading={loading}
													disabled={unauthorized}
													width={125}
												/>
											</S.ThemeValue>
										</S.ThemeDark>
									</S.ThemeVariantsWrapper>
									<S.ThemeResetButton $hasChanges={hasChanges}>
										<IconButton
											type={'alt1'}
											active={false}
											src={ICONS.reset}
											handlePress={() => handleReset(section, 'preferences', key)}
											disabled={unauthorized || !hasChanges}
											dimensions={{ wrapper: 20, icon: 11 }}
											tooltip={'Reset'}
											tooltipPosition={'left'}
											noFocus
											className={hasChanges ? 'reset-active' : ''}
										/>
									</S.ThemeResetButton>
								</S.ThemeRow>
							</S.ThemeRowWrapper>
						);
					})}
				</S.ThemeSectionColumn>
			)}
			{showLinksModal && (
				<Modal header={'Links'} handleClose={() => setShowLinksModal(false)}>
					<S.ModalWrapper>
						<S.ModalBodyWrapper>
							<div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
								<div>
									<S.ThemeSectionLabel style={{ marginBottom: '15px' }}>Default</S.ThemeSectionLabel>
									<div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
										<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
											<S.ThemeKey>Color</S.ThemeKey>
											<Color
												label={'color'}
												value={theme.links?.colors?.default?.[linksScheme] || 'text'}
												basics={props.theme.basics?.colors}
												scheme={linksScheme}
												onChange={(newValue) => {
													const updatedTheme = {
														...theme,
														links: {
															colors: {
																...theme.links?.colors,
																default: {
																	...theme.links?.colors?.default,
																	[linksScheme]: newValue,
																},
																hover: theme.links?.colors?.hover || { light: 'text', dark: 'text' },
															},
															preferences: theme.links?.preferences || {
																default: { underline: true, cursive: false, bold: false },
																hover: { underline: true, cursive: false, bold: false },
															},
														},
													};
													setTheme(updatedTheme);
												}}
												loading={loading}
												disabled={unauthorized}
												width={125}
											/>
										</div>
										<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
											<S.ThemeKey>Style</S.ThemeKey>
											<div style={{ display: 'flex', gap: '10px' }}>
												<IconButton
													type={'alt1'}
													active={theme.links?.preferences?.default?.bold || false}
													src={ICONS.bold}
													handlePress={() => {
														const updatedTheme = {
															...theme,
															links: {
																colors: theme.links?.colors || {
																	default: { light: 'text', dark: 'text' },
																	hover: { light: 'text', dark: 'text' },
																},
																preferences: {
																	...theme.links?.preferences,
																	default: {
																		...theme.links?.preferences?.default,
																		bold: !theme.links?.preferences?.default?.bold,
																	},
																	hover: theme.links?.preferences?.hover || {
																		underline: true,
																		cursive: false,
																		bold: false,
																	},
																},
															},
														};
														setTheme(updatedTheme);
													}}
													disabled={unauthorized}
													dimensions={{ wrapper: 32, icon: 16 }}
												/>
												<IconButton
													type={'alt1'}
													active={theme.links?.preferences?.default?.cursive || false}
													src={ICONS.italic}
													handlePress={() => {
														const updatedTheme = {
															...theme,
															links: {
																colors: theme.links?.colors || {
																	default: { light: 'text', dark: 'text' },
																	hover: { light: 'text', dark: 'text' },
																},
																preferences: {
																	...theme.links?.preferences,
																	default: {
																		...theme.links?.preferences?.default,
																		cursive: !theme.links?.preferences?.default?.cursive,
																	},
																	hover: theme.links?.preferences?.hover || {
																		underline: true,
																		cursive: false,
																		bold: false,
																	},
																},
															},
														};
														setTheme(updatedTheme);
													}}
													disabled={unauthorized}
													dimensions={{ wrapper: 32, icon: 16 }}
												/>
												<IconButton
													type={'alt1'}
													active={theme.links?.preferences?.default?.underline || false}
													src={ICONS.underline}
													handlePress={() => {
														const updatedTheme = {
															...theme,
															links: {
																colors: theme.links?.colors || {
																	default: { light: 'text', dark: 'text' },
																	hover: { light: 'text', dark: 'text' },
																},
																preferences: {
																	...theme.links?.preferences,
																	default: {
																		...theme.links?.preferences?.default,
																		underline: !theme.links?.preferences?.default?.underline,
																	},
																	hover: theme.links?.preferences?.hover || {
																		underline: true,
																		cursive: false,
																		bold: false,
																	},
																},
															},
														};
														setTheme(updatedTheme);
													}}
													disabled={unauthorized}
													dimensions={{ wrapper: 32, icon: 16 }}
												/>
											</div>
										</div>
									</div>
								</div>
								<div>
									<S.ThemeSectionLabel style={{ marginBottom: '15px' }}>Hover</S.ThemeSectionLabel>
									<div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
										<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
											<S.ThemeKey>Color</S.ThemeKey>
											<Color
												label={'color'}
												value={theme.links?.colors?.hover?.[linksScheme] || 'text'}
												basics={props.theme.basics?.colors}
												scheme={linksScheme}
												onChange={(newValue) => {
													const updatedTheme = {
														...theme,
														links: {
															colors: {
																...theme.links?.colors,
																default: theme.links?.colors?.default || { light: 'text', dark: 'text' },
																hover: {
																	...theme.links?.colors?.hover,
																	[linksScheme]: newValue,
																},
															},
															preferences: theme.links?.preferences || {
																default: { underline: true, cursive: false, bold: false },
																hover: { underline: true, cursive: false, bold: false },
															},
														},
													};
													setTheme(updatedTheme);
												}}
												loading={loading}
												disabled={unauthorized}
												width={125}
											/>
										</div>
										<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
											<S.ThemeKey>Style</S.ThemeKey>
											<div style={{ display: 'flex', gap: '10px' }}>
												<IconButton
													type={'alt1'}
													active={theme.links?.preferences?.hover?.bold || false}
													src={ICONS.bold}
													handlePress={() => {
														const updatedTheme = {
															...theme,
															links: {
																colors: theme.links?.colors || {
																	default: { light: 'text', dark: 'text' },
																	hover: { light: 'text', dark: 'text' },
																},
																preferences: {
																	...theme.links?.preferences,
																	default: theme.links?.preferences?.default || {
																		underline: true,
																		cursive: false,
																		bold: false,
																	},
																	hover: {
																		...theme.links?.preferences?.hover,
																		bold: !theme.links?.preferences?.hover?.bold,
																	},
																},
															},
														};
														setTheme(updatedTheme);
													}}
													disabled={unauthorized}
													dimensions={{ wrapper: 32, icon: 16 }}
												/>
												<IconButton
													type={'alt1'}
													active={theme.links?.preferences?.hover?.cursive || false}
													src={ICONS.italic}
													handlePress={() => {
														const updatedTheme = {
															...theme,
															links: {
																colors: theme.links?.colors || {
																	default: { light: 'text', dark: 'text' },
																	hover: { light: 'text', dark: 'text' },
																},
																preferences: {
																	...theme.links?.preferences,
																	default: theme.links?.preferences?.default || {
																		underline: true,
																		cursive: false,
																		bold: false,
																	},
																	hover: {
																		...theme.links?.preferences?.hover,
																		cursive: !theme.links?.preferences?.hover?.cursive,
																	},
																},
															},
														};
														setTheme(updatedTheme);
													}}
													disabled={unauthorized}
													dimensions={{ wrapper: 32, icon: 16 }}
												/>
												<IconButton
													type={'alt1'}
													active={theme.links?.preferences?.hover?.underline || false}
													src={ICONS.underline}
													handlePress={() => {
														const updatedTheme = {
															...theme,
															links: {
																colors: theme.links?.colors || {
																	default: { light: 'text', dark: 'text' },
																	hover: { light: 'text', dark: 'text' },
																},
																preferences: {
																	...theme.links?.preferences,
																	default: theme.links?.preferences?.default || {
																		underline: true,
																		cursive: false,
																		bold: false,
																	},
																	hover: {
																		...theme.links?.preferences?.hover,
																		underline: !theme.links?.preferences?.hover?.underline,
																	},
																},
															},
														};
														setTheme(updatedTheme);
													}}
													disabled={unauthorized}
													dimensions={{ wrapper: 32, icon: 16 }}
												/>
											</div>
										</div>
									</div>
								</div>
							</div>
							<div
								style={{
									width: '100%',
									padding: '30px',
									background: `rgba(${
										props.theme.basics?.colors?.background?.[linksScheme] ||
										(linksScheme === 'light' ? '255,255,255' : '0,0,0')
									},1)`,
									border: `1px solid rgba(${
										props.theme.basics?.colors?.border?.[linksScheme] ||
										(linksScheme === 'light' ? '0,0,0' : '255,255,255')
									},0.2)`,
									borderRadius: '7.5px',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									marginTop: '30px',
								}}
							>
								<a
									href="#"
									onClick={(e) => e.preventDefault()}
									style={{
										color: `rgba(${resolveColorForDisplay(
											theme.links?.colors?.default?.[linksScheme],
											linksScheme,
											props.theme.basics?.colors
										)},1)`,
										textDecoration: theme.links?.preferences?.default?.underline ? 'underline' : 'none',
										fontWeight: theme.links?.preferences?.default?.bold ? 'bold' : 'normal',
										fontStyle: theme.links?.preferences?.default?.cursive ? 'italic' : 'normal',
										fontSize: '16px',
										transition: 'all 0.2s ease',
									}}
									onMouseEnter={(e) => {
										e.currentTarget.style.color = `rgba(${resolveColorForDisplay(
											theme.links?.colors?.hover?.[linksScheme],
											linksScheme,
											props.theme.basics?.colors
										)},1)`;
										e.currentTarget.style.textDecoration = theme.links?.preferences?.hover?.underline
											? 'underline'
											: 'none';
										e.currentTarget.style.fontWeight = theme.links?.preferences?.hover?.bold ? 'bold' : 'normal';
										e.currentTarget.style.fontStyle = theme.links?.preferences?.hover?.cursive ? 'italic' : 'normal';
									}}
									onMouseLeave={(e) => {
										e.currentTarget.style.color = `rgba(${resolveColorForDisplay(
											theme.links?.colors?.default?.[linksScheme],
											linksScheme,
											props.theme.basics?.colors
										)},1)`;
										e.currentTarget.style.textDecoration = theme.links?.preferences?.default?.underline
											? 'underline'
											: 'none';
										e.currentTarget.style.fontWeight = theme.links?.preferences?.default?.bold ? 'bold' : 'normal';
										e.currentTarget.style.fontStyle = theme.links?.preferences?.default?.cursive ? 'italic' : 'normal';
									}}
								>
									Example Link
								</a>
							</div>
						</S.ModalBodyWrapper>
						<S.ModalActionsWrapper>
							<Button
								type={'primary'}
								label={language?.close}
								handlePress={() => setShowLinksModal(false)}
								disabled={loading}
							/>
							<Button
								type={'alt1'}
								label={language?.save}
								handlePress={() => {
									setShowLinksModal(false);
								}}
								disabled={loading}
							/>
						</S.ModalActionsWrapper>
					</S.ModalWrapper>
				</Modal>
			)}
		</S.ThemeSectionColumnWrapper>
	);
});

function Theme(props: { theme: any; published: any; loading: boolean; onThemeUpdate: (theme: any) => void }) {
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	// const { theme, published, loading } = props;
	const [theme, setTheme] = React.useState<PortalThemeType>(props.theme);
	const [originalTheme] = React.useState<PortalThemeType>(props.theme); // Store original for comparison
	const [pendingNameChange, setPendingNameChange] = React.useState<string | null>(null);
	const [localName, setLocalName] = React.useState(theme.name || '');

	// Only update if props.theme actually changes from external source
	// Don't update if the only change is the name (which we're editing locally)
	React.useEffect(() => {
		const propsWithoutName = { ...props.theme };
		delete propsWithoutName.name;
		const themeWithoutName = { ...theme };
		delete themeWithoutName.name;

		if (JSON.stringify(propsWithoutName) !== JSON.stringify(themeWithoutName)) {
			setTheme(props.theme);
		}
	}, [props.theme]);

	// Check if theme has changes
	const hasChanges = React.useMemo(() => {
		// Check if there's a pending name change or if theme has changed
		const nameChanged = pendingNameChange !== null && pendingNameChange !== originalTheme.name;
		const themeChanged = JSON.stringify(originalTheme) !== JSON.stringify(theme);
		return nameChanged || themeChanged;
	}, [originalTheme, theme, pendingNameChange]);

	return (
		<S.ThemeWrapper id={'ThemeWrapper'}>
			<FormField
				key={'theme-name-field'}
				value={localName}
				label={'Name'}
				onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
					const newName = e.target.value;
					setLocalName(newName);
					setPendingNameChange(newName);
				}}
				invalid={{ status: false, message: null }}
				disabled={false}
				hideErrorMessage={true}
			/>
			<S.Theme>
				<ThemeSection
					theme={theme}
					setTheme={setTheme}
					originalTheme={originalTheme}
					section={'basics'}
					loading={props.loading}
					onNameChange={setPendingNameChange}
				/>
				<ThemeSection
					theme={theme}
					setTheme={setTheme}
					originalTheme={originalTheme}
					section={'header'}
					loading={props.loading}
					onNameChange={setPendingNameChange}
				/>
				<ThemeSection
					theme={theme}
					setTheme={setTheme}
					originalTheme={originalTheme}
					section={'navigation'}
					loading={props.loading}
					onNameChange={setPendingNameChange}
				/>
				<ThemeSection
					theme={theme}
					setTheme={setTheme}
					originalTheme={originalTheme}
					section={'post'}
					loading={props.loading}
					onNameChange={setPendingNameChange}
				/>
				<ThemeSection
					theme={theme}
					setTheme={setTheme}
					originalTheme={originalTheme}
					section={'footer'}
					loading={props.loading}
					onNameChange={setPendingNameChange}
				/>
				<ThemeSection
					theme={theme}
					setTheme={setTheme}
					originalTheme={originalTheme}
					section={'card'}
					loading={props.loading}
					onNameChange={setPendingNameChange}
				/>
			</S.Theme>

			<S.EndActions>
				<Button
					type={'alt1'}
					label={language?.save || 'Save'}
					handlePress={() => {
						// Include pending name change if exists
						const finalTheme = pendingNameChange !== null ? { ...theme, name: pendingNameChange } : theme;
						props.onThemeUpdate(finalTheme);
						setPendingNameChange(null); // Clear pending change after save
					}}
					loading={props.loading}
					disabled={props.loading || !hasChanges}
				/>
			</S.EndActions>
		</S.ThemeWrapper>
	);
}

// function Section(props: {
// 	label: string;
// 	theme: PortalThemeType;
// 	onThemeChange: (theme: PortalThemeType, publish: boolean, prevName?: string) => void;
// 	onThemePublish: (theme: PortalThemeType) => void;
// 	onThemeCancel: (theme: PortalThemeType) => void;
// 	handleThemeRemove: (theme: PortalThemeType) => void;
// 	removeDisabled: boolean;
// 	published: boolean;
// 	loading: boolean;
// }) {
// 	const portalProvider = usePortalProvider();
// 	const [theme, setTheme] = React.useState<PortalThemeType>(props.theme);
// 	const [name, setName] = React.useState<string>(props.theme.name ?? '-');
// 	const unauthorized = !portalProvider.permissions?.updatePortalMeta;

// 	React.useEffect(() => {
// 		setTheme(props.theme);
// 		setName(props.theme.name ?? '-');
// 	}, [props.theme]);

// 	function handleThemeChange(key: string, newColor: string) {
// 		const updatedTheme = {
// 			...theme,
// 			basics: {
// 				...theme.basics,
// 				colors: {
// 					...theme.basics.colors,
// 					[key]: newColor,
// 				},
// 			},
// 		};
// 		setTheme(updatedTheme);
// 		if (props.published) props.onThemeChange(updatedTheme, false);
// 	}

// 	const languageProvider = useLanguageProvider();
// 	const language = languageProvider.object[languageProvider.current];

// 	// const { background, ...remainingTheme } = props.theme.basics.colors;
// 	const remainingTheme = props.theme.basics.colors;

// 	const [scheme, setScheme] = React.useState<'light' | 'dark'>(props.theme.scheme);
// 	const [showNameEdit, setShowNameEdit] = React.useState<boolean>(false);
// 	const [showRemoveConfirmation, setShowRemoveConfirmation] = React.useState<boolean>(false);

// 	const orderedRemainingTheme = Object.keys(THEME.DEFAULT.basics.colors)
// 		// .filter((key) => key !== 'background')
// 		.reduce((acc: Record<string, any>, key) => {
// 			if (remainingTheme && remainingTheme.hasOwnProperty(key)) {
// 				acc[key] = remainingTheme[key];
// 			}
// 			return acc;
// 		}, {} as Record<string, any>);

// 	function handleNameChange() {
// 		const updatedTheme = {
// 			...theme,
// 			name: name,
// 		};

// 		if (props.published) props.onThemeChange(updatedTheme, false, props.theme.name);

// 		setTheme(updatedTheme);
// 		setShowNameEdit(false);
// 	}

// 	function handleSchemeChange(option: string) {
// 		const updatedScheme = option as PortalSchemeType;

// 		const updatedTheme = {
// 			...theme,
// 			scheme: updatedScheme,
// 		};

// 		if (props.published) props.onThemeChange(updatedTheme, false, props.theme.name);

// 		setTheme(updatedTheme);
// 		setScheme(updatedScheme);
// 	}

// 	return (
// 		<>
// 			<S.Section id={'Section'}>
// 				<S.SectionHeader>
// 					<p>{name}</p>
// 					{/*
// 					<S.SectionHeaderActions>
// 						<IconButton
// 							type={'alt1'}
// 							active={false}
// 							src={ICONS.write}
// 							handlePress={() => setShowNameEdit(true)}
// 							disabled={unauthorized}
// 							dimensions={{ wrapper: 23.5, icon: 13.5 }}
// 							tooltip={language?.editThemeName}
// 							tooltipPosition={'bottom-right'}
// 							noFocus
// 						/>
// 						<IconButton
// 							type={'alt1'}
// 							active={false}
// 							src={ICONS.delete}
// 							handlePress={() => setShowRemoveConfirmation(true)}
// 							disabled={unauthorized || props.removeDisabled}
// 							dimensions={{ wrapper: 23.5, icon: 13.5 }}
// 							tooltip={language?.remove}
// 							tooltipPosition={'bottom-right'}
// 							noFocus
// 						/>
// 					</S.SectionHeaderActions>
// 					*/}
// 				</S.SectionHeader>
// 				<S.SectionBody>
// 					{/*
// 					<S.FlexWrapper>
// 						<S.SectionsWrapper>
// 							Background
// 							<Color
// 								label={language?.background}
// 								value={background}
// 								onChange={(newColor) => handleThemeChange('background', newColor)}
// 								loading={props.loading}
// 								width={130.5}
// 								disabled={unauthorized}
// 							/>
// 						</S.SectionsWrapper>

// 					</S.FlexWrapper>
// 					*/}
// 					<S.AttributesWrapper
// 						className={'border-wrapper-alt2'}
// 						style={{
// 							color: `rgba(${theme.basics.colors.text},1)`,
// 							background: `rgba(${theme.basics.colors.background},1)`,
// 						}}
// 					>
// 						<S.GridWrapper id="GridWrapper">
// 							<S.GridRows id="GridRows">
// 								{Object.entries(orderedRemainingTheme).map(([key, value]: any) => (
// 									<S.GridRow id="GridRow" key={key}>
// 										<span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
// 										<Color
// 											key={key}
// 											label={key}
// 											value={value}
// 											basics={theme.basics?.colors}
// 											scheme={scheme}
// 											onChange={(newColor) => handleThemeChange(key, newColor)}
// 											loading={props.loading}
// 											disabled={unauthorized}
// 										/>
// 									</S.GridRow>
// 								))}
// 							</S.GridRows>
// 						</S.GridWrapper>
// 					</S.AttributesWrapper>

// 					<S.AttributesWrapper
// 						className={'border-wrapper-alt2'}
// 						style={{
// 							color: `rgba(${theme.basics.colors.text},1)`,
// 							background: `rgba(${theme.basics.colors.background},1)`,
// 						}}
// 					>
// 						Default Button
// 						<S.ButtonPreview theme={theme.buttons.default}>Preview</S.ButtonPreview>
// 						<S.GridWrapper id={'GridWrapper'}>
// 							<S.GridRows id={'GridRows'}>
// 								{Object.entries(theme.buttons.default.default.colors).map(([key, value]: any) => (
// 									<S.GridRow id={'GridRow'} key={key}>
// 										<span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
// 										<Color
// 											key={key}
// 											label={key}
// 											value={value}
// 											basics={theme.basics?.colors}
// 											scheme={scheme}
// 											onChange={(newColor) => handleThemeChange(key, newColor)}
// 											loading={props.loading}
// 											disabled={unauthorized}
// 										/>
// 									</S.GridRow>
// 								))}
// 							</S.GridRows>
// 						</S.GridWrapper>
// 					</S.AttributesWrapper>
// 					{/*

// 						<Toggle
// 							label={language?.colorScheme}
// 							options={[PortalSchemeType.Light, PortalSchemeType.Dark]}
// 							activeOption={scheme}
// 							handleToggle={(option: string) => handleSchemeChange(option)}
// 							disabled={unauthorized}
// 						/>
// 						{!props.published && (
// 							<S.SectionActions>
// 								<Button
// 									type={'alt3'}
// 									label={language?.cancel}
// 									handlePress={() => {
// 										props.onThemeCancel(props.theme);
// 									}}
// 									disabled={unauthorized}
// 								/>
// 								<Button
// 									type={'alt4'}
// 									label={language?.publishTheme}
// 									handlePress={() => props.onThemePublish(theme)}
// 									disabled={unauthorized}
// 								/>
// 							</S.SectionActions>
// 						)}
// 					</S.AttributesWrapper>
// 					*/}
// 				</S.SectionBody>
// 			</S.Section>
// 			{showNameEdit && (
// 				<Modal header={language?.editThemeName} handleClose={() => setShowNameEdit(false)}>
// 					<S.ModalWrapper>
// 						<FormField
// 							value={name}
// 							onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
// 							invalid={{ status: false, message: null }}
// 							disabled={unauthorized}
// 							hideErrorMessage
// 							sm
// 						/>
// 						<S.ModalActionsWrapper>
// 							<Button
// 								type={'primary'}
// 								label={language?.cancel}
// 								handlePress={() => setShowNameEdit(false)}
// 								disabled={unauthorized}
// 							/>
// 							<Button
// 								type={'alt1'}
// 								label={language?.save}
// 								handlePress={() => handleNameChange()}
// 								disabled={unauthorized}
// 								loading={false}
// 							/>
// 						</S.ModalActionsWrapper>
// 					</S.ModalWrapper>
// 				</Modal>
// 			)}
// 			{showRemoveConfirmation && (
// 				<Modal header={language?.confirmDeletion} handleClose={() => setShowNameEdit(false)}>
// 					<S.ModalWrapper>
// 						<S.ModalBodyWrapper>
// 							<p>{language?.themeDeleteConfirmationInfo}</p>
// 							<S.ModalBodyElements>
// 								<S.ModalBodyElement>
// 									<span>{name}</span>
// 								</S.ModalBodyElement>
// 							</S.ModalBodyElements>
// 						</S.ModalBodyWrapper>
// 						<S.ModalActionsWrapper>
// 							<Button
// 								type={'primary'}
// 								label={language?.cancel}
// 								handlePress={() => setShowRemoveConfirmation(false)}
// 								disabled={false}
// 							/>
// 							<Button
// 								type={'primary'}
// 								label={language?.themeDeleteConfirmation}
// 								handlePress={() => {
// 									props.handleThemeRemove(theme);
// 									setShowRemoveConfirmation(false);
// 								}}
// 								disabled={unauthorized}
// 								loading={false}
// 								icon={ICONS.delete}
// 								iconLeftAlign
// 								warning
// 							/>
// 						</S.ModalActionsWrapper>
// 					</S.ModalWrapper>
// 				</Modal>
// 			)}
// 		</>
// 	);
// }

export default function Themes() {
	const arProvider = useArweaveProvider();
	const permawebProvider = usePermawebProvider();
	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [options, setOptions] = React.useState<PortalThemeType[] | null>(null);
	const [loading, setLoading] = React.useState<boolean>(false);
	const { addNotification } = useNotifications();

	const unauthorized = !portalProvider.permissions?.updatePortalMeta;

	React.useEffect(() => {
		if (portalProvider.current?.id) {
			if (portalProvider.current.themes) {
				setOptions(portalProvider.current.themes);
			}
		}
	}, [portalProvider.current]);

	// // eslint-disable-next-line @typescript-eslint/no-unused-vars
	// async function handleThemeUpdate(theme: PortalThemeType, publish: boolean, prevName?: string) {
	// 	if (!theme) return;

	// 	const allOptionNames = new Set(options?.map((t) => t.name));

	// 	if (allOptionNames.has(theme.name)) {
	// 		addNotification(`A theme '${theme.name}' already exists.`, 'warning');
	// 		return;
	// 	}

	// 	if (prevName) {
	// 		allOptionNames.delete(prevName);
	// 	}

	// 	const publishedNames = new Set(portalProvider.current?.themes.map((t) => t.name));

	// 	if (prevName && publishedNames.has(prevName)) {
	// 		publishedNames.delete(prevName);
	// 		publishedNames.add(theme.name);
	// 	} else if (publish) {
	// 		publishedNames.add(theme.name);
	// 	}

	// 	const mapped =
	// 		options?.map((existing) => {
	// 			const matchKey = prevName ?? theme.name;
	// 			return existing.name === matchKey ? theme : existing;
	// 		}) || [];

	// 	const updated = mapped.filter((t) => publishedNames.has(t.name));

	// 	await submitUpdatedThemes(updated);
	// }

	// // eslint-disable-next-line @typescript-eslint/no-unused-vars
	// async function handleThemePublish(theme: PortalThemeType) {
	// 	if (!theme) return;

	// 	const themeExists = portalProvider.current?.themes?.find(
	// 		(existingTheme: PortalThemeType) => existingTheme.name === theme.name
	// 	);

	// 	if (themeExists) {
	// 		addNotification(`A theme '${theme.name}' already exists.`, 'warning');
	// 		return;
	// 	}

	// 	const updatedThemes = [...(portalProvider.current?.themes ?? []), theme];

	// 	await submitUpdatedThemes(updatedThemes);
	// }

	async function submitUpdatedThemes(themes: PortalThemeType[]) {
		if (!unauthorized && themes && arProvider.wallet && portalProvider.current?.id) {
			setLoading(true);
			try {
				const themeUpdateId = await permawebProvider.libs.updateZone(
					{ Themes: permawebProvider.libs.mapToProcessCase(themes) },
					portalProvider.current.id,
					arProvider.wallet
				);

				portalProvider.refreshCurrentPortal(PortalPatchMapEnum.Presentation);

				debugLog('info', 'Themes', `Theme update: ${themeUpdateId}`);

				setOptions(permawebProvider.libs.mapFromProcessCase(themes));

				addNotification(`${language?.themesUpdated}!`, 'success');
			} catch (e: any) {
				addNotification(e.message ?? 'Error updating theme', 'warning');
			}

			setLoading(false);
		}
	}

	/*
	async function handleAddTheme() {
		const themes = options;

		const baseName = DEFAULT_THEME.light.name;
		const existingNames = new Set(themes.map((t) => t.name));
		let newName = baseName;
		if (existingNames.has(baseName)) {
			let suffix = 2;
			while (existingNames.has(`${baseName} ${suffix}`)) {
				suffix++;
			}
			newName = `${baseName} ${suffix}`;
		}

		const newTheme: PortalThemeType = {
			...DEFAULT_THEME.light,
			name: newName,
		};

		const updatedThemes = [...themes, newTheme];

		setOptions(updatedThemes);
	}

	async function handleRemoveTheme(themeToRemove: PortalThemeType) {
		const updatedThemes = portalProvider.current?.themes?.filter(
			(theme: PortalThemeType) => theme.name !== themeToRemove.name
		);
		await submitUpdatedThemes(updatedThemes);
	}

	function handleCancelTheme(theme: PortalThemeType) {
		if (!theme) return;
		const updated = options.filter((option) => option.name !== theme.name);
		setOptions(updated);
	}
		*/

	const getThemes = () => {
		if (!options) {
			return (
				<S.LoadingWrapper>
					<p>{`${language?.gettingThemes}...`}</p>
				</S.LoadingWrapper>
			);
		} else if (options.length <= 0) {
			return (
				<S.WrapperEmpty>
					<p>{language?.noThemesFound}</p>
				</S.WrapperEmpty>
			);
		}

		// Use the first theme if available, or create a default one
		const currentTheme = options[0] || {
			name: 'Default',
			basics: {
				colors: {
					primary: { light: '0,0,0', dark: '255,255,255' },
					secondary: { light: '128,128,128', dark: '128,128,128' },
					background: { light: '255,255,255', dark: '0,0,0' },
					text: { light: '0,0,0', dark: '255,255,255' },
					border: { light: '200,200,200', dark: '55,55,55' },
				},
			},
		};

		const isPublished =
			loading || portalProvider.updating
				? true
				: portalProvider.current?.themes.find(
						(existingTheme: PortalThemeType) => existingTheme.name === currentTheme.name
				  ) !== undefined;
		return (
			<>
				<Theme
					theme={currentTheme}
					published={isPublished}
					loading={loading}
					onThemeUpdate={(updatedTheme) => submitUpdatedThemes([updatedTheme])}
				/>
			</>
		);
	};

	return (
		<>
			<S.Wrapper>
				{getThemes()}
				{/*
				<S.EndActions>
					<Button
						type={'primary'}
						label={language?.addTheme}
						handlePress={handleAddTheme}
						disabled={unauthorized}
						icon={ICONS.add}
						iconLeftAlign
					/>
				</S.EndActions>
				*/}
			</S.Wrapper>
			{loading && <Loader message={`${language?.updatingTheme}...`} />}
		</>
	);
}
