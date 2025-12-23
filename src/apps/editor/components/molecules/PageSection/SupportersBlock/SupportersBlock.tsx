import React from 'react';

import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Checkbox } from 'components/atoms/Checkbox';
import { FormField } from 'components/atoms/FormField';
import { Select } from 'components/atoms/Select';
import {
	PageBlockType,
	SelectOptionType,
	SupporterColumnConfig,
	SupportersBlockData,
	SupportersFormattingConfig,
	SupportersModuleConfig,
	SupportersRecentConfig,
	SupportersTopConfig,
} from 'helpers/types';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';

const SORT_OPTIONS: SelectOptionType[] = [
	{ id: 'amount_desc', label: 'Amount (High to Low)' },
	{ id: 'amount_asc', label: 'Amount (Low to High)' },
	{ id: 'time_desc', label: 'Most Recent' },
];

const DEFAULT_CONFIG: SupportersBlockData = {
	id: '',
	scope: 'global',
	modules: {
		showTop: true,
		showRecent: false,
		showFullList: false,
	},
	top: {
		count: 10,
		sort: 'amount_desc',
		columns: {
			avatar: true,
			name: true,
			amount: true,
			time: false,
			usdApprox: false,
		},
	},
	recent: {
		count: 10,
		columns: {
			avatar: true,
			name: true,
			amount: true,
			time: true,
			usdApprox: false,
		},
	},
	formatting: {
		amountDecimals: 4,
		title: 'Supporters',
		showUsdApprox: false,
	},
};

export default function SupportersBlock(props: {
	index: number;
	block: PageBlockType;
	onChangeBlock: (block: PageBlockType, index: number) => void;
}) {
	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const monetization: any = portalProvider.current?.monetization.monetization;

	const config = React.useMemo(() => {
		const raw = (props.block.data as SupportersBlockData | null) ?? ({} as SupportersBlockData);
		return {
			...DEFAULT_CONFIG,
			...raw,
			scope: 'global', // Pages are always global
			modules: { ...DEFAULT_CONFIG.modules, ...raw.modules },
			top: { ...DEFAULT_CONFIG.top, ...raw.top, columns: { ...DEFAULT_CONFIG.top.columns, ...raw.top?.columns } },
			recent: {
				...DEFAULT_CONFIG.recent,
				...raw.recent,
				columns: { ...DEFAULT_CONFIG.recent.columns, ...raw.recent?.columns },
			},
			formatting: { ...DEFAULT_CONFIG.formatting, ...raw.formatting },
		};
	}, [props.block.data]);

	React.useEffect(() => {
		if (JSON.stringify(props.block.data) !== JSON.stringify(config)) {
			props.onChangeBlock(
				{
					...props.block,
					data: config,
				},
				props.index
			);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [config]);

	function updateConfig(updates: Partial<SupportersBlockData>) {
		const newConfig = { ...config, ...updates };
		props.onChangeBlock(
			{
				...props.block,
				data: newConfig,
			},
			props.index
		);
	}

	function updateModules(updates: Partial<SupportersModuleConfig>) {
		updateConfig({
			modules: { ...config.modules, ...updates },
		});
	}

	function updateTop(updates: Partial<SupportersTopConfig>) {
		updateConfig({
			top: { ...config.top, ...updates },
		});
	}

	function updateTopColumns(updates: Partial<SupporterColumnConfig>) {
		updateTop({
			columns: { ...config.top.columns, ...updates },
		});
	}

	function updateRecent(updates: Partial<SupportersRecentConfig>) {
		updateConfig({
			recent: { ...config.recent, ...updates },
		});
	}

	function updateRecentColumns(updates: Partial<SupporterColumnConfig>) {
		updateRecent({
			columns: { ...config.recent.columns, ...updates },
		});
	}

	function updateFormatting(updates: Partial<SupportersFormattingConfig>) {
		updateConfig({
			formatting: { ...config.formatting, ...updates },
		});
	}

	if (!monetization?.enabled) {
		return (
			<S.Wrapper>
				<S.InfoMessage className={'warning'}>
					<span>
						{language?.monetizationDisabledMessage ??
							'Monetization is disabled in portal settings. Enable it through Monetization tab to use this block.'}
					</span>
				</S.InfoMessage>
			</S.Wrapper>
		);
	}

	if (!monetization?.walletAddress) {
		return (
			<S.Wrapper>
				<S.InfoMessage className={'warning'}>
					<span>
						{language?.monetizationNoWalletMessage ??
							'No payout wallet is configured, so monetization cannot be used. Please set up a wallet in the Monetization tab to use this block.'}
					</span>
				</S.InfoMessage>
			</S.Wrapper>
		);
	}

	return (
		<S.Wrapper>
			<S.Body>
				{/* Module Selection */}
				<S.Section>
					<S.SectionTitle>{language?.modules ?? 'Modules'}</S.SectionTitle>
					<S.CheckboxGroup>
						<S.CheckboxContainer onClick={() => updateModules({ showTop: !config.modules.showTop })}>
							<Checkbox
								checked={config.modules.showTop}
								handleSelect={() => updateModules({ showTop: !config.modules.showTop })}
								disabled={false}
							/>
							<span>{language?.topSupporters ?? 'Top Supporters'}</span>
						</S.CheckboxContainer>
						<S.CheckboxContainer onClick={() => updateModules({ showRecent: !config.modules.showRecent })}>
							<Checkbox
								checked={config.modules.showRecent}
								handleSelect={() => updateModules({ showRecent: !config.modules.showRecent })}
								disabled={false}
							/>
							<span>{language?.recentSupporters ?? 'Recent Supporters'}</span>
						</S.CheckboxContainer>
					</S.CheckboxGroup>
				</S.Section>

				{/* Top Supporters Configuration */}
				{config.modules.showTop && (
					<S.Section>
						<S.SectionTitle>{language?.topSupporters ?? 'Top Supporters'}</S.SectionTitle>
						<S.Row>
							<S.FieldColumn>
								<FormField
									label={language?.count ?? 'Count'}
									value={String(config.top.count)}
									onChange={(e) => updateTop({ count: parseInt(e.target.value) || 10 })}
									type={'number'}
									invalid={{ status: false, message: null }}
									disabled={false}
									hideErrorMessage
									sm
								/>
							</S.FieldColumn>

							<S.FieldColumn>
								<S.LabelRow>
									<span>{language?.sortBy ?? 'Sort By'}</span>
								</S.LabelRow>
								<Select
									activeOption={SORT_OPTIONS.find((o) => o.id === config.top.sort) ?? SORT_OPTIONS[0]}
									setActiveOption={(opt) => updateTop({ sort: opt.id as any })}
									options={SORT_OPTIONS}
									disabled={false}
								/>
							</S.FieldColumn>
						</S.Row>

						<S.ColumnsWrapper>
							<S.LabelRow>
								<span>{language?.showColumns ?? 'Show Columns'}</span>
							</S.LabelRow>
							<S.CheckboxGroup>
								<S.CheckboxContainer onClick={() => updateTopColumns({ avatar: !config.top.columns.avatar })}>
									<Checkbox
										checked={config.top.columns.avatar}
										handleSelect={() => updateTopColumns({ avatar: !config.top.columns.avatar })}
										disabled={false}
									/>
									<span>{language?.avatar ?? 'Avatar'}</span>
								</S.CheckboxContainer>
								<S.CheckboxContainer onClick={() => updateTopColumns({ name: !config.top.columns.name })}>
									<Checkbox
										checked={config.top.columns.name}
										handleSelect={() => updateTopColumns({ name: !config.top.columns.name })}
										disabled={false}
									/>
									<span>{language?.displayName ?? 'Name'}</span>
								</S.CheckboxContainer>
								<S.CheckboxContainer onClick={() => updateTopColumns({ amount: !config.top.columns.amount })}>
									<Checkbox
										checked={config.top.columns.amount}
										handleSelect={() => updateTopColumns({ amount: !config.top.columns.amount })}
										disabled={false}
									/>
									<span>{language?.amount ?? 'Amount'}</span>
								</S.CheckboxContainer>
								<S.CheckboxContainer onClick={() => updateTopColumns({ time: !config.top.columns.time })}>
									<Checkbox
										checked={config.top.columns.time}
										handleSelect={() => updateTopColumns({ time: !config.top.columns.time })}
										disabled={false}
									/>
									<span>{language?.time ?? 'Time'}</span>
								</S.CheckboxContainer>
								<S.CheckboxContainer onClick={() => updateTopColumns({ usdApprox: !config.top.columns.usdApprox })}>
									<Checkbox
										checked={config.top.columns.usdApprox}
										handleSelect={() => updateTopColumns({ usdApprox: !config.top.columns.usdApprox })}
										disabled={false}
									/>
									<span>{language?.usdApproximate ?? 'USD Approx'}</span>
								</S.CheckboxContainer>
							</S.CheckboxGroup>
						</S.ColumnsWrapper>
					</S.Section>
				)}

				{/* Recent Supporters Configuration */}
				{config.modules.showRecent && (
					<S.Section>
						<S.SectionTitle>{language?.recentSupporters ?? 'Recent Supporters'}</S.SectionTitle>
						<S.Row>
							<S.FieldColumn>
								<FormField
									label={language?.count ?? 'Count'}
									value={String(config.recent.count)}
									onChange={(e) => updateRecent({ count: parseInt(e.target.value) || 10 })}
									type={'number'}
									invalid={{ status: false, message: null }}
									disabled={false}
									hideErrorMessage
									sm
								/>
							</S.FieldColumn>
						</S.Row>

						<S.ColumnsWrapper>
							<S.LabelRow>
								<span>{language?.showColumns ?? 'Show Columns'}</span>
							</S.LabelRow>
							<S.CheckboxGroup>
								<S.CheckboxContainer onClick={() => updateRecentColumns({ avatar: !config.recent.columns.avatar })}>
									<Checkbox
										checked={config.recent.columns.avatar}
										handleSelect={() => updateRecentColumns({ avatar: !config.recent.columns.avatar })}
										disabled={false}
									/>
									<span>{language?.avatar ?? 'Avatar'}</span>
								</S.CheckboxContainer>
								<S.CheckboxContainer onClick={() => updateRecentColumns({ name: !config.recent.columns.name })}>
									<Checkbox
										checked={config.recent.columns.name}
										handleSelect={() => updateRecentColumns({ name: !config.recent.columns.name })}
										disabled={false}
									/>
									<span>{language?.displayName ?? 'Name'}</span>
								</S.CheckboxContainer>
								<S.CheckboxContainer onClick={() => updateRecentColumns({ amount: !config.recent.columns.amount })}>
									<Checkbox
										checked={config.recent.columns.amount}
										handleSelect={() => updateRecentColumns({ amount: !config.recent.columns.amount })}
										disabled={false}
									/>
									<span>{language?.amount ?? 'Amount'}</span>
								</S.CheckboxContainer>
								<S.CheckboxContainer onClick={() => updateRecentColumns({ time: !config.recent.columns.time })}>
									<Checkbox
										checked={config.recent.columns.time}
										handleSelect={() => updateRecentColumns({ time: !config.recent.columns.time })}
										disabled={false}
									/>
									<span>{language?.time ?? 'Time'}</span>
								</S.CheckboxContainer>
								<S.CheckboxContainer
									onClick={() => updateRecentColumns({ usdApprox: !config.recent.columns.usdApprox })}
								>
									<Checkbox
										checked={config.recent.columns.usdApprox}
										handleSelect={() => updateRecentColumns({ usdApprox: !config.recent.columns.usdApprox })}
										disabled={false}
									/>
									<span>{language?.usdApproximate ?? 'USD Approx'}</span>
								</S.CheckboxContainer>
							</S.CheckboxGroup>
						</S.ColumnsWrapper>
					</S.Section>
				)}

				{/* Formatting Options */}
				<S.Section>
					<S.SectionTitle>{language?.formatting ?? 'Formatting'}</S.SectionTitle>
					<S.Row>
						<S.FieldColumn>
							<FormField
								label={language?.title ?? 'Title'}
								value={config.formatting.title || ''}
								onChange={(e) => updateFormatting({ title: e.target.value })}
								invalid={{ status: false, message: null }}
								disabled={false}
								hideErrorMessage
								sm
							/>
						</S.FieldColumn>

						<S.FieldColumn>
							<FormField
								label={language?.amountDecimals ?? 'Amount Decimals'}
								value={String(config.formatting.amountDecimals)}
								onChange={(e) => updateFormatting({ amountDecimals: parseInt(e.target.value) || 4 })}
								type={'number'}
								invalid={{ status: false, message: null }}
								disabled={false}
								hideErrorMessage
								sm
							/>
						</S.FieldColumn>
					</S.Row>
				</S.Section>
			</S.Body>
		</S.Wrapper>
	);
}
