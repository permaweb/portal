import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { EditorStoreRootState } from 'editor/store';
import { currentPostUpdate } from 'editor/store/post';

import { Button } from 'components/atoms/Button';
import { Calendar } from 'components/atoms/Calendar';
import { FormField } from 'components/atoms/FormField';
import { Panel } from 'components/atoms/Panel';
import { Select } from 'components/atoms/Select';
import { Toggle } from 'components/atoms/Toggle';
import { ASSETS } from 'helpers/config';
import { SelectOptionType } from 'helpers/types';
import { formatDate } from 'helpers/utils';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { useNotifications } from 'providers/NotificationProvider';

import * as S from './styles';

// TODO: Permissions
export default function ArticlePostReleaseDate() {
	const dispatch = useDispatch();

	const currentPost = useSelector((state: EditorStoreRootState) => state.currentPost);

	const { addNotification } = useNotifications();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const monthOptions = [
		{ id: '01', label: 'January' },
		{ id: '02', label: 'February' },
		{ id: '03', label: 'March' },
		{ id: '04', label: 'April' },
		{ id: '05', label: 'May' },
		{ id: '06', label: 'June' },
		{ id: '07', label: 'July' },
		{ id: '08', label: 'August' },
		{ id: '09', label: 'September' },
		{ id: '10', label: 'October' },
		{ id: '11', label: 'November' },
		{ id: '12', label: 'December' },
	];

	const [day, setDay] = React.useState<string>('');
	const [year, setYear] = React.useState<string>('');
	const [hours, setHours] = React.useState<string>('');
	const [minutes, setMinutes] = React.useState<string>('');
	const [period, setPeriod] = React.useState<'AM' | 'PM'>('PM');

	const [month, setMonth] = React.useState<SelectOptionType>(monthOptions[0]);

	const [showEdit, setShowEdit] = React.useState<boolean>(false);
	const [calendarViewDate, setCalendarViewDate] = React.useState<{ year: number; month: number } | undefined>();

	React.useEffect(() => {
		if (currentPost?.data?.releaseDate) {
			const date = new Date(currentPost.data.releaseDate);

			setYear(date.getFullYear().toString());
			setDay(date.getDate().toString());

			const monthId = String(date.getMonth() + 1).padStart(2, '0');
			const selectedMonth = monthOptions.find((m) => m.id === monthId);
			if (selectedMonth) {
				setMonth(selectedMonth);
			}

			let hours = date.getHours();
			const period = hours >= 12 ? 'PM' : 'AM';

			if (hours > 12) {
				hours -= 12;
			} else if (hours === 0) {
				hours = 12;
			}

			setHours(hours.toString());
			setMinutes(date.getMinutes().toString().padStart(2, '0'));
			setPeriod(period);
		}
	}, [currentPost?.data?.releaseDate]);

	const isLeapYear = (year: number): boolean => {
		return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
	};

	const getDaysInMonth = (month: number, year: number): number => {
		const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
		if (month === 2 && isLeapYear(year)) {
			return 29;
		}
		return daysInMonth[month - 1];
	};

	const validateDay = (
		dayValue: string,
		monthValue: string,
		yearValue: string
	): { status: boolean; message: string | null } => {
		if (!dayValue) return { status: false, message: null };
		const dayNum = parseInt(dayValue, 10);

		if (isNaN(dayNum) || dayNum < 1) {
			return { status: true, message: 'Day must be at least 1' };
		}

		if (monthValue && yearValue) {
			const monthNum = parseInt(monthValue, 10);
			const yearNum = parseInt(yearValue, 10);

			if (!isNaN(monthNum) && !isNaN(yearNum)) {
				const maxDays = getDaysInMonth(monthNum, yearNum);
				if (dayNum > maxDays) {
					const monthName = monthOptions.find((m) => m.id === monthValue)?.label || 'selected month';
					return { status: true, message: `${monthName} ${yearNum} only has ${maxDays} days` };
				}
			}
		} else if (dayNum > 31) {
			return { status: true, message: 'Day cannot be greater than 31' };
		}

		return { status: false, message: null };
	};

	const validateYear = (yearValue: string): { status: boolean; message: string | null } => {
		if (!yearValue) return { status: false, message: null };
		const yearNum = parseInt(yearValue, 10);
		const currentYear = new Date().getFullYear();
		if (isNaN(yearNum) || yearNum < currentYear) {
			return { status: true, message: `Year must be ${currentYear} or later` };
		}
		if (yearNum > currentYear + 10) {
			return { status: true, message: `Year cannot be more than ${currentYear + 10}` };
		}
		return { status: false, message: null };
	};

	const validateHours = (hoursValue: string): { status: boolean; message: string | null } => {
		if (!hoursValue) return { status: false, message: null };
		const hoursNum = parseInt(hoursValue, 10);
		if (isNaN(hoursNum) || hoursNum < 1 || hoursNum > 12) {
			return { status: true, message: 'Hours must be between 1-12' };
		}
		return { status: false, message: null };
	};

	const validateMinutes = (minutesValue: string): { status: boolean; message: string | null } => {
		if (!minutesValue) return { status: false, message: null };
		const minutesNum = parseInt(minutesValue, 10);
		if (isNaN(minutesNum) || minutesNum < 0 || minutesNum > 59) {
			return { status: true, message: 'Minutes must be between 0-59' };
		}
		return { status: false, message: null };
	};

	const dayValidation = validateDay(day, month.id, year);
	const yearValidation = validateYear(year);
	const hoursValidation = validateHours(hours);
	const minutesValidation = validateMinutes(minutes);

	const validateFutureDate = (): { status: boolean; message: string | null } => {
		if (!day || !year || !hours || !minutes) {
			return { status: false, message: null };
		}

		const dayNum = parseInt(day, 10);
		const yearNum = parseInt(year, 10);
		const monthNum = parseInt(month.id, 10);
		let hoursNum = parseInt(hours, 10);
		const minutesNum = parseInt(minutes, 10);

		if (isNaN(dayNum) || isNaN(yearNum) || isNaN(monthNum) || isNaN(hoursNum) || isNaN(minutesNum)) {
			return { status: false, message: null };
		}

		if (period === 'PM' && hoursNum !== 12) {
			hoursNum += 12;
		} else if (period === 'AM' && hoursNum === 12) {
			hoursNum = 0;
		}

		const selectedDate = new Date(yearNum, monthNum - 1, dayNum, hoursNum, minutesNum);
		const now = new Date();

		if (selectedDate.getTime() <= now.getTime()) {
			return { status: true, message: 'Release date can not be in the past.' };
		}

		return { status: false, message: null };
	};

	const futureDateValidation = validateFutureDate();

	const isFormValid =
		!dayValidation.status &&
		!yearValidation.status &&
		!hoursValidation.status &&
		!minutesValidation.status &&
		!futureDateValidation.status;

	const setDate = (): number | null => {
		if (!isFormValid) return null;

		const dayNum = parseInt(day, 10);
		const yearNum = parseInt(year, 10);
		const monthNum = parseInt(month.id, 10);

		const hasHour = typeof hours === 'string' && hours.trim() !== '';
		const hasMinute = typeof minutes === 'string' && minutes.trim() !== '';

		let hoursNum = hasHour ? parseInt(hours!, 10) : 12;
		let minutesNum = hasMinute ? parseInt(minutes!, 10) : 0;

		if (Number.isNaN(hoursNum) || hoursNum < 1) hoursNum = 12;
		if (hoursNum > 12) hoursNum = 12;
		if (Number.isNaN(minutesNum) || minutesNum < 0) minutesNum = 0;
		if (minutesNum > 59) minutesNum = 59;

		if (period === 'PM' && hoursNum !== 12) {
			hoursNum += 12;
		} else if (period === 'AM' && hoursNum === 12) {
			hoursNum = 0;
		}

		const builtDate = new Date(yearNum, monthNum - 1, dayNum, hoursNum, minutesNum);
		const timestamp = builtDate.getTime();

		dispatch(currentPostUpdate({ field: 'releaseDate', value: timestamp }));
		addNotification(language.releaseDateUpdated, 'success');
		setShowEdit(false);
	};

	const handleCalendarDateSelect = (date: { year: number; month: number; day: number }) => {
		setYear(date.year.toString());
		setDay(date.day.toString());

		const monthId = String(date.month).padStart(2, '0');
		const selectedMonth = monthOptions.find((m) => m.id === monthId);
		if (selectedMonth) {
			setMonth(selectedMonth);
		}
	};

	const handleMonthChange = (selectedMonth: SelectOptionType) => {
		setMonth(selectedMonth);

		const currentYear = year ? parseInt(year, 10) : new Date().getFullYear();
		setCalendarViewDate({
			year: currentYear,
			month: parseInt(selectedMonth.id, 10),
		});
	};

	return (
		<>
			<S.Wrapper>
				<S.HeaderWrapper>
					<div className={'info'}>
						<p>
							{currentPost?.data?.releaseDate
								? formatDate(currentPost.data.releaseDate, 'iso', true)
								: language.immediately}
						</p>
					</div>
					<Button
						type={'alt4'}
						label={language.edit}
						handlePress={() => setShowEdit(true)}
						icon={ASSETS.date}
						iconLeftAlign
					/>
				</S.HeaderWrapper>
			</S.Wrapper>
			<Panel
				open={showEdit}
				header={language.editReleaseDate}
				handleClose={() => setShowEdit(false)}
				width={500}
				className={'modal-wrapper'}
			>
				<S.BodyWrapper>
					<S.Section>
						<h4>{language.date}</h4>
						<S.DateWrapper>
							<Select
								activeOption={month}
								setActiveOption={handleMonthChange}
								options={monthOptions}
								disabled={false}
							/>
							<FormField
								value={day}
								onChange={(e: any) => setDay(e.target.value)}
								invalid={dayValidation}
								disabled={false}
								placeholder={'DD'}
								hideErrorMessage
							/>
							<FormField
								value={year}
								onChange={(e: any) => setYear(e.target.value)}
								invalid={yearValidation}
								disabled={false}
								placeholder={'YYYY'}
								hideErrorMessage
							/>
						</S.DateWrapper>
						<S.CalendarWrapper>
							<Calendar
								selectedDate={
									day && year
										? {
												year: parseInt(year, 10),
												month: parseInt(month.id, 10),
												day: parseInt(day, 10),
										  }
										: undefined
								}
								onDateSelect={handleCalendarDateSelect}
								minDate={new Date()}
								viewDate={calendarViewDate}
							/>
						</S.CalendarWrapper>
					</S.Section>
					<S.Section>
						<h4>{language.time}</h4>
						<S.TimeWrapper>
							<S.TimeFlexWrapper>
								<FormField
									value={hours}
									onChange={(e: any) => setHours(e.target.value)}
									invalid={hoursValidation}
									disabled={false}
									placeholder={'HH'}
									hideErrorMessage
								/>
								<span>:</span>
								<FormField
									value={minutes}
									onChange={(e: any) => setMinutes(e.target.value)}
									invalid={minutesValidation}
									disabled={false}
									placeholder={'MM'}
									hideErrorMessage
								/>
							</S.TimeFlexWrapper>
							<S.ToggleWrapper>
								<Toggle
									options={['AM', 'PM']}
									activeOption={period}
									handleToggle={(option: 'AM' | 'PM') => setPeriod(option)}
									disabled={false}
								/>
							</S.ToggleWrapper>
						</S.TimeWrapper>
					</S.Section>
				</S.BodyWrapper>
				<S.EditActions>
					<Button type={'primary'} label={language.cancel} handlePress={() => setShowEdit(false)} />
					<Button type={'alt1'} label={language.save} handlePress={() => setDate()} disabled={!isFormValid} />
				</S.EditActions>
				{futureDateValidation.status && (
					<S.ErrorMessage className={'warning'}>{futureDateValidation.message}</S.ErrorMessage>
				)}
			</Panel>
		</>
	);
}
