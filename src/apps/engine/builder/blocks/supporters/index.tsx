import React from 'react';
import { useSupporters } from 'engine/hooks/useSupporters';
import { usePortalProvider } from 'engine/providers/portalProvider';

import { SupportersBlockData } from 'helpers/types';

import FullSupportersList from './FullSupportersList';
import { generateMockSupporters } from './mockData';
import RecentSupporters from './RecentSupporters';
import * as S from './styles';
import TopSupporters from './TopSupporters';

type SupportersProps = {
	element: any;
	preview: boolean;
	location?: 'page' | 'post';
	postId?: string;
};

type MonetizationSettings = {
	enabled: boolean;
	walletAddress?: string;
};

export default function Supporters(props: SupportersProps) {
	const { portal } = usePortalProvider();

	// Portal-level monetization config
	const monetization = portal?.Monetization as MonetizationSettings | undefined;
	const enabled = !!monetization?.enabled;
	const walletAddress = monetization?.walletAddress || null;

	// Block configuration
	const config: SupportersBlockData = React.useMemo(() => {
		const raw = (props.element?.data ?? {}) as SupportersBlockData;
		return {
			id: raw.id || '',
			scope: raw.scope || 'global',
			modules: raw.modules || { showTop: true, showRecent: false, showFullList: false },
			top: raw.top || {
				count: 10,
				sort: 'amount_desc',
				columns: { avatar: true, name: true, amount: true, time: false, usdApprox: false },
			},
			recent: raw.recent || {
				count: 10,
				columns: { avatar: true, name: true, amount: true, time: true, usdApprox: false },
			},
			fullList: raw.fullList,
			formatting: raw.formatting || { amountDecimals: 4, title: 'Supporters', showUsdApprox: false },
		};
	}, [props.element?.data]);

	// Use mock data in preview mode, otherwise fetch real data
	const shouldUseMock = props.preview || !enabled || !walletAddress;
	const mockSupporters = React.useMemo(() => generateMockSupporters(15), []);

	const {
		supporters: realSupporters,
		loading,
		error,
	} = useSupporters(shouldUseMock ? null : walletAddress, config.scope, props.postId);

	const supporters = shouldUseMock ? mockSupporters : realSupporters;

	// If monetization is off or no wallet, render nothing (or empty state)
	if (!enabled || !walletAddress) {
		if (props.preview) {
			// In preview, show mock data
			return (
				<S.Wrapper className="portal-supporters">
					{config.modules.showTop && (
						<TopSupporters
							supporters={mockSupporters}
							config={config.top}
							amountDecimals={config.formatting.amountDecimals}
							title={config.formatting.title}
						/>
					)}
					{config.modules.showRecent && (
						<RecentSupporters
							supporters={mockSupporters}
							config={config.recent}
							amountDecimals={config.formatting.amountDecimals}
						/>
					)}
					{config.modules.showFullList && config.fullList && (
						<FullSupportersList
							supporters={mockSupporters}
							config={config.fullList}
							amountDecimals={config.formatting.amountDecimals}
						/>
					)}
				</S.Wrapper>
			);
		}
		return null;
	}

	if (loading) {
		return (
			<S.Wrapper className="portal-supporters">
				<S.LoadingMessage>Loading supporters...</S.LoadingMessage>
			</S.Wrapper>
		);
	}

	if (error) {
		return (
			<S.Wrapper className="portal-supporters">
				<S.ErrorMessage>Error loading supporters: {error}</S.ErrorMessage>
			</S.Wrapper>
		);
	}

	return (
		<S.Wrapper className="portal-supporters">
			{config.modules.showTop && (
				<TopSupporters
					supporters={supporters}
					config={config.top}
					amountDecimals={config.formatting.amountDecimals}
					title={config.formatting.title}
				/>
			)}
			{config.modules.showRecent && (
				<RecentSupporters
					supporters={supporters}
					config={config.recent}
					amountDecimals={config.formatting.amountDecimals}
				/>
			)}
			{config.modules.showFullList && config.fullList && (
				<FullSupportersList
					supporters={supporters}
					config={config.fullList}
					amountDecimals={config.formatting.amountDecimals}
				/>
			)}
		</S.Wrapper>
	);
}
