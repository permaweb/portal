import { ICONS } from 'helpers/config';
import { useLanguageProvider } from 'providers/LanguageProvider';

import { Button } from '../Button';
import { IconButton } from '../IconButton';

import * as S from './styles';

type Props = {
	totalItems: number;
	totalPages: number;
	currentPage: number;
	currentRange: { start: number; end: number; total: number };
	setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
	showRange: boolean;
	showControls: boolean;
	iconButtons?: boolean;
};

export default function Pagination(props: Props) {
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];
	return (
		<S.Wrapper>
			{props.showRange && (
				<S.PaginationRangeDetails>
					<p>
						{language?.showingRange(
							props.currentRange.total > 0 ? props.currentRange.start : 0,
							props.currentRange.end,
							props.currentRange.total
						)}
					</p>
					<p>{`${language?.page} ${props.currentPage}`}</p>
				</S.PaginationRangeDetails>
			)}
			{props.showControls && props.iconButtons && (
				<S.PaginationActions>
					<IconButton
						type={'alt1'}
						src={ICONS.arrow}
						handlePress={() => props.setCurrentPage((prev) => Math.max(prev - 1, 1))}
						disabled={props.currentPage === 1 || props.totalItems === 0}
						dimensions={{
							wrapper: 25,
							icon: 15,
						}}
						tooltip={language?.previous}
					/>
					<IconButton
						type={'alt1'}
						src={ICONS.arrow}
						handlePress={() => props.setCurrentPage((prev) => Math.min(prev + 1, props.totalPages))}
						disabled={props.currentPage === props.totalPages || props.totalItems === 0}
						dimensions={{
							wrapper: 25,
							icon: 15,
						}}
						tooltip={language?.next}
					/>
				</S.PaginationActions>
			)}
			{props.showControls && !props.iconButtons && (
				<S.PaginationActions>
					<Button
						type={'alt3'}
						label={language?.previous}
						handlePress={() => props.setCurrentPage((prev) => Math.max(prev - 1, 1))}
						disabled={props.currentPage === 1 || props.totalItems === 0}
					/>
					<Button
						type={'alt3'}
						label={language?.next}
						handlePress={() => props.setCurrentPage((prev) => Math.min(prev + 1, props.totalPages))}
						disabled={props.currentPage === props.totalPages || props.totalItems === 0}
					/>
				</S.PaginationActions>
			)}
		</S.Wrapper>
	);
}
