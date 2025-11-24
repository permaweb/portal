import React from 'react';

import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
import { FormField } from 'components/atoms/FormField';
import { Select } from 'components/atoms/Select';
import { SelectOptionType } from 'helpers/types';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';

type MonetizationButtonBlockData = {
	label?: string;
	amount?: string;
	variant?: 'primary' | 'alt1' | 'alt2';
};

const BUTTON_STYLE_OPTIONS: SelectOptionType[] = [
	{ id: 'primary', label: 'Primary' },
	{ id: 'alt1', label: 'Alt 1' },
	{ id: 'alt2', label: 'Alt 2' },
];

export default function PostMonetizationBlock(props: {
	index: number;
	block: any;
	onChangeBlock: (block: any, index: number) => void;
}) {
	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	// v1: portal meta
	const monetization: any = portalProvider.current?.monetization.monetization;

	const data: MonetizationButtonBlockData = React.useMemo(() => {
		const raw = (props.block.data as MonetizationButtonBlockData) ?? {};
		return {
			label: raw.label ?? '',
			amount: raw.amount ?? '',
			variant: raw.variant ?? 'primary',
		};
	}, [props.block.data]);

	const label = data.label || language?.defaultMonetizationLabel || 'Support this post';
	const amount = data.amount || '';
	const variant = data.variant || 'primary';

	function updateData(next: MonetizationButtonBlockData) {
		props.onChangeBlock(
			{
				...props.block,
				data: next,
				content: null, // engine renders from data, not HTML
			},
			props.index
		);
	}

	function handleLabelChange(e: React.ChangeEvent<HTMLInputElement>) {
		updateData({ ...data, label: e.target.value });
	}

	function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
		updateData({ ...data, amount: e.target.value });
	}

	function handleVariantSelect(nextId: string) {
		updateData({ ...data, variant: nextId as MonetizationButtonBlockData['variant'] });
	}

	// If monetization disabled in settings → block disabled
	if (!monetization?.enabled) {
		return (
			<S.Wrapper className="border-wrapper-alt2">
				<S.Header>
					<S.Title>{language?.monetizationButton ?? 'Monetization button'}</S.Title>
				</S.Header>
				<S.InfoMessage className="warning">
					<span>
						{language?.monetizationDisabledMessage ??
							'Monetization is disabled in portal settings. Enable it in Setup → Monetization to use this block.'}
					</span>
				</S.InfoMessage>
			</S.Wrapper>
		);
	}

	// If no wallet → also block disabled
	if (!monetization?.walletAddress) {
		return (
			<S.Wrapper className="border-wrapper-alt2">
				<S.Header>
					<S.Title>{language?.monetizationButton ?? 'Monetization button'}</S.Title>
				</S.Header>
				<S.InfoMessage className="warning">
					<span>
						{language?.monetizationNoWalletMessage ??
							'No payout wallet is configured. Add a wallet in Setup → Monetization.'}
					</span>
				</S.InfoMessage>
			</S.Wrapper>
		);
	}

	return (
		<S.Wrapper className="border-wrapper-alt2">
			<S.Body>
				<S.Row>
					<S.FieldColumn>
						<FormField
							label={language?.buttonLabel ?? 'Button label'}
							value={data.label ?? ''}
							onChange={handleLabelChange}
							invalid={{ status: false, message: null }}
							hideErrorMessage
							disabled={false}
							sm
						/>
					</S.FieldColumn>
				</S.Row>

				<S.Row>
					<S.FieldColumn>
						<FormField
							label={language?.amountInAr ?? 'Amount (AR, optional)'}
							value={data.amount ?? ''}
							onChange={handleAmountChange}
							invalid={{ status: false, message: null }}
							hideErrorMessage
							disabled={false}
							sm
						/>
					</S.FieldColumn>

					<S.FieldColumn>
						<S.LabelRow>
							<span>{language?.buttonStyle ?? 'Button style'}</span>
						</S.LabelRow>

						<Select
							activeOption={BUTTON_STYLE_OPTIONS.find((o) => o.id === variant) ?? BUTTON_STYLE_OPTIONS[0]}
							setActiveOption={(opt) => handleVariantSelect(opt.id)}
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
						<Button type={variant} label={label} handlePress={() => {}} disabled />
					</S.FieldColumn>
				</S.Row>
			</S.Body>
		</S.Wrapper>
	);
}
