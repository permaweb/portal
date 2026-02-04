import React from 'react';

import Button from '../form/button';

import * as S from './styles';

const PRESET_AMOUNTS = ['5', '10', '15', '20', '25']; // all strings

export default function TipModal({
	isOpen,
	onClose,
	onConfirm,
}: {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: (amount: string) => void;
}) {
	const [selected, setSelected] = React.useState<string | null>(null);
	const [customAmount, setCustomAmount] = React.useState('');

	if (!isOpen) return null;

	// finalAmount is a pure string, nothing numeric
	const finalAmount = selected !== null ? selected : customAmount.trim().length > 0 ? customAmount.trim() : null;

	function handleConfirm() {
		if (!finalAmount) return;
		onConfirm(finalAmount);
	}

	return (
		<S.Overlay onClick={onClose}>
			<S.Modal onClick={(e) => e.stopPropagation()}>
				<S.CloseButton onClick={onClose}>
					<span>×</span>
				</S.CloseButton>

				<S.Header>
					<h3>Support this creator</h3>
					<p>Your contribution helps keep this portal active.</p>
				</S.Header>

				<S.SectionLabel>Choose a tip amount</S.SectionLabel>

				<S.PresetRow>
					{PRESET_AMOUNTS.map((amt) => (
						<S.PresetButton
							key={amt}
							$active={selected === amt}
							onClick={() => {
								setSelected(amt);
								setCustomAmount('');
							}}
						>
							{amt} AR
						</S.PresetButton>
					))}
				</S.PresetRow>

				<S.SectionLabel>Or enter your own</S.SectionLabel>

				<S.InputWrapper>
					<input
						type="text"
						value={customAmount}
						placeholder="Custom amount in AR"
						onChange={(e) => {
							setCustomAmount(e.target.value);
							setSelected(null);
						}}
					/>
				</S.InputWrapper>

				<S.Actions>
					<Button type="default" label="Cancel" onClick={onClose} />
					<Button type="primary" label="Tip now" onClick={handleConfirm} disabled={!finalAmount} />
				</S.Actions>
			</S.Modal>
		</S.Overlay>
	);
}
