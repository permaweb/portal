import React from 'react';

import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
import { FormField } from 'components/atoms/FormField';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';

type TipsButtonBlockData = {
	label?: string;
	variant?: 'primary' | 'alt1' | 'alt2';
};

export default function PostTipsBlock(props: {
	index: number;
	block: any;
	onChangeBlock: (block: any, index: number) => void;
}) {
	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const monetization: any = portalProvider.current?.monetization?.monetization;

	const data: TipsButtonBlockData = React.useMemo(() => {
		const raw = (props.block.data as TipsButtonBlockData) ?? {};
		return {
			label: raw.label ?? '',
			variant: raw.variant ?? 'primary',
		};
	}, [props.block.data]);

	const label = data.label || language.defaultTipsLabel || 'Support this post';
	const variant = data.variant || 'primary';

	function updateData(next: TipsButtonBlockData) {
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

	// If monetization disabled in settings → block disabled
	if (!monetization?.enabled) {
		return (
			<S.Wrapper className="border-wrapper-alt2">
				<S.Header>
					<S.Title>{language.monetizationButton}</S.Title>
				</S.Header>
				<S.InfoMessage className="warning">
					<span>{language.monetizationDisabledMessage}</span>
				</S.InfoMessage>
			</S.Wrapper>
		);
	}

	// If no wallet → also block disabled
	if (!monetization?.walletAddress) {
		return (
			<S.Wrapper className="border-wrapper-alt2">
				<S.Header>
					<S.Title>{language.monetizationButton}</S.Title>
				</S.Header>
				<S.InfoMessage className="warning">
					<span>{language.monetizationNoWalletMessage}</span>
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
							label={language.buttonLabel}
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
						<S.LabelRow>
							<span>{language.preview}</span>
						</S.LabelRow>
						<S.PreviewWrapper>
							<Button type="primary" label={label} handlePress={() => {}} disabled />
						</S.PreviewWrapper>
					</S.FieldColumn>
				</S.Row>
			</S.Body>
		</S.Wrapper>
	);
}
