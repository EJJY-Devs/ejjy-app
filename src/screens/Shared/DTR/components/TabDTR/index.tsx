import { EditFilled } from '@ant-design/icons';
import { Button, Col, Radio, Row, Select, Table, Tooltip } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import {
	EditAttendanceLogModal,
	RequestErrors,
	TableHeader,
	TimeRangeFilter,
} from 'components';
import { Label } from 'components/elements';
import {
	attendanceCategories,
	filterOption,
	getAttendanceLogDescription,
	getFullName,
} from 'ejjy-global';
import {
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	EMPTY_CELL,
	MAX_PAGE_SIZE,
	accountTypes,
	pageSizeOptions,
} from 'global';
import {
	useAccounts,
	useAttendanceLogs,
	useBranches,
	usePingOnlineServer,
	useQueryParams,
} from 'hooks';
import _ from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import { useUserStore } from 'stores';
import {
	convertIntoArray,
	formatDateTime,
	getLocalBranchId,
	isUserFromBranch,
	isUserFromOffice,
} from 'utils';

export const TabDTR = () => {
	// STATES
	const [dataSource, setDataSource] = useState([]);
	const [selectedLog, setSelectedLog] = useState(null);

	// CUSTOM HOOKS
	const { isConnected } = usePingOnlineServer();
	const { params, setQueryParams } = useQueryParams();
	const user = useUserStore((state) => state.user);
	const {
		data: { attendanceLogs, total },
		isFetching: isFetchingAttendanceLogs,
		error: attendanceLogsError,
	} = useAttendanceLogs({
		params: {
			...params,
			branchId: isUserFromBranch(user.user_type)
				? getLocalBranchId()
				: params?.branchId,
		},
	});

	// METHODS
	useEffect(() => {
		const data = attendanceLogs.map((log) => ({
			key: log.id,
			name: getFullName(log.employee),
			// scheduledDateTime: log.scheduled_time
			// 	? formatDateTime(log.scheduled_time)
			// 	: EMPTY_CELL,
			realDateTime: log.real_time ? formatDateTime(log.real_time) : EMPTY_CELL,
			type: _.upperFirst(log.attendance_category),
			description: getAttendanceLogDescription(
				log.attendance_category,
				log.attendance_type,
			),
			actions: (
				<Tooltip title="Edit">
					<Button
						disabled={isConnected === false}
						icon={<EditFilled />}
						type="primary"
						ghost
						onClick={() => setSelectedLog(log)}
					/>
				</Tooltip>
			),
		}));

		setDataSource(data);
	}, [attendanceLogs]);

	const getColumns = useCallback(() => {
		const columns: ColumnsType = [
			{ title: 'Employee Name', dataIndex: 'name' },
			{
				title: 'Date & Time',
				dataIndex: 'realDateTime',
			},
			{ title: 'Type', dataIndex: 'type' },
			{ title: 'Description', dataIndex: 'description' },
		];

		if (isUserFromOffice(user.user_type)) {
			columns.push({ title: 'Actions', dataIndex: 'actions' });
		}

		return columns;
	}, [user.user_type]);

	return (
		<>
			<TableHeader title="Daily Time Record" wrapperClassName="pt-2 px-0" />

			<RequestErrors
				errors={convertIntoArray(attendanceLogsError, 'Logs')}
				withSpaceBottom
			/>

			<Filter />

			<Table
				columns={getColumns()}
				dataSource={dataSource}
				loading={isFetchingAttendanceLogs}
				pagination={{
					current: Number(params.page) || DEFAULT_PAGE,
					total,
					pageSize: Number(params.pageSize) || DEFAULT_PAGE_SIZE,
					onChange: (page, newPageSize) => {
						setQueryParams({
							page,
							pageSize: newPageSize,
						});
					},
					disabled: !dataSource,
					position: ['bottomCenter'],
					pageSizeOptions,
				}}
				scroll={{ x: 800 }}
				bordered
			/>

			{selectedLog && (
				<EditAttendanceLogModal
					attendanceLog={selectedLog}
					onClose={() => {
						setSelectedLog(null);
					}}
				/>
			)}
		</>
	);
};

const Filter = () => {
	// CUSTOM HOOKS
	const { params, setQueryParams } = useQueryParams();
	const user = useUserStore((state) => state.user);
	const {
		data: { branches },
		isFetching: isFetchingBranches,
		error: branchErrors,
	} = useBranches({
		params: { pageSize: MAX_PAGE_SIZE },
		options: { enabled: !isUserFromBranch(user.user_type) },
	});
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
				errors={[
					...convertIntoArray(accountErrors, 'Users'),
					...convertIntoArray(branchErrors, 'Branches'),
				]}
				withSpaceBottom
			/>

			<Row gutter={[16, 16]}>
				{!isUserFromBranch(user.user_type) && (
					<Col md={12}>
						<Label label="Branch" spacing />
						<Select
							className="w-100"
							filterOption={filterOption}
							loading={isFetchingBranches}
							optionFilterProp="children"
							value={params.branchId ? Number(params.branchId) : null}
							allowClear
							showSearch
							onChange={(value) => {
								setQueryParams({ branchId: value }, { shouldResetPage: true });
							}}
						>
							{branches.map((branch) => (
								<Select.Option key={branch.id} value={branch.id}>
									{branch.name}
								</Select.Option>
							))}
						</Select>
					</Col>
				)}

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
					<TimeRangeFilter />
				</Col>

				<Col md={12}>
					<Label label="Type" spacing />
					<Radio.Group
						defaultValue={null}
						options={[
							{ label: 'All', value: null },
							{ label: 'Attendance', value: attendanceCategories.ATTENDANCE },
							{
								label: 'Tracker',
								value: attendanceCategories.TRACKER,
							},
						]}
						optionType="button"
						value={params.attendanceCategory}
						onChange={(e) => {
							setQueryParams(
								{ attendanceCategory: e.target.value },
								{ shouldResetPage: true },
							);
						}}
					/>
				</Col>
			</Row>
		</div>
	);
};
