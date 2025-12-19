import { Col, Row, Select, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { RequestErrors, TableHeader, TimeRangeFilter } from 'components';
import { Label } from 'components/elements';
import { filterOption, getFullName, ServiceType, useUsers } from 'ejjy-global';
import {
	appTypes,
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	MAX_PAGE_SIZE,
	pageSizeOptions,
	timeRangeTypes,
} from 'global';
import { useBranchAssignments, useBranches, useQueryParams } from 'hooks';
import React, { useEffect, useState } from 'react';
import { useUserStore } from 'stores';
import {
	convertIntoArray,
	formatDateTime,
	getAppType,
	getLocalApiUrl,
	getLocalBranchId,
	isStandAlone,
	isUserFromOffice,
} from 'utils';

const columns: ColumnsType = [
	{ title: 'Branch', dataIndex: 'branch' },
	{ title: 'Name', dataIndex: 'name' },
	{ title: 'Date & Time', dataIndex: 'datetime' },
];

export const TabBranchAssignments = () => {
	// STATES
	const [dataSource, setDataSource] = useState([]);

	// CUSTOM HOOKS
	const { params, setQueryParams } = useQueryParams();
	const {
		data: { branchAssignments, total },
		isFetching: isFetchingBranchAssignments,
		error: branchAssignmentsError,
	} = useBranchAssignments({
		params: {
			...params,
			branchId:
				getAppType() === appTypes.BACK_OFFICE
					? getLocalBranchId()
					: params?.branchId,
			timeRange: params?.timeRange || timeRangeTypes.DAILY,
		},
		shouldFetchOfflineFirst: true,
	});

	// METHODS
	useEffect(() => {
		const data = branchAssignments.map((branchAssignment) => ({
			key: branchAssignment.id,
			branch: branchAssignment.branch?.name,
			name: getFullName(branchAssignment.user),
			datetime: formatDateTime(branchAssignment.datetime_created),
		}));

		setDataSource(data);
	}, [branchAssignments]);

	return (
		<div>
			<TableHeader title="Branch Assignments" wrapperClassName="pt-2 px-0" />

			<RequestErrors
				errors={convertIntoArray(branchAssignmentsError)}
				withSpaceBottom
			/>

			<Filter />

			<Table
				columns={columns}
				dataSource={dataSource}
				loading={isFetchingBranchAssignments}
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

	const user = useUserStore((state) => state.user);
	const {
		data: { branches },
		isFetching: isFetchingBranches,
		error: branchesError,
	} = useBranches({
		params: { pageSize: MAX_PAGE_SIZE },
		options: { enabled: isUserFromOffice(user.user_type) },
	});
	const {
		data: usersData,
		isFetching: isFetchingUsers,
		error: usersError,
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
					...convertIntoArray(usersError, 'Users'),
					...convertIntoArray(branchesError, 'Branches'),
				]}
				withSpaceBottom
			/>

			<Row className="mb-4" gutter={[16, 16]}>
				{isUserFromOffice(user.user_type) && (
					<Col lg={12} span={24}>
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

				<Col lg={12} span={24}>
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
