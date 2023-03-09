import { Col, Row, Select, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import {
	ConnectivityType,
	RequestErrors,
	TableHeader,
	TimeRangeFilter,
} from 'components';
import { Label } from 'components/elements';
import {
	connectivityTypes,
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	MAX_PAGE_SIZE,
	pageSizeOptions,
	refetchOptions,
	timeRangeTypes,
} from 'global';
import { useBranchMachines, useConnectivityLogs, useQueryParams } from 'hooks';
import React, { useEffect, useState } from 'react';
import { useUserStore } from 'stores';
import {
	convertIntoArray,
	filterOption,
	formatDateTime,
	getLocalBranchId,
	isUserFromBranch,
} from 'utils';

const columns: ColumnsType = [
	{ title: 'Type', dataIndex: 'type' },
	{ title: 'Date & Time Created', dataIndex: 'datetime' },
];

export const TabBranchMachineConnectivityLogs = () => {
	// STATES
	const [dataSource, setDataSource] = useState([]);

	// CUSTOM HOOKS
	const { params, setQueryParams } = useQueryParams();
	const {
		data: { connectivityLogs, total },
		error: connectivityLogsError,
		isFetching: isFetchingConnectivityLogs,
		isFetched: isConnectivityLogsFetched,
	} = useConnectivityLogs({
		params: {
			// NOTE: We explicitly set the params to prevent multiple re-rerending because of the `tab` query parameter.
			...params,
			page: params?.page,
			pageSize: params?.pageSize,
		},
		options: refetchOptions,
	});

	// METHODS
	useEffect(() => {
		const data = connectivityLogs.map((connectivityLog) => ({
			key: connectivityLog.id,
			type: <ConnectivityType type={connectivityLog.type} />,
			datetime: formatDateTime(connectivityLog.datetime_created),
		}));

		setDataSource(data);
	}, [connectivityLogs]);

	return (
		<>
			<TableHeader title="Connectivity Logs" wrapperClassName="pt-2 px-0" />

			<Filter
				isLoading={isFetchingConnectivityLogs && !isConnectivityLogsFetched}
			/>

			<RequestErrors errors={convertIntoArray(connectivityLogsError)} />

			<Table
				columns={columns}
				dataSource={dataSource}
				loading={isFetchingConnectivityLogs && !isConnectivityLogsFetched}
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
				bordered
			/>
		</>
	);
};

interface FilterProps {
	isLoading: boolean;
}

const Filter = ({ isLoading }: FilterProps) => {
	const { params, setQueryParams } = useQueryParams();
	const user = useUserStore((state) => state.user);
	const {
		data: { branchMachines },
		isFetching: isFetchingBranchMachines,
		error: branchMachinesError,
	} = useBranchMachines({
		params: {
			branchId: isUserFromBranch(user.user_type)
				? getLocalBranchId()
				: params.branchId,
			pageSize: MAX_PAGE_SIZE,
		},
	});

	return (
		<>
			<RequestErrors
				errors={convertIntoArray(branchMachinesError, 'Branch Machines')}
				withSpaceBottom
			/>

			<Row className="mb-4" gutter={[16, 16]}>
				<Col lg={12} span={24}>
					<Label label="Branch Machine" spacing />
					<Select
						className="w-100"
						defaultValue={params.branchMachineId}
						filterOption={filterOption}
						loading={isFetchingBranchMachines}
						optionFilterProp="children"
						allowClear
						showSearch
						onChange={(value) => {
							setQueryParams(
								{ branchMachineId: value },
								{ shouldResetPage: true },
							);
						}}
					>
						{branchMachines.map(({ id, name }) => (
							<Select.Option key={id} value={id}>
								{name}
							</Select.Option>
						))}
					</Select>
				</Col>

				<Col lg={12} span={24}>
					<TimeRangeFilter
						disabled={isLoading}
						fields={[timeRangeTypes.DATE_RANGE]}
					/>
				</Col>
				<Col lg={12} span={24}>
					<Label label="Type" spacing />
					<Select
						className="w-100"
						disabled={isLoading}
						filterOption={filterOption}
						optionFilterProp="children"
						value={params.type}
						allowClear
						showSearch
						onChange={(value) => {
							setQueryParams({ type: value }, { shouldResetPage: true });
						}}
					>
						<Select.Option
							key={connectivityTypes.OFFLINE_TO_ONLINE}
							value={connectivityTypes.OFFLINE_TO_ONLINE}
						>
							Offline to Online
						</Select.Option>
						<Select.Option
							key={connectivityTypes.ONLINE_TO_OFFLINE}
							value={connectivityTypes.ONLINE_TO_OFFLINE}
						>
							Online to Offline
						</Select.Option>
					</Select>
				</Col>
			</Row>
		</>
	);
};
