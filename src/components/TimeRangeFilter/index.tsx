/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable no-confusing-arrow */
import { DatePicker, Radio, Space } from 'antd';
import { DATE_FORMAT, timeRangeTypes } from 'global';
import { useQueryParams } from 'hooks';
import _ from 'lodash';
import moment from 'moment';
import React, { useCallback, useState } from 'react';
import { Label } from '../elements';

interface Props {
	disabled?: boolean;
	fields?: any;
	queryName?: string;
	onChange?: any;
	useSingleDateForDateRange?: boolean;
	dateRangeLabel?: string;
	dailyLabel?: string;
}

export const TimeRangeFilter = ({
	disabled,
	fields = [
		timeRangeTypes.DAILY,
		timeRangeTypes.MONTHLY,
		timeRangeTypes.DATE_RANGE,
	],
	queryName = 'timeRange',
	onChange,
	useSingleDateForDateRange = false,
	dateRangeLabel = 'Select Date Range',
	dailyLabel = 'Daily',
}: Props) => {
	// STATES
	const [timeRangeType, setTimeRangeType] = useState(timeRangeTypes.DAILY);

	// CUSTOM HOOKS
	const { params, setQueryParams } = useQueryParams({
		onParamsCheck: (currentParams) => {
			const newParams = {};

			if (
				!_.toString(currentParams[queryName]) &&
				fields?.includes(timeRangeTypes.DAILY)
			) {
				newParams[queryName] = timeRangeTypes.DAILY;
			}

			if (_.toString(currentParams[queryName])) {
				const validatedTimeRange = validateTimeRange(currentParams[queryName]);
				const validatedSingleDate = validateSingleDate(
					currentParams[queryName],
				);

				if (useSingleDateForDateRange && validatedSingleDate?.isValid) {
					setTimeRangeType(timeRangeTypes.DATE_RANGE);
				}

				if (validatedTimeRange) {
					const {
						areValid,
						areSameMonth,
						isStartOfTheMonth,
						isEndOfTheMonth,
					} = validatedTimeRange;

					if (
						areValid &&
						areSameMonth &&
						isStartOfTheMonth &&
						isEndOfTheMonth
					) {
						setTimeRangeType(timeRangeTypes.MONTHLY);
					}
				}
			}

			return newParams;
		},
	});

	// METHODS
	const handleChange = (value) => {
		if (onChange) {
			onChange(value);
		} else {
			setQueryParams({ [queryName]: value }, { shouldResetPage: true });
		}
	};

	const renderMonthPicker = useCallback(() => {
		const validatedTimeRange = validateTimeRange(params[queryName]);

		let defaultValue;
		if (validatedTimeRange) {
			defaultValue = validatedTimeRange.defaultValue;
		}

		return (
			<DatePicker
				className="w-100"
				defaultPickerValue={defaultValue}
				defaultValue={defaultValue}
				format="MMMM YYYY"
				picker="month"
				onChange={(date) => {
					if (date) {
						const firstDate = date.clone().startOf('month');
						const lastDate = date.clone().endOf('month');

						handleChange(
							[
								firstDate.format(DATE_FORMAT),
								lastDate.format(DATE_FORMAT),
							].join(','),
						);
					}
				}}
			/>
		);
	}, [params[queryName]]);

	const renderRangePicker = useCallback(() => {
		if (useSingleDateForDateRange) {
			const validatedSingleDate = validateSingleDate(params[queryName]);

			return (
				<DatePicker
					className="w-100"
					defaultPickerValue={validatedSingleDate?.defaultValue}
					defaultValue={validatedSingleDate?.defaultValue}
					disabled={disabled}
					format={DATE_FORMAT}
					onChange={(date) => {
						if (date) {
							handleChange(date.format(DATE_FORMAT));
						}
					}}
				/>
			);
		}

		const timeRangeValues = _.toString(params[queryName])?.split(',') || [];
		const startDate = moment(timeRangeValues[0]);
		const endDate = moment(timeRangeValues[1]);
		const defaultValue: any =
			startDate.isValid() && endDate.isValid()
				? [startDate, endDate]
				: undefined;

		return (
			<DatePicker.RangePicker
				className="w-100"
				defaultPickerValue={defaultValue}
				defaultValue={defaultValue}
				disabled={disabled}
				format={DATE_FORMAT}
				onCalendarChange={(dates, dateStrings) => {
					if (dates?.[0] && dates?.[1]) {
						handleChange(dateStrings.join(','));
					}
				}}
			/>
		);
	}, [params[queryName], disabled, useSingleDateForDateRange]);

	const getOptions = useCallback(() => {
		const options = [];

		if (fields?.includes(timeRangeTypes.DAILY)) {
			options.push({ label: dailyLabel, value: timeRangeTypes.DAILY });
		}

		if (fields?.includes(timeRangeTypes.MONTHLY)) {
			options.push({ label: 'Monthly', value: timeRangeTypes.MONTHLY });
		}

		if (fields?.includes(timeRangeTypes.DATE_RANGE)) {
			options.push({
				label: dateRangeLabel,
				value: timeRangeTypes.DATE_RANGE,
			});
		}

		return options;
	}, [dailyLabel, fields, dateRangeLabel]);

	const validateTimeRange = (timeRange) => {
		const timeRangeValues = _.toString(timeRange)?.split(',') || [];

		let defaultValue;
		if (timeRangeValues.length === 2) {
			// Get dates
			const startDate = moment(timeRangeValues[0]);
			const endDate = moment(timeRangeValues[1]);

			// Validate time ranges
			const areValid = startDate.isValid() && endDate.isValid();
			const areSameMonth =
				startDate.isSame(endDate, 'month') && startDate.isSame(endDate, 'year');
			const isStartOfTheMonth = startDate.isSame(
				startDate.clone().startOf('month').format(DATE_FORMAT),
			);
			const isEndOfTheMonth = endDate.isSame(
				endDate.clone().endOf('month').format(DATE_FORMAT),
			);

			if (areValid && areSameMonth && isStartOfTheMonth && isEndOfTheMonth) {
				defaultValue = startDate;
			}

			return {
				defaultValue,
				startDate,
				endDate,
				areValid,
				areSameMonth,
				isStartOfTheMonth,
				isEndOfTheMonth,
			};
		}

		return null;
	};

	const validateSingleDate = (timeRange) => {
		const date = moment(_.toString(timeRange), DATE_FORMAT, true);

		if (!date.isValid()) {
			return null;
		}

		return {
			defaultValue: date,
			isValid: true,
		};
	};

	return (
		<>
			<Label label="Time Range" spacing />
			<Space direction="vertical" size={10}>
				<Radio.Group
					disabled={disabled}
					options={getOptions()}
					optionType="button"
					value={timeRangeType}
					onChange={(e) => {
						const { value } = e.target;
						setTimeRangeType(value);

						if (value === timeRangeTypes.DAILY) {
							handleChange(value);
						}
					}}
				/>
				{timeRangeType === timeRangeTypes.MONTHLY && renderMonthPicker()}
				{timeRangeType === timeRangeTypes.DATE_RANGE && renderRangePicker()}
			</Space>
		</>
	);
};
