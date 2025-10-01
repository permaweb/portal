import React from 'react';
import * as S from './styles';
import { useUndernamesProvider } from 'providers/UndernameProvider';
import { Button } from 'components/atoms/Button';
import { Panel } from 'components/atoms/Panel';

function validateAddress(addr: string): string | null {
	const a = (addr || '').trim();
	if (!a) return 'Address is required';
	if (!/^[A-Za-z0-9_-]{43}$/.test(a)) return 'Invalid address format';
	return null;
}

export default function AddController() {
	const { addController } = useUndernamesProvider();
	const hasSubmittedRef = React.useRef(false);

	const [open, setOpen] = React.useState(false);
	const [addr, setAddr] = React.useState('');
	const [error, setError] = React.useState<string | null>(null);
	const [isLoading, setIsLoading] = React.useState(false);

	const handleChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const next = e.target.value;
		setAddr(next);
		setError(validateAddress(next));
	}, []);

	const handleSubmit = React.useCallback(async () => {
		const err = validateAddress(addr);
		setError(err);
		if (err) return;

		setIsLoading(true);
		try {
			await addController(addr.trim());
			hasSubmittedRef.current = true;
			setAddr('');
			setError(null);
		} finally {
			setIsLoading(false);
		}
	}, [addr]);

	const handleKeyDown = React.useCallback(
		(e: React.KeyboardEvent<HTMLInputElement>) => {
			if (e.key === 'Enter' && !error && !isLoading) {
				handleSubmit();
			}
		},
		[error, isLoading, handleSubmit]
	);
	return (
		<>
			<Button type={'alt1'} label={'Add Admin'} handlePress={() => setOpen(true)} />
			<Panel
				open={open}
				width={560}
				header={'Add Admin Address'}
				handleClose={() => {
					setOpen(false);
					setError(null);
				}}
				closeHandlerDisabled
			>
				<S.Card>
					<S.Row>
						<S.Input
							placeholder="Enter admin address"
							value={addr}
							onChange={handleChange}
							onKeyDown={handleKeyDown}
							aria-invalid={!!error}
						/>
						<Button
							type="primary"
							handlePress={handleSubmit}
							disabled={!!error || isLoading || !addr.trim()}
							data-loading={isLoading ? 'true' : 'false'}
							label={isLoading ? 'Adding…' : 'Add'}
						/>
					</S.Row>
					{error ? <S.Error>{error}</S.Error> : <S.Helper>Paste a valid address and press Add.</S.Helper>}
				</S.Card>
			</Panel>
		</>
	);
}
