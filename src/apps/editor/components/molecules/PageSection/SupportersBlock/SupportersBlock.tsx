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

	const monetization: any = portalProvider.current?.monetization;

	const config = React.useMemo(() => {
		const raw = (props.block.data as SupportersBlockData) ?? {};
		return {
			...DEFAULT_CONFIG,
			...raw,
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
			<S.Wrapper className={'border-wrapper-alt2'}>
				<S.Header>
					<S.Title>{language?.supporters ?? 'Supporters'}</S.Title>
				</S.Header>
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
			<S.Wrapper className={'border-wrapper-alt2'}>
				<S.Header>
					<S.Title>{language?.supporters ?? 'Supporters'}</S.Title>
				</S.Header>
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
		<S.Wrapper className={'border-wrapper-alt2'}>
			<S.Header>
				<S.Title>{language?.supporters ?? 'Supporters'}</S.Title>
			</S.Header>

			<S.Body>
				{/* Module Selection */}
				<S.Section>
					<S.SectionTitle>{language?.modules ?? 'Modules'}</S.SectionTitle>
					<S.CheckboxGroup>
						<Checkbox
							checked={config.modules.showTop}
							onChange={(value: boolean) => updateModules({ showTop: value })}
							label={language?.topSupporters ?? 'Top Supporters'}
						/>
						<Checkbox
							checked={config.modules.showRecent}
							onChange={(value: boolean) => updateModules({ showRecent: value })}
							label={language?.recentSupporters ?? 'Recent Supporters'}
						/>
					</S.CheckboxGroup>
				</S.Section>

				{/* Top Supporters Configuration */}
				{config.modules.showTop && (
					<S.Section>
						<S.SectionTitle>{language?.topSupportersConfig ?? 'Top Supporters Configuration'}</S.SectionTitle>

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
								<Checkbox
									checked={config.top.columns.avatar}
									onChange={(value: boolean) => updateTopColumns({ avatar: value })}
									label={language?.avatar ?? 'Avatar'}
								/>
								<Checkbox
									checked={config.top.columns.name}
									onChange={(value: boolean) => updateTopColumns({ name: value })}
									label={language?.displayName ?? 'Name'}
								/>
								<Checkbox
									checked={config.top.columns.amount}
									onChange={(value: boolean) => updateTopColumns({ amount: value })}
									label={language?.amount ?? 'Amount'}
								/>
								<Checkbox
									checked={config.top.columns.time}
									onChange={(value: boolean) => updateTopColumns({ time: value })}
									label={language?.time ?? 'Time'}
								/>
								<Checkbox
									checked={config.top.columns.usdApprox}
									onChange={(value: boolean) => updateTopColumns({ usdApprox: value })}
									label={language?.usdApproximate ?? 'USD Approx'}
								/>
							</S.CheckboxGroup>
						</S.ColumnsWrapper>
					</S.Section>
				)}

				{/* Recent Supporters Configuration */}
				{config.modules.showRecent && (
					<S.Section>
						<S.SectionTitle>{language?.recentSupportersConfig ?? 'Recent Supporters Configuration'}</S.SectionTitle>

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
								<Checkbox
									checked={config.recent.columns.avatar}
									onChange={(value: boolean) => updateRecentColumns({ avatar: value })}
									label={language?.avatar ?? 'Avatar'}
								/>
								<Checkbox
									checked={config.recent.columns.name}
									onChange={(value: boolean) => updateRecentColumns({ name: value })}
									label={language?.displayName ?? 'Name'}
								/>
								<Checkbox
									checked={config.recent.columns.amount}
									onChange={(value: boolean) => updateRecentColumns({ amount: value })}
									label={language?.amount ?? 'Amount'}
								/>
								<Checkbox
									checked={config.recent.columns.time}
									onChange={(value: boolean) => updateRecentColumns({ time: value })}
									label={language?.time ?? 'Time'}
								/>
								<Checkbox
									checked={config.recent.columns.usdApprox}
									onChange={(value: boolean) => updateRecentColumns({ usdApprox: value })}
									label={language?.usdApproximate ?? 'USD Approx'}
								/>
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
