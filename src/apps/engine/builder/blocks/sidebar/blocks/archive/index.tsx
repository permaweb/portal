import React from 'react';
import { useNavigate } from 'react-router-dom';
import Title from 'engine/components/title';
import { useArchive } from 'engine/hooks/posts';

import * as S from './styles';

export default function SidebarArchive(props: any) {
	const { author } = props;
	const navigate = useNavigate();
	const { archive } = useArchive(author ? author : null);

	return (
		<S.SidebarCategory>
			<h2>Archive</h2>
			{Object.keys(archive)
				.sort((a, b) => Number(b) - Number(a))
				.map((year) => (
					<S.FNCategory key={year}>
						<Title>
							<h3>{year}</h3>
						</Title>
						{[
							'December',
							'November',
							'October',
							'September',
							'August',
							'July',
							'June',
							'May',
							'April',
							'March',
							'February',
							'January',
						].map((month, index) => {
							if (!archive[year][month]) return null;
							return (
								<S.FNEntry key={month} $level={1} onClick={() => navigate(`/feed/date/${year}/${11 - index + 1}`)}>
									{month}
								</S.FNEntry>
							);
						})}
					</S.FNCategory>
				))}
		</S.SidebarCategory>
	);
}
