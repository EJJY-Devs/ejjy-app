import { Col, Row, Select, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { RequestErrors, TableHeader, TimeRangeFilter } from 'components';
import { Label } from 'components/elements';
import dayjs from 'dayjs';
import { filterOption, getFullName, ServiceType, useUsers } from 'ejjy-global';
import {
	appTypes,
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	MAX_PAGE_SIZE,
	pageSizeOptions,
	timeRangeTypes,
} from 'global';
import { useBranches, useCashieringAssignments, useQueryParams } from 'hooks';
import React, { useEffect, useState } from 'react';
import {
	convertIntoArray,
	formatTime,
	getAppType,
	getLocalApiUrl,
	getLocalBranchId,
	isStandAlone,
} from 'utils';

const columns: ColumnsType = [
	{ title: 'Branch Machine', dataIndex: 'branchMachine' },
	{ title: 'Name', dataIndex: 'name' },
	{ title: 'Date', dataIndex: 'date' },
	{ title: 'Time', dataIndex: 'time' },
];

export const TabSessionAssignments = () => {
	// STATES
	const [dataSource, setDataSource] = useState([]);

	// CUSTOM HOOKS
	const { params, setQueryParams } = useQueryParams();
	const {
		data: { cashieringAssignments, total },
		isFetching: isFetchingCashieringAssignments,
		error: cashieringAssignmentsError,
	} = useCashieringAssignments({
		params: {
			...params,
			timeRange: params?.timeRange || timeRangeTypes.DAILY,
		},
	});

	// METHODS
	useEffect(() => {
		const data = cashieringAssignments.map((assignment) => ({
			key: assignment.id,
			branchMachine: `${assignment.branch_machine.branch.name} - ${assignment.branch_machine.name}`,
			name: getFullName(assignment.user),
			date: dayjs.tz(assignment.datetime_start).format('MMMM DD, YYYY'),
			time: `${formatTime(assignment.datetime_start)} – ${formatTime(
				assignment.datetime_end,
			)}`,
		}));

		setDataSource(data);
	}, [cashieringAssignments]);

	return (
		<div>
			<TableHeader
				title="Cashiering Assignments"
				wrapperClassName="pt-2 px-0"
			/>

			<RequestErrors
				errors={convertIntoArray(cashieringAssignmentsError)}
				withSpaceBottom
			/>

			<Filter />

			<Table
				columns={columns}
				dataSource={dataSource}
				loading={isFetchingCashieringAssignments}
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
		</div>
	);
};

const Filter = () => {
	// CUSTOM HOOKS
	const { params, setQueryParams } = useQueryParams();
	const branchId = params.branchId ? Number(params.branchId) : undefined;

	const {
		data: { branches },
		isFetching: isFetchingBranches,
		error: branchErrors,
	} = useBranches({
		params: { pageSize: MAX_PAGE_SIZE },
		options: { enabled: getAppType() !== appTypes.BACK_OFFICE },
	});
	const {
		data: usersData,
		isFetching: isFetchingUsers,
		error: userErrors,
	} = useUsers({
		params: {
			branchId:
				getAppType() === appTypes.BACK_OFFICE
					? Number(getLocalBranchId())
					: branchId,
			pageSize: MAX_PAGE_SIZE,
		},
		serviceOptions: {
			baseURL: getLocalApiUrl(),
			type: isStandAlone() ? ServiceType.ONLINE : ServiceType.OFFLINE,
		},
	});

	return (
		<>
			<RequestErrors
				errors={[
					...convertIntoArray(userErrors, 'Users'),
					...convertIntoArray(branchErrors, 'Branches'),
				]}
				withSpaceBottom
			/>

			<Row className="mb-4" gutter={[16, 16]}>
				{getAppType() !== appTypes.BACK_OFFICE && (
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
					<Label label="User" spacing />
					<Select
						className="w-100"
						filterOption={filterOption}
						loading={isFetchingUsers}
						optionFilterProp="children"
						value={params.userId ? Number(params.userId) : null}
						allowClear
						showSearch
						onChange={(value) => {
							setQueryParams({ userId: value }, { shouldResetPage: true });
						}}
					>
						{usersData?.list.map((u) => (
							<Select.Option key={u.id} value={u.id}>
								{getFullName(u)}
							</Select.Option>
						))}
					</Select>
				</Col>
				<Col lg={12} span={24}>
					<TimeRangeFilter />
				</Col>
			</Row>
		</>
	);
};
