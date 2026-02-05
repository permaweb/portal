import React from 'react';

import { SupportersTopConfig, SupporterTip } from 'helpers/types';

import * as S from './styles';
import SupporterItem from './SupporterItem';

type TopSupportersProps = {
	supporters: SupporterTip[];
	config: SupportersTopConfig;
	amountDecimals: number;
	title?: string;
};

export default function TopSupporters(props: TopSupportersProps) {
	const { supporters, config, amountDecimals, title } = props;

	// Sort supporters
	const getAmount = (supporter: SupporterTip) => parseFloat(supporter.amount ?? supporter.amountAr ?? '0');
	let sortedSupporters = [...supporters];
	switch (config.sort) {
		case 'amount_desc':
			sortedSupporters.sort((a, b) => getAmount(b) - getAmount(a));
			break;
		case 'amount_asc':
			sortedSupporters.sort((a, b) => getAmount(a) - getAmount(b));
			break;
		case 'time_desc':
			sortedSupporters.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
			break;
	}

	// Take only the specified count
	const topSupporters = sortedSupporters.slice(0, config.count);

	if (topSupporters.length === 0) {
		return (
			<S.ModuleWrapper>
				<S.ModuleTitle>{title || 'Top Supporters'}</S.ModuleTitle>
				<S.EmptyMessage>No supporters yet</S.EmptyMessage>
			</S.ModuleWrapper>
		);
	}

	return (
		<S.ModuleWrapper>
			<S.ModuleTitle>{title || 'Top Supporters'}</S.ModuleTitle>
			<S.SupportersList>
				{topSupporters.map((supporter) => (
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
