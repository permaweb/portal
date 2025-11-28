import React from 'react';

import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
import { FormField } from 'components/atoms/FormField';
import { Select } from 'components/atoms/Select';
import { PageBlockType, SelectOptionType } from 'helpers/types';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';

type MonetizationButtonBlockData = {
	label?: string;
	variant?: 'primary' | 'alt1' | 'alt2';
};

const BUTTON_STYLE_OPTIONS: SelectOptionType[] = [
	{ id: 'primary', label: 'Primary' },
	{ id: 'alt1', label: 'Alt 1' },
	{ id: 'alt2', label: 'Alt 2' },
];

export default function MonetizationBlock(props: {
	index: number;
	block: PageBlockType;
	onChangeBlock: (block: PageBlockType, index: number) => void;
}) {
	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const monetization: any = portalProvider.current?.monetization?.monetization;

	const data: MonetizationButtonBlockData = React.useMemo(() => {
		const raw = (props.block?.data as MonetizationButtonBlockData) ?? {};
		return {
			label: raw.label ?? '',
			variant: raw.variant ?? 'primary',
		};
	}, [props.block?.data]);

	const label = data.label || language?.defaultMonetizationLabel || 'Support this portal';
	const variant = data.variant || 'primary';

	function updateData(next: MonetizationButtonBlockData) {
		props.onChangeBlock(
			{
				...props.block,
				// We no longer store any HTML here – engine will render this block
				// based only on `type === 'monetizationButton'` and `block.data`.
				data: next,
				content: null,
			},
			props.index
		);
	}

	function handleLabelChange(event: React.ChangeEvent<HTMLInputElement>) {
		updateData({
			...data,
			label: event.target.value,
		});
	}

	function handleVariantChange(nextId: string) {
		updateData({
			...data,
			variant: nextId as MonetizationButtonBlockData['variant'],
		});
	}

	// UX messages depending on global config
	if (!monetization?.enabled) {
		return (
			<S.Wrapper className={'border-wrapper-alt2'}>
				<S.Header>
					<S.Title>{language?.monetizationButton ?? 'Monetization button'}</S.Title>
				</S.Header>
				<S.InfoMessage className={'warning'}>
					<span>
						{language?.monetizationDisabledMessage ??
							'Monetization is disabled in portal settings. Enable it in the Setup tab to use this block.'}
					</span>
				</S.InfoMessage>
			</S.Wrapper>
		);
	}

	if (!monetization?.walletAddress) {
		return (
			<S.Wrapper className={'border-wrapper-alt2'}>
				<S.Header>
					<S.Title>{language?.monetizationButton ?? 'Monetization button'}</S.Title>
				</S.Header>
				<S.InfoMessage className={'warning'}>
					<span>
						{language?.monetizationNoWalletMessage ??
							'No payout wallet is configured. Add a wallet address in Setup → Monetization to use this block.'}
					</span>
				</S.InfoMessage>
			</S.Wrapper>
		);
	}

	return (
		<S.Wrapper className={'border-wrapper-alt2'}>
			<S.Header>
				<S.Title>{language?.monetizationButton ?? 'Monetization button'}</S.Title>
			</S.Header>
			<S.Body>
				<S.Row>
					<S.FieldColumn>
						<FormField
							label={language?.buttonLabel ?? 'Button label'}
							value={data.label ?? ''}
							onChange={handleLabelChange}
							invalid={{ status: false, message: null }}
							disabled={false}
							hideErrorMessage
							sm
						/>
					</S.FieldColumn>
				</S.Row>

				<S.Row>
					<S.FieldColumn>
						<S.LabelRow>
							<span>{language?.buttonStyle ?? 'Button style'}</span>
						</S.LabelRow>

						<Select
							activeOption={BUTTON_STYLE_OPTIONS.find((o) => o.id === variant) ?? BUTTON_STYLE_OPTIONS[0]}
							setActiveOption={(opt) => handleVariantChange(opt.id)}
							options={BUTTON_STYLE_OPTIONS}
							disabled={false}
						/>
					</S.FieldColumn>
				</S.Row>

				<S.Row>
					<S.FieldColumn>
						<S.LabelRow>
							<span>{language?.preview ?? 'Preview'}</span>
						</S.LabelRow>
						<Button type={variant} label={label} handlePress={() => {}} disabled={true} />
					</S.FieldColumn>
				</S.Row>
			</S.Body>
		</S.Wrapper>
	);
}
