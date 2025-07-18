import React from 'react';
import { HexColorInput, HexColorPicker } from 'react-colorful';

import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
import { FormField } from 'components/atoms/FormField';
import { IconButton } from 'components/atoms/IconButton';
import { Loader } from 'components/atoms/Loader';
import { Modal } from 'components/atoms/Modal';
import { Toggle } from 'components/atoms/Toggle';
import { ASSETS, DEFAULT_THEME } from 'helpers/config';
import { PortalSchemeType, PortalThemeType } from 'helpers/types';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { useNotifications } from 'providers/NotificationProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';

import * as S from './styles';

function Color(props: {
	label: string;
	value: string;
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

	React.useEffect(() => {
		if (props.value) {
			setValue(parseRgbStringToHex(props.value));
		}
	}, [props.value]);

	function parseRgbStringToHex(rgbString: string) {
		const [r, g, b] = (rgbString as any).split(',').map(Number);
		return rgbToHex(r, g, b);
	}

	function rgbToHex(r: string, g: string, b: string) {
		const toHex = (value: any) => value.toString(16).padStart(2, '0');
		return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
	}

	function hexToRgb(hex: string) {
		hex = hex.replace(/^#/, '');

		const r = parseInt(hex.substring(0, 2), 16);
		const g = parseInt(hex.substring(2, 4), 16);
		const b = parseInt(hex.substring(4, 6), 16);

		return `${r},${g},${b}`;
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
				/>
				<S.ColorTooltip className={'info'}>
					<span>{`${props.label} (${value})`}</span>
				</S.ColorTooltip>
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
										props.onChange(hexToRgb(value));
										setShowSelector(false);
									}}
									disabled={hexToRgb(value) === props.value || props.loading}
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
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const { background, ...remainingTheme } = props.theme.colors;

	const [theme, setTheme] = React.useState<PortalThemeType>(props.theme);
	const [name, setName] = React.useState<string>(props.theme.name ?? '-');
	const [scheme, setScheme] = React.useState<'light' | 'dark'>(props.theme.scheme);
	const [showNameEdit, setShowNameEdit] = React.useState<boolean>(false);
	const [showRemoveConfirmation, setShowRemoveConfirmation] = React.useState<boolean>(false);

	React.useEffect(() => {
		setTheme(props.theme);
		setName(props.theme.name);
		setScheme(props.theme.scheme);
	}, [props.theme]);

	const unauthorized = !portalProvider.permissions?.updatePortalMeta;

	const orderedRemainingTheme = Object.keys(DEFAULT_THEME.light.colors)
		.filter((key) => key !== 'background')
		.reduce((acc, key) => {
			if (remainingTheme.hasOwnProperty(key)) {
				acc[key] = remainingTheme[key];
			}
			return acc;
		}, {} as typeof remainingTheme);

	function handleThemeChange(key: string, newValue: string) {
		const updatedTheme = {
			...theme,
			colors: {
				...theme.colors,
				[key.toLowerCase()]: newValue,
			},
		};

		setTheme(updatedTheme);
		if (props.published) props.onThemeChange(updatedTheme, false);
	}

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
			<S.Section>
				<S.SectionHeader>
					<p>{name}</p>
					<S.SectionHeaderActions>
						<IconButton
							type={'alt1'}
							active={false}
							src={ASSETS.write}
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
							src={ASSETS.delete}
							handlePress={() => setShowRemoveConfirmation(true)}
							disabled={unauthorized || props.removeDisabled}
							dimensions={{ wrapper: 23.5, icon: 13.5 }}
							tooltip={language?.remove}
							tooltipPosition={'bottom-right'}
							noFocus
						/>
					</S.SectionHeaderActions>
				</S.SectionHeader>
				<S.SectionBody>
					<S.FlexWrapper>
						<S.SectionsWrapper>
							<Color
								label={language?.background}
								value={background}
								onChange={(newColor) => handleThemeChange('background', newColor)}
								loading={props.loading}
								width={130.5}
								disabled={unauthorized}
							/>
						</S.SectionsWrapper>
						<S.GridWrapper>
							{Object.entries(orderedRemainingTheme).map(([key, value]) => (
								<Color
									key={key}
									label={key}
									value={value}
									onChange={(newColor) => handleThemeChange(key, newColor)}
									loading={props.loading}
									disabled={unauthorized}
								/>
							))}
						</S.GridWrapper>
					</S.FlexWrapper>
					<S.AttributesWrapper>
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
				</S.SectionBody>
			</S.Section>
			{showNameEdit && (
				<Modal header={language?.editThemeName} handleClose={() => setShowNameEdit(false)}>
					<S.ModalWrapper>
						<FormField
							value={name}
							onChange={(e: any) => setName(e.target.value)}
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
								icon={ASSETS.delete}
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
			if (portalProvider.current.themes) setOptions(portalProvider.current.themes);
		}
	}, [portalProvider.current]);

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

				portalProvider.refreshCurrentPortal();

				console.log(`Theme update: ${themeUpdateId}`);

				setOptions(permawebProvider.libs.mapFromProcessCase(themes));

				addNotification(`${language?.themesUpdated}!`, 'success');
			} catch (e: any) {
				addNotification(e.message ?? 'Error updating theme', 'warning');
			}

			setLoading(false);
		}
	}

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

		const sortedOptions = [...options].sort((a, b) => {
			if (a.scheme === 'light' && b.scheme === 'dark') return -1;
			if (a.scheme === 'dark' && b.scheme === 'light') return 1;
			return 0;
		});

		return (
			<>
				{sortedOptions.map((theme: PortalThemeType) => {
					const isPublished =
						loading || portalProvider.updating
							? true
							: portalProvider.current?.themes.find(
									(existingTheme: PortalThemeType) => existingTheme.name === theme.name
							  ) !== undefined;
					return (
						<Section
							key={theme.name}
							label={theme.name}
							theme={theme}
							onThemeChange={(theme: PortalThemeType, publish: boolean, prevName?: string) =>
								handleThemeUpdate(theme, publish, prevName)
							}
							onThemePublish={(theme: PortalThemeType) => handleThemePublish(theme)}
							onThemeCancel={(theme: PortalThemeType) => handleCancelTheme(theme)}
							handleThemeRemove={(theme: PortalThemeType) => handleRemoveTheme(theme)}
							removeDisabled={portalProvider.current?.themes?.length === 1}
							published={isPublished}
							loading={loading}
						/>
					);
				})}
			</>
		);
	};

	return (
		<>
			<S.Wrapper>
				<S.Body>{getThemes()}</S.Body>
				<S.EndActions>
					<Button
						type={'primary'}
						label={language?.addTheme}
						handlePress={handleAddTheme}
						disabled={unauthorized}
						icon={ASSETS.add}
						iconLeftAlign
					/>
				</S.EndActions>
			</S.Wrapper>
			{loading && <Loader message={`${language?.updatingTheme}...`} />}
		</>
	);
}
