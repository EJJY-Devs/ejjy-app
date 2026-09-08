import { Col, Row, Select, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { RequestErrors, TableHeader, TimeRangeFilter } from 'components';
import { Label } from 'components/elements';
import { PdfButtons } from 'components/Printing';
import { printDtr, filterOption, getFullName } from 'ejjy-global';
import dayjs from 'dayjs';
import {
	accountTypes,
	EMPTY_CELL,
	MAX_PAGE_SIZE,
	timeRangeTypes,
} from 'global';
import {
	useAccounts,
	useAttendanceLogsForPrinting,
	usePdf,
	useQueryParams,
} from 'hooks';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { convertIntoArray, formatTimeOnly } from 'utils';

const columns: ColumnsType = [
	{
		title: 'Day',
		dataIndex: 'day',
	},
	{
		title: 'A.M.',
		children: [
			{
				title: 'Arrival',
				dataIndex: 'amArrival',
			},
			{
				title: 'Departure',
				dataIndex: 'amDeparture',
			},
		],
	},
	{
		title: 'P.M.',
		children: [
			{
				title: 'Arrival',
				dataIndex: 'pmArrival',
			},
			{
				title: 'Departure',
				dataIndex: 'pmDeparture',
			},
		],
	},
	{
		title: 'Overtime',
		children: [
			{
				title: 'Hours',
				dataIndex: 'overtimeHours',
				align: 'center',
			},
			{
				title: 'Minutes',
				dataIndex: 'overtimeMinutes',
				align: 'center',
			},
		],
	},
];

export const TabDTRPrinting = () => {
	// STATES
	const [dataSource, setDataSource] = useState([]);
	const [timeRangeError, setTimeRangeError] = useState('');

	// CUSTOM HOOKS
	const { params } = useQueryParams();
	const {
		data: { dtr },
		isFetching: isFetchingAttendanceLogs,
		error: attendanceLogsError,
	} = useAttendanceLogsForPrinting({
		params,
		options: {
			enabled: !timeRangeError && !!params?.employeeId && !!params?.timeRange,
		},
	});
	const {
		htmlPdf,
		isLoadingPdf,
		previewPdf,
		downloadPdf,
		pdfPreviewModal,
	} = usePdf({
		title: 'TransactionAdjustmentReport.pdf',
		previewInModal: true,
		jsPdfSettings: { format: [400, 850] },
		print: () => {
			let month;
			const timeRange = _.toString(params?.timeRange).split(',');
			const dateStart = dayjs(timeRange[0]);
			const dateEnd = dayjs(timeRange[1]);

			if (dateStart.month() === dateEnd.month()) {
				month = dateStart.format('MMMM');
			} else {
				month = `${dateStart.format('MMMM')} - ${dateEnd.format('MMMM')}`;
			}

			return printDtr(dtr, month);
		},
	});

	// METHODS
	useEffect(() => {
		if (!timeRangeError && dtr.logs) {
			const data = dtr?.logs?.map((log) => ({
				key: log.id,
				day: log.day_number,
				amArrival: log.am_arrival ? formatTimeOnly(log.am_arrival) : EMPTY_CELL,
				amDeparture: log.am_departure
					? formatTimeOnly(log.am_departure)
					: EMPTY_CELL,
				pmArrival: log.pm_arrival ? formatTimeOnly(log.pm_arrival) : EMPTY_CELL,
				pmDeparture: log.pm_departure
					? formatTimeOnly(log.pm_departure)
					: EMPTY_CELL,
				overtimeHours: '',
				overtimeMinutes: '',
			}));

			setDataSource(data);
		}
	}, [dtr, timeRangeError]);

	useEffect(() => {
		if (params?.timeRange) {
			const dates = _.toString(params?.timeRange)?.split(',');
			const startDate = dayjs(dates[0]);
			const endDate = dayjs(dates[1]);

			const isSameMonth =
				startDate.isSame(endDate, 'month') && startDate.isSame(endDate, 'year');

			setTimeRangeError(
				isSameMonth ? null : 'Selected dates must be of the same month.',
			);
		}
	}, [params?.timeRange]);

	useEffect(() => {
		if ((!params?.employeeId || !params?.timeRange) && dataSource.length > 0) {
			setDataSource([]);
		}
	}, [params, dataSource]);

	return (
		<>
			<TableHeader
				buttons={
					<PdfButtons
						key="pdf"
						downloadPdf={downloadPdf}
						isDisabled={dataSource.length === 0 || isLoadingPdf}
						isLoading={isLoadingPdf}
						previewPdf={previewPdf}
					/>
				}
				title="DTR Printing"
				wrapperClassName="pt-2 px-0"
			/>

			<RequestErrors
				errors={[
					...convertIntoArray(timeRangeError),
					...convertIntoArray(attendanceLogsError, 'Logs'),
				]}
				withSpaceBottom
			/>

			<Filter />

			<Table
				columns={columns}
				dataSource={dataSource}
				loading={isFetchingAttendanceLogs}
				pagination={false}
				scroll={{ x: 800 }}
				bordered
			/>

			<div
				// eslint-disable-next-line react/no-danger
				dangerouslySetInnerHTML={{ __html: htmlPdf }}
				style={{ display: 'none' }}
			/>

			{pdfPreviewModal}
		</>
	);
};

const Filter = () => {
	// CUSTOM HOOKS
	const { params, setQueryParams } = useQueryParams();
	const {
		data: { accounts },
		isFetching: isFetchingAccounts,
		error: accountErrors,
	} = useAccounts({
		params: { type: accountTypes.EMPLOYEE, pageSize: MAX_PAGE_SIZE },
	});

	return (
		<div className="mb-4">
			<RequestErrors
				errors={convertIntoArray(accountErrors, 'Users')}
				withSpaceBottom
			/>

			<Row gutter={[16, 16]}>
				<Col md={12}>
					<Label label="Employee" spacing />
					<Select
						className="w-100"
						filterOption={filterOption}
						loading={isFetchingAccounts}
						optionFilterProp="children"
						value={params.employeeId ? Number(params.employeeId) : null}
						allowClear
						showSearch
						onChange={(value) => {
							setQueryParams({ employeeId: value }, { shouldResetPage: true });
						}}
					>
						{accounts.map((employee) => (
							<Select.Option key={employee.id} value={employee.id}>
								{getFullName(employee)}
							</Select.Option>
						))}
					</Select>
				</Col>

				<Col md={12}>
					<TimeRangeFilter
						fields={[timeRangeTypes.MONTHLY, timeRangeTypes.DATE_RANGE]}
					/>
				</Col>
			</Row>
		</div>
	);
};
