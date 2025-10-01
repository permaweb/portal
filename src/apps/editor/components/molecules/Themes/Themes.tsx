import React from 'react';
import { HexColorInput, HexColorPicker } from 'react-colorful';
import { ReactSVG } from 'react-svg';

import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
import { FormField } from 'components/atoms/FormField';
import { Loader } from 'components/atoms/Loader';
import { Modal } from 'components/atoms/Modal';
import { Select } from 'components/atoms/Select';
import { ICONS, THEME } from 'helpers/config';
import { PortalPatchMapEnum, PortalSchemeType, PortalThemeType } from 'helpers/types';
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

	function getColor(basics: any, value: string) {
		switch (value) {
			case 'primary':
				return basics.primary[props.scheme];
			case 'secondary':
				return basics.secondary[props.scheme];
			case 'background':
				return basics.background[props.scheme];
			case 'text':
				return basics.text[props.scheme];
			case 'border':
				return basics.border[props.scheme];
			default:
				return value;
		}
	}

	React.useEffect(() => {
		if (props.value) {
			const absoluteValue = getColor(props.basics, props.value);
			setValue(parseRgbStringToHex(absoluteValue));
		}
	}, [props.value]);

	function parseRgbStringToHex(rgbString: string) {
		const [r, g, b] = rgbString.split(',').map(Number);
		return rgbToHex(r, g, b);
	}

	function rgbToHex(r: number, g: number, b: number) {
		const toHex = (value: number) => value.toString(16).padStart(2, '0');
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

	return (
		<>
			<S.ColorWrapper>
				<S.ColorBody
					onClick={() => setShowSelector(true)}
					disabled={props.disabled}
					background={value}
					height={props.height}
					width={props.width}
					maxWidth={props.maxWidth}
					text={value ? getColorContrast(value) : undefined}
				>
					<span>{`${value ? value.toUpperCase() : '-'}`}</span>
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
							<HexColorPicker color={value} onChange={(newValue: string) => setValue(newValue)} />
						</S.SelectorFlexWrapper>
						<S.SelectorActions>
							<HexColorInput color={value} onChange={(newValue: string) => setValue(newValue)} />
							<S.SelectorFlexActions>
								<Button
									type={'primary'}
									label={language?.close}
									handlePress={() => {
										setValue(parseRgbStringToHex(props.value));
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
		</>
	);
}

const ThemeSection = React.memo(function ThemeSection(props: any) {
	const portalProvider = usePortalProvider();
	const { theme, setTheme, name, setName, section, loading } = props;
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];
	const unauthorized = !portalProvider.permissions?.updatePortalMeta;

	// Local state for name editing to prevent re-renders
	const [localName, setLocalName] = React.useState(theme.name || '');
	const [open, setOpen] = React.useState<boolean>(false);

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

	function handleThemeChange(section: string, type: string, scheme: string | null, key: string, newValue: string) {
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
		// if (props.published) props.onThemeChange(updatedTheme, false);
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
					</S.ThemeSectionHeader>
					{Object.entries(sortedSection).map(([key, value]: any) => {
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
													onChange={(newColor) => handleThemeChange('basics', 'colors', 'light', key, newColor)}
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
													onChange={(newColor) => handleThemeChange('basics', 'colors', 'dark', key, newColor)}
													loading={loading}
													disabled={unauthorized}
													width={125}
												/>
											</S.ThemeValue>
										</S.ThemeDark>
									</S.ThemeVariantsWrapper>
								</S.ThemeRow>
							</S.ThemeRowWrapper>
						);
					})}
				</S.ThemeSectionColumn>
			)}
		</S.ThemeSectionColumnWrapper>
	);
});

function Theme(props: { theme: any; published: any; loading: boolean; onThemeUpdate: (theme: any) => void }) {
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	// const { theme, published, loading } = props;
	const [showExpertMode, setShowExpertMode] = React.useState(false);
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

	// const order = ['basics', 'header', 'navigation', 'content', 'footer', 'card'];
	// const sortedTheme = Object.fromEntries([
	// 	...order.map((k) => [k, theme[k]]).filter(([_, v]) => v !== undefined),
	// 	...Object.entries(theme || {}).filter(([k]) => !order.includes(k)),
	// ]);

	return (
		<S.ThemeWrapper id={'ThemeWrapper'}>
			{/* <Select
				activeOption={{ id: theme?.name || 'Default', label: theme?.name || 'Default' }}
				setActiveOption={() => {}}
				options={[{ id: theme?.name || 'Default', label: theme?.name || 'Default' }]}
				disabled={false}
			/> */}
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
					section={'basics'}
					loading={props.loading}
					onNameChange={setPendingNameChange}
				/>
				<ThemeSection
					theme={theme}
					setTheme={setTheme}
					section={'header'}
					loading={props.loading}
					onNameChange={setPendingNameChange}
				/>
				<ThemeSection
					theme={theme}
					setTheme={setTheme}
					section={'footer'}
					loading={props.loading}
					onNameChange={setPendingNameChange}
				/>
				<ThemeSection
					theme={theme}
					setTheme={setTheme}
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

function Section(props: {
	label: string;
	theme: PortalThemeType;
	onThemeChange: (theme: PortalThemeType, publish: boolean, prevName?: string) => void;
	onThemePublish: (theme: PortalThemeType) => void;
	onThemeCancel: (theme: PortalThemeType) => void;
	handleThemeRemove: (theme: PortalThemeType) => void;
	removeDisabled: boolean;
	published: boolean;
	loading: boolean;
}) {
	const portalProvider = usePortalProvider();
	const [theme, setTheme] = React.useState<PortalThemeType>(props.theme);
	const [name, setName] = React.useState<string>(props.theme.name ?? '-');
	const unauthorized = !portalProvider.permissions?.updatePortalMeta;

	React.useEffect(() => {
		setTheme(props.theme);
		setName(props.theme.name ?? '-');
	}, [props.theme]);

	function handleThemeChange(key: string, newColor: string) {
		const updatedTheme = {
			...theme,
			basics: {
				...theme.basics,
				colors: {
					...theme.basics.colors,
					[key]: newColor,
				},
			},
		};
		setTheme(updatedTheme);
		if (props.published) props.onThemeChange(updatedTheme, false);
	}

	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	// const { background, ...remainingTheme } = props.theme.basics.colors;
	const remainingTheme = props.theme.basics.colors;

	const [scheme, setScheme] = React.useState<'light' | 'dark'>(props.theme.scheme);
	const [showNameEdit, setShowNameEdit] = React.useState<boolean>(false);
	const [showRemoveConfirmation, setShowRemoveConfirmation] = React.useState<boolean>(false);

	const orderedRemainingTheme = Object.keys(THEME.DEFAULT.basics.colors)
		// .filter((key) => key !== 'background')
		.reduce((acc: Record<string, any>, key) => {
			if (remainingTheme && remainingTheme.hasOwnProperty(key)) {
				acc[key] = remainingTheme[key];
			}
			return acc;
		}, {} as Record<string, any>);

	function handleNameChange() {
		const updatedTheme = {
			...theme,
			name: name,
		};

		if (props.published) props.onThemeChange(updatedTheme, false, props.theme.name);

		setTheme(updatedTheme);
		setShowNameEdit(false);
	}

	function handleSchemeChange(option: string) {
		const updatedScheme = option as PortalSchemeType;

		const updatedTheme = {
			...theme,
			scheme: updatedScheme,
		};

		if (props.published) props.onThemeChange(updatedTheme, false, props.theme.name);

		setTheme(updatedTheme);
		setScheme(updatedScheme);
	}

	return (
		<>
			<S.Section id={'Section'}>
				<S.SectionHeader>
					<p>{name}</p>
					{/*
					<S.SectionHeaderActions>
						<IconButton
							type={'alt1'}
							active={false}
							src={ICONS.write}
							handlePress={() => setShowNameEdit(true)}
							disabled={unauthorized}
							dimensions={{ wrapper: 23.5, icon: 13.5 }}
							tooltip={language?.editThemeName}
							tooltipPosition={'bottom-right'}
							noFocus
						/>
						<IconButton
							type={'alt1'}
							active={false}
							src={ICONS.delete}
							handlePress={() => setShowRemoveConfirmation(true)}
							disabled={unauthorized || props.removeDisabled}
							dimensions={{ wrapper: 23.5, icon: 13.5 }}
							tooltip={language?.remove}
							tooltipPosition={'bottom-right'}
							noFocus
						/>
					</S.SectionHeaderActions>
					*/}
				</S.SectionHeader>
				<S.SectionBody>
					{/*
					<S.FlexWrapper>
						<S.SectionsWrapper>
							Background
							<Color
								label={language?.background}
								value={background}
								onChange={(newColor) => handleThemeChange('background', newColor)}
								loading={props.loading}
								width={130.5}
								disabled={unauthorized}
							/>
						</S.SectionsWrapper>
						
					</S.FlexWrapper>
					*/}
					<S.AttributesWrapper
						className={'border-wrapper-alt2'}
						style={{
							color: `rgba(${theme.basics.colors.text},1)`,
							background: `rgba(${theme.basics.colors.background},1)`,
						}}
					>
						<S.GridWrapper id="GridWrapper">
							<S.GridRows id="GridRows">
								{Object.entries(orderedRemainingTheme).map(([key, value]: any) => (
									<S.GridRow id="GridRow" key={key}>
										<span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
										<Color
											key={key}
											label={key}
											value={value}
											basics={theme.basics?.colors}
											scheme={scheme}
											onChange={(newColor) => handleThemeChange(key, newColor)}
											loading={props.loading}
											disabled={unauthorized}
										/>
									</S.GridRow>
								))}
							</S.GridRows>
						</S.GridWrapper>
					</S.AttributesWrapper>

					<S.AttributesWrapper
						className={'border-wrapper-alt2'}
						style={{
							color: `rgba(${theme.basics.colors.text},1)`,
							background: `rgba(${theme.basics.colors.background},1)`,
						}}
					>
						Default Button
						<S.ButtonPreview theme={theme.buttons.default}>Preview</S.ButtonPreview>
						<S.GridWrapper id={'GridWrapper'}>
							<S.GridRows id={'GridRows'}>
								{Object.entries(theme.buttons.default.default.colors).map(([key, value]: any) => (
									<S.GridRow id={'GridRow'} key={key}>
										<span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
										<Color
											key={key}
											label={key}
											value={value}
											basics={theme.basics?.colors}
											scheme={scheme}
											onChange={(newColor) => handleThemeChange(key, newColor)}
											loading={props.loading}
											disabled={unauthorized}
										/>
									</S.GridRow>
								))}
							</S.GridRows>
						</S.GridWrapper>
					</S.AttributesWrapper>
					{/*
					
						<Toggle
							label={language?.colorScheme}
							options={[PortalSchemeType.Light, PortalSchemeType.Dark]}
							activeOption={scheme}
							handleToggle={(option: string) => handleSchemeChange(option)}
							disabled={unauthorized}
						/>
						{!props.published && (
							<S.SectionActions>
								<Button
									type={'alt3'}
									label={language?.cancel}
									handlePress={() => {
										props.onThemeCancel(props.theme);
									}}
									disabled={unauthorized}
								/>
								<Button
									type={'alt4'}
									label={language?.publishTheme}
									handlePress={() => props.onThemePublish(theme)}
									disabled={unauthorized}
								/>
							</S.SectionActions>
						)}
					</S.AttributesWrapper>
					*/}
				</S.SectionBody>
			</S.Section>
			{showNameEdit && (
				<Modal header={language?.editThemeName} handleClose={() => setShowNameEdit(false)}>
					<S.ModalWrapper>
						<FormField
							value={name}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
							invalid={{ status: false, message: null }}
							disabled={unauthorized}
							hideErrorMessage
							sm
						/>
						<S.ModalActionsWrapper>
							<Button
								type={'primary'}
								label={language?.cancel}
								handlePress={() => setShowNameEdit(false)}
								disabled={unauthorized}
							/>
							<Button
								type={'alt1'}
								label={language?.save}
								handlePress={() => handleNameChange()}
								disabled={unauthorized}
								loading={false}
							/>
						</S.ModalActionsWrapper>
					</S.ModalWrapper>
				</Modal>
			)}
			{showRemoveConfirmation && (
				<Modal header={language?.confirmDeletion} handleClose={() => setShowNameEdit(false)}>
					<S.ModalWrapper>
						<S.ModalBodyWrapper>
							<p>{language?.themeDeleteConfirmationInfo}</p>
							<S.ModalBodyElements>
								<S.ModalBodyElement>
									<span>{name}</span>
								</S.ModalBodyElement>
							</S.ModalBodyElements>
						</S.ModalBodyWrapper>
						<S.ModalActionsWrapper>
							<Button
								type={'primary'}
								label={language?.cancel}
								handlePress={() => setShowRemoveConfirmation(false)}
								disabled={false}
							/>
							<Button
								type={'primary'}
								label={language?.themeDeleteConfirmation}
								handlePress={() => {
									props.handleThemeRemove(theme);
									setShowRemoveConfirmation(false);
								}}
								disabled={unauthorized}
								loading={false}
								icon={ICONS.delete}
								iconLeftAlign
								warning
							/>
						</S.ModalActionsWrapper>
					</S.ModalWrapper>
				</Modal>
			)}
		</>
	);
}

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

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async function handleThemeUpdate(theme: PortalThemeType, publish: boolean, prevName?: string) {
		if (!theme) return;

		const allOptionNames = new Set(options?.map((t) => t.name));

		if (allOptionNames.has(theme.name)) {
			addNotification(`A theme '${theme.name}' already exists.`, 'warning');
			return;
		}

		if (prevName) {
			allOptionNames.delete(prevName);
		}

		const publishedNames = new Set(portalProvider.current?.themes.map((t) => t.name));

		if (prevName && publishedNames.has(prevName)) {
			publishedNames.delete(prevName);
			publishedNames.add(theme.name);
		} else if (publish) {
			publishedNames.add(theme.name);
		}

		const mapped =
			options?.map((existing) => {
				const matchKey = prevName ?? theme.name;
				return existing.name === matchKey ? theme : existing;
			}) || [];

		const updated = mapped.filter((t) => publishedNames.has(t.name));

		await submitUpdatedThemes(updated);
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async function handleThemePublish(theme: PortalThemeType) {
		if (!theme) return;

		const themeExists = portalProvider.current?.themes?.find(
			(existingTheme: PortalThemeType) => existingTheme.name === theme.name
		);

		if (themeExists) {
			addNotification(`A theme '${theme.name}' already exists.`, 'warning');
			return;
		}

		const updatedThemes = [...(portalProvider.current?.themes ?? []), theme];

		await submitUpdatedThemes(updatedThemes);
	}

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

				console.log(`Theme update: ${themeUpdateId}`);

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
