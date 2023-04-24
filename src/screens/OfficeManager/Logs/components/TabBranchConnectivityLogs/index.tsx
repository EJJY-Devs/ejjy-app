import { Col, Row, Select, Table, Tooltip } from 'antd';
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
	timeRangeTypes,
} from 'global';
import {
	useBranches,
	useBranchMachines,
	useConnectivityLogs,
	useQueryParams,
} from 'hooks';
import React, { useEffect, useState } from 'react';
import { convertIntoArray, filterOption, formatDateTime } from 'utils';

export const TabBranchConnectivityLogs = () => {
	// VARIABLES
	const columns: ColumnsType = [
		{
			title: () => (
				<Tooltip title="Connectivity between HeadOffice and BackOffice">
					Branch (HO ⇆ BO)
				</Tooltip>
			),
			dataIndex: 'branch',
		},
		{
			title: () => (
				<Tooltip title="Connectivity between BackOffice and Branch Machine">
					Machine (BO ⇆ Cashiering)
				</Tooltip>
			),
			dataIndex: 'branchMachine',
		},
		{ title: 'Type', dataIndex: 'type' },
		{ title: 'Date & Time Created', dataIndex: 'datetime' },
	];

	// STATES
	const [dataSource, setDataSource] = useState([]);

	// CUSTOM HOOKS
	const { params, setQueryParams } = useQueryParams();
	const {
		data: { connectivityLogs, total },
		isFetching: isFetchingConnectivityLogs,
		error: connectivityLogsError,
	} = useConnectivityLogs({ params });

	// METHODS
	useEffect(() => {
		const data = connectivityLogs.map((connectivityLog) => ({
			key: connectivityLog.id,
			branch: connectivityLog.branch?.name,
			branchMachine: connectivityLog.branch_machine?.name,
			type: <ConnectivityType type={connectivityLog.type} />,
			datetime: formatDateTime(connectivityLog.datetime_created),
		}));

		setDataSource(data);
	}, [connectivityLogs]);

	return (
		<>
			<TableHeader title="Connectivity Logs" wrapperClassName="pt-2 px-0" />

			<Filter isLoading={isFetchingConnectivityLogs} />

			<RequestErrors errors={convertIntoArray(connectivityLogsError)} />

			<Table
				columns={columns}
				dataSource={dataSource}
				loading={isFetchingConnectivityLogs}
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
	// CUSTOM HOOKS
	const { params, setQueryParams } = useQueryParams();
	const {
		data: { branches },
		isFetching: isFetchingBranches,
		error: branchErrors,
	} = useBranches({
		params: { pageSize: MAX_PAGE_SIZE },
	});
	const {
		data: { branchMachines },
		isFetching: isFetchingBranchMachines,
		error: branchMachinesError,
	} = useBranchMachines({
		params: {
			branchId: params.branchId,
			pageSize: MAX_PAGE_SIZE,
		},
	});

	return (
		<div>
			<RequestErrors
				errors={[
					...convertIntoArray(branchErrors, 'Branches'),
					...convertIntoArray(branchMachinesError, 'Branch Machines'),
				]}
				withSpaceBottom
			/>

			<Row className="mb-4" gutter={[16, 16]}>
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
					<Label label="Type" spacing />
					<Select
						className="w-100"
						disabled={isLoading || isFetchingBranches}
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

				<Col lg={12} span={24}>
					<TimeRangeFilter
						disabled={isLoading}
						fields={[timeRangeTypes.DATE_RANGE]}
					/>
				</Col>
			</Row>
		</div>
	);
};
