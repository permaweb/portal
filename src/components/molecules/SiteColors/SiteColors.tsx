import React from 'react';
import { HexColorInput, HexColorPicker } from 'react-colorful';

import { Button } from 'components/atoms/Button';

import { Modal } from '../Modal';

import * as S from './styles';

function Color(props: {
	label: string;
	value: string;
	onChange: (newColor: string) => void;
	height?: number;
	width?: number;
	maxWidth?: boolean;
}) {
	const [showSelector, setShowSelector] = React.useState<boolean>(false);

	return (
		<>
			<S.ColorWrapper>
				<S.ColorBody
					onClick={() => setShowSelector(true)}
					background={props.value}
					height={props.height}
					width={props.width}
					maxWidth={props.maxWidth}
				/>
				<S.ColorTooltip className={'info'}>
					<span>{props.label}</span>
				</S.ColorTooltip>
			</S.ColorWrapper>
			{showSelector && (
				<Modal header={'Color picker'} handleClose={() => setShowSelector(false)}>
					<S.SelectorWrapper>
						<S.SelectorHeader>
							<p>{props.label}</p>
						</S.SelectorHeader>
						<S.SelectorFlexWrapper>
							<S.SelectorPreview background={props.value} />
							<HexColorPicker color={props.value} onChange={props.onChange} />
						</S.SelectorFlexWrapper>
						<S.SelectorActions>
							<HexColorInput color={props.value} onChange={props.onChange} />
							<Button type={'primary'} label={'Save'} handlePress={() => setShowSelector(false)} />
						</S.SelectorActions>
					</S.SelectorWrapper>
				</Modal>
			)}
		</>
	);
}

function Section(props: {
	label: string;
	theme: Record<string, string>;
	onThemeChange: (key: string, value: string) => void;
}) {
	const { Background, ...remainingTheme } = props.theme;

	return (
		<S.Section>
			<S.SectionHeader>
				<p>{props.label}</p>
			</S.SectionHeader>
			<S.SectionBody>
				<S.BackgroundWrapper>
					<Color
						label={'Background'}
						value={Background}
						onChange={(newColor) => props.onThemeChange('Background', newColor)}
						height={115}
						maxWidth
					/>
				</S.BackgroundWrapper>
				<S.GridWrapper>
					{Object.entries(remainingTheme).map(([key, value]) => (
						<Color key={key} label={key} value={value} onChange={(newColor) => props.onThemeChange(key, newColor)} />
					))}
				</S.GridWrapper>
			</S.SectionBody>
		</S.Section>
	);
}

export default function SiteColors() {
	const [defaultTheme, setDefaultTheme] = React.useState({
		Background: '#C9F9FF',
		Primary: '#5DFDCB',
		Secondary: '#BFD0E0',
		Links: '#90D7FF',
		Menus: '#B8B3BE',
		Cards: '#BFD0E0',
	});

	const handleThemeChange = (key: string, value: string) => {
		setDefaultTheme((prev) => ({
			...prev,
			[key]: value,
		}));
	};

	return (
		<S.Wrapper className={'border-wrapper-alt2'}>
			<S.Header>
				<p>Colors</p>
			</S.Header>
			<S.Body>
				<Section label={'Default Theme'} theme={defaultTheme} onThemeChange={handleThemeChange} />
			</S.Body>
		</S.Wrapper>
	);
}
