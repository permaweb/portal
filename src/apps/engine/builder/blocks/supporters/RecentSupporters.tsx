import React from 'react';

import { SupportersRecentConfig, SupporterTip } from 'helpers/types';

import * as S from './styles';
import SupporterItem from './SupporterItem';

type RecentSupportersProps = {
	supporters: SupporterTip[];
	config: SupportersRecentConfig;
	amountDecimals: number;
	title?: string;
};

export default function RecentSupporters(props: RecentSupportersProps) {
	const { supporters, config, amountDecimals, title } = props;

	// Sort by most recent
	const sortedSupporters = [...supporters].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

	// Take only the specified count
	const recentSupporters = sortedSupporters.slice(0, config.count);

	if (recentSupporters.length === 0) {
		return (
			<S.ModuleWrapper>
				<S.ModuleTitle>{title || 'Recent Supporters'}</S.ModuleTitle>
				<S.EmptyMessage>No supporters yet</S.EmptyMessage>
			</S.ModuleWrapper>
		);
	}

	return (
		<S.ModuleWrapper>
			<S.ModuleTitle>{title || 'Recent Supporters'}</S.ModuleTitle>
			<S.SupportersList>
				{recentSupporters.map((supporter) => (
					<SupporterItem
						key={supporter.id}
						supporter={supporter}
						columns={config.columns}
						amountDecimals={amountDecimals}
					/>
				))}
			</S.SupportersList>
		</S.ModuleWrapper>
	);
}
