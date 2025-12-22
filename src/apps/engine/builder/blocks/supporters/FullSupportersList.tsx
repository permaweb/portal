import React from 'react';

import { SupportersFullListConfig, SupporterTip } from 'helpers/types';

import * as S from './styles';
import SupporterItem from './SupporterItem';

type FullSupportersListProps = {
	supporters: SupporterTip[];
	config: SupportersFullListConfig;
	amountDecimals: number;
	title?: string;
};

export default function FullSupportersList(props: FullSupportersListProps) {
	const { supporters, config, amountDecimals, title } = props;
	const [currentPage, setCurrentPage] = React.useState(1);

	// Sort by amount descending
	const sortedSupporters = [...supporters].sort((a, b) => parseFloat(b.amountAr) - parseFloat(a.amountAr));

	// Pagination
	const itemsPerPage = config.pagination || 10;
	const totalPages = Math.ceil(sortedSupporters.length / itemsPerPage);
	const startIndex = (currentPage - 1) * itemsPerPage;
	const endIndex = startIndex + itemsPerPage;
	const currentSupporters = sortedSupporters.slice(startIndex, endIndex);

	if (supporters.length === 0) {
		return (
			<S.ModuleWrapper>
				<S.ModuleTitle>{title || 'All Supporters'}</S.ModuleTitle>
				<S.EmptyMessage>No supporters yet</S.EmptyMessage>
			</S.ModuleWrapper>
		);
	}

	return (
		<S.ModuleWrapper>
			<S.ModuleTitle>{title || 'All Supporters'}</S.ModuleTitle>
			<S.SupportersList>
				{currentSupporters.map((supporter) => (
					<SupporterItem
						key={supporter.id}
						supporter={supporter}
						columns={config.columns}
						amountDecimals={amountDecimals}
					/>
				))}
			</S.SupportersList>
			{totalPages > 1 && (
				<div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '10px' }}>
					<button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
						Previous
					</button>
					<span>
						Page {currentPage} of {totalPages}
					</span>
					<button
						onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
						disabled={currentPage === totalPages}
					>
						Next
					</button>
				</div>
			)}
		</S.ModuleWrapper>
	);
}
