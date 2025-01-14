import React from 'react';
import { HexColorInput, HexColorPicker } from 'react-colorful';

import { Button } from 'components/atoms/Button';
import { Loader } from 'components/atoms/Loader';
import { Notification } from 'components/atoms/Notification';
import { DEFAULT_THEME } from 'helpers/config';
import { NotificationType, PortalThemeType } from 'helpers/types';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';
import { usePortalProvider } from 'providers/PortalProvider';

import { Modal } from '../../atoms/Modal';

import * as S from './styles';
import { IProps } from './types';

function Color(props: {
	label: string;
	value: string;
	onChange: (newColor: string) => void;
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
				<Modal header={language.colorPicker} handleClose={() => setShowSelector(false)}>
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
									label={language.close}
									handlePress={() => {
										setValue(parseRgbStringToHex(props.value));
										setShowSelector(false);
									}}
									disabled={props.loading}
								/>
								<Button
									type={'alt1'}
									label={language.save}
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
	onThemeChange: (theme: PortalThemeType) => void;
	loading: boolean;
}) {
	const { background, menus, sections, ...remainingTheme } = props.theme.colors;

	const orderedRemainingTheme = Object.keys(DEFAULT_THEME.colors)
		.filter((key) => key !== 'background') // Exclude background
		.reduce((acc, key) => {
			if (remainingTheme.hasOwnProperty(key)) {
				acc[key] = remainingTheme[key];
			}
			return acc;
		}, {} as typeof remainingTheme);

	function handleChange(key: string, newValue: string) {
		const updatedTheme = {
			...props.theme,
			colors: {
				...props.theme.colors,
				[key.toLowerCase()]: newValue,
			},
		};

		props.onThemeChange(updatedTheme);
	}

	return (
		<S.Section className={'border-wrapper-alt3'}>
			<S.SectionHeader>
				<p>{props.label}</p>
			</S.SectionHeader>
			<S.SectionBody>
				<S.BackgroundWrapper>
					<Color
						label={'Background'}
						value={background}
						onChange={(newColor) => handleChange('background', newColor)}
						loading={props.loading}
						height={115}
						maxWidth
					/>
				</S.BackgroundWrapper>
				<S.MenusWrapper>
					<Color
						label={'Menus'}
						value={menus}
						onChange={(newColor) => handleChange('menus', newColor)}
						loading={props.loading}
						height={55}
						maxWidth
					/>
				</S.MenusWrapper>
				<S.FlexWrapper>
					<S.SectionsWrapper>
						<Color
							label={'Sections'}
							value={sections}
							onChange={(newColor) => handleChange('sections', newColor)}
							loading={props.loading}
							width={130.5}
						/>
					</S.SectionsWrapper>
					<S.GridWrapper>
						{Object.entries(orderedRemainingTheme).map(([key, value]) => (
							<Color
								key={key}
								label={key}
								value={value}
								onChange={(newColor) => handleChange(key, newColor)}
								loading={props.loading}
							/>
						))}
					</S.GridWrapper>
				</S.FlexWrapper>
			</S.SectionBody>
		</S.Section>
	);
}

export default function Themes(props: IProps) {
	const arProvider = useArweaveProvider();
	const permawebProvider = usePermawebProvider();
	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [options, setOptions] = React.useState<PortalThemeType[] | null>(null);
	const [loading, setLoading] = React.useState<boolean>(false);
	const [response, setResponse] = React.useState<NotificationType | null>(null);

	React.useEffect(() => {
		if (portalProvider.current?.id) {
			if (portalProvider.current.themes) setOptions(portalProvider.current.themes);
		}
	}, [portalProvider.current]);

	const handleThemeChange = async (theme: PortalThemeType) => {
		if (theme && arProvider.wallet && portalProvider.current?.id) {
			setLoading(true);
			try {
				const updatedThemes =
					options?.map((existingTheme) => (existingTheme.name === theme.name ? theme : existingTheme)) || [];

				const themeUpdateId = await permawebProvider.libs.updateZone(
					{ Themes: permawebProvider.libs.mapToProcessCase(updatedThemes) },
					portalProvider.current.id,
					arProvider.wallet
				);

				portalProvider.refreshCurrentPortal();

				console.log(`Theme update: ${themeUpdateId}`);

				setOptions(permawebProvider.libs.mapFromProcessCase(updatedThemes));

				setResponse({ status: 'success', message: `${language.themeUpdated}!` });
			} catch (e: any) {
				setResponse({ status: 'warning', message: e.message ?? 'Error updating theme' });
			}

			setLoading(false);
		}
	};

	const getThemes = () => {
		if (!options) {
			return (
				<S.LoadingWrapper>
					<p>{`${language.gettingThemes}...`}</p>
				</S.LoadingWrapper>
			);
		} else if (options.length <= 0) {
			return (
				<S.WrapperEmpty>
					<p>{language.noThemesFound}</p>
				</S.WrapperEmpty>
			);
		}

		return (
			<>
				{options.map((theme: PortalThemeType, index: number) => {
					return (
						<Section key={index} label={theme.name} theme={theme} onThemeChange={handleThemeChange} loading={loading} />
					);
				})}
			</>
		);
	};

	return (
		<>
			<S.Wrapper>
				{!props.hideHeader && (
					<S.Header>
						<p>{language.themes}</p>
					</S.Header>
				)}
				<S.Body>{getThemes()}</S.Body>
			</S.Wrapper>
			{loading && <Loader message={`${language.updatingTheme}...`} />}
			{response && (
				<Notification type={response.status} message={response.message} callback={() => setResponse(null)} />
			)}
		</>
	);
}
