import { useLanguageProvider } from 'providers/LanguageProvider';
import * as S from './styles';
import { Button } from '../Button';
import { ASSETS } from 'helpers/config';

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
		<>
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
					<Button
						type={'alt3'}
						icon={ASSETS.arrow}
						label={''}
						handlePress={() => props.setCurrentPage((prev) => Math.max(prev - 1, 1))}
						disabled={props.currentPage === 1 || props.totalItems === 0}
						direction={'left'}
					/>
					<Button
						type={'alt3'}
						icon={ASSETS.arrow}
						label={''}
						handlePress={() => props.setCurrentPage((prev) => Math.min(prev + 1, props.totalPages))}
						disabled={props.currentPage === props.totalPages || props.totalItems === 0}
						direction={'right'}
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
		</>
	);
}
