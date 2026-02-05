import React from 'react';
import { useSupporters } from 'engine/hooks/useSupporters';
import { usePortalProvider } from 'engine/providers/portalProvider';

import { normalizeTipToken } from 'helpers/tokens';
import { MonetizationConfig, SupportersBlockData } from 'helpers/types';

import FullSupportersList from './FullSupportersList';
import RecentSupporters from './RecentSupporters';
import * as S from './styles';
import TopSupporters from './TopSupporters';

type SupportersProps = {
	element: any;
	preview: boolean;
	location?: 'page' | 'post';
	postId?: string;
};

export default function Supporters(props: SupportersProps) {
	const { portal } = usePortalProvider();

	// Portal-level monetization config
	const monetization = portal?.Monetization as MonetizationConfig | undefined;
	const enabled = !!monetization?.enabled;
	const walletAddress = monetization?.walletAddress || null;
	const activeToken = normalizeTipToken(monetization as any);

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

	// Fetch real data from GraphQL
	const { supporters, loading, error } = useSupporters(
		enabled && walletAddress ? walletAddress : null,
		config.scope,
		props.postId,
		{
			symbol: activeToken.symbol,
			process: activeToken.type === 'AO' ? activeToken.processId : undefined,
		}
	);

	// If monetization is off or no wallet, render nothing
	if (!enabled || !walletAddress) {
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
				<S.ErrorMessage>Error loading supporters</S.ErrorMessage>
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
