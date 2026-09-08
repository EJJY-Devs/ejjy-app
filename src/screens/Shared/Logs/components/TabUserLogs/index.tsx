import { Col, Row, Select, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { RequestErrors, TableHeader, TimeRangeFilter } from 'components';
import { Label } from 'components/elements';
import {
	filterOption,
	getFullName,
	ServiceType,
	transactionStatuses,
	useUsers,
} from 'ejjy-global';
import {
	appTypes,
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	EMPTY_CELL,
	MAX_PAGE_SIZE,
	pageSizeOptions,
	serviceTypes,
} from 'global';
import {
	useBranches,
	useBranchMachines,
	useQueryParams,
	useTransactions,
	useUserLogs,
} from 'hooks';
import React, { useEffect, useState } from 'react';
import {
	convertIntoArray,
	formatDateTimeExtended,
	getAppType,
	getLocalApiUrl,
	getLocalBranchId,
	isStandAlone,
} from 'utils';

const columns: ColumnsType = [
	{
		title: 'Branch Machine',
		dataIndex: 'branchMachine',
	},
	{ title: 'User', dataIndex: 'user' },
	{ title: 'Description', dataIndex: 'description' },
	{ title: 'Date & Time', dataIndex: 'datetimeCreated' },
];

export const TabUserLogs = () => {
	// STATES
	const [dataSource, setDataSource] = useState([]);

	// CUSTOM HOOKS
	const { params, setQueryParams } = useQueryParams();

	const resolvedBranchId =
		getAppType() === appTypes.BACK_OFFICE
			? getLocalBranchId()
			: params?.branchId;

	const {
		data: { logs, total },
		isFetching: isFetchingLogs,
		error: logsError,
	} = useUserLogs({
		params: {
			...params,
			branchId: resolvedBranchId,
			serviceType: isStandAlone() ? undefined : serviceTypes.OFFLINE,
		},
	});

	// Cancelled transactions are surfaced here so the log shows *who* cancelled
	// them (the teller who performed the cancellation).
	const {
		data: { transactions: cancelledTransactions, total: cancelledTotal },
		isFetching: isFetchingCancelled,
		error: cancelledError,
	} = useTransactions({
		params: {
			statuses: transactionStatuses.CANCELLED,
			branchId: resolvedBranchId,
			branchMachineId: params?.branchMachineId,
			timeRange: params?.timeRange,
			page: params?.page,
			pageSize: params?.pageSize,
		},
	});

	// Voided transactions show *who* voided them (the void authorizer), which is
	// a different action and a different acting user than a cancellation.
	const {
		data: { transactions: voidedTransactions, total: voidedTotal },
		isFetching: isFetchingVoided,
		error: voidedError,
	} = useTransactions({
		params: {
			statuses: transactionStatuses.VOID_CANCELLED,
			branchId: resolvedBranchId,
			branchMachineId: params?.branchMachineId,
			timeRange: params?.timeRange,
			page: params?.page,
			pageSize: params?.pageSize,
		},
	});

	// METHODS
	useEffect(() => {
		const logRows = logs.map((log) => ({
			key: `log-${log.id}`,
			ts: new Date(log.datetime_created).getTime(),
			branchMachine: log?.branch_machine?.name || EMPTY_CELL,
			user: getFullName(log.acting_user),
			description: log.description,
			datetimeCreated: formatDateTimeExtended(log.datetime_created),
		}));

		const cancelledRows = cancelledTransactions.map((transaction) => ({
			key: `cancelled-${transaction.id}`,
			ts: new Date(transaction.datetime_created).getTime(),
			branchMachine: transaction?.branch_machine?.name || EMPTY_CELL,
			user: getFullName(transaction.teller),
			description: `Cancelled Transaction (id = ${transaction.unique_transaction_id})`,
			datetimeCreated: formatDateTimeExtended(transaction.datetime_created),
		}));

		const voidedRows = voidedTransactions.map((transaction) => {
			const voidedAt =
				transaction.void_datetime || transaction.datetime_created;

			return {
				key: `voided-${transaction.id}`,
				ts: new Date(voidedAt).getTime(),
				branchMachine: transaction?.branch_machine?.name || EMPTY_CELL,
				user: getFullName(transaction.void_authorizer || transaction.teller),
				description: `Voided Transaction (id = ${transaction.unique_transaction_id})`,
				datetimeCreated: formatDateTimeExtended(voidedAt),
			};
		});

		const data = [...logRows, ...cancelledRows, ...voidedRows].sort(
			(a, b) => b.ts - a.ts,
		);

		setDataSource(data);
	}, [logs, cancelledTransactions, voidedTransactions]);

	return (
		<div>
			<TableHeader title="User Logs" wrapperClassName="pt-2 px-0" />

			<RequestErrors
				errors={[
					...convertIntoArray(logsError, 'Logs'),
					...convertIntoArray(cancelledError, 'Cancelled Transactions'),
					...convertIntoArray(voidedError, 'Voided Transactions'),
				]}
				withSpaceBottom
			/>

			<Filter />

			<Table
				columns={columns}
				dataSource={dataSource}
				loading={isFetchingLogs || isFetchingCancelled || isFetchingVoided}
				pagination={{
					current: Number(params.page) || DEFAULT_PAGE,
					total: total + cancelledTotal + voidedTotal,
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
				scroll={{ x: 1000 }}
				bordered
			/>
		</div>
	);
};

const Filter = () => {
	const { params, setQueryParams } = useQueryParams();
	const branchId = params.branchId ? Number(params.branchId) : undefined;

	const {
		data: { branches },
		isFetching: isFetchingBranches,
		error: branchesError,
	} = useBranches({
		params: { pageSize: MAX_PAGE_SIZE },
		options: { enabled: getAppType() !== appTypes.BACK_OFFICE },
	});
	const {
		data: { branchMachines },
		isFetching: isFetchingBranchMachines,
		error: branchMachinesError,
	} = useBranchMachines({
		params: {
			branchId:
				getAppType() === appTypes.BACK_OFFICE
					? getLocalBranchId()
					: params.branchId,
			pageSize: MAX_PAGE_SIZE,
		},
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
					...convertIntoArray(branchesError, 'Branches'),
					...convertIntoArray(branchMachinesError, 'Branch Machines'),
					...convertIntoArray(usersError, 'Users'),
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

				<Col md={12}>
					<Label label="User" spacing />
					<Select
						className="w-100"
						defaultValue={params.creatingUserId}
						filterOption={filterOption}
						loading={isFetchingUsers}
						optionFilterProp="children"
						allowClear
						showSearch
						onChange={(value) => {
							setQueryParams(
								{ creatingUserId: value },
								{ shouldResetPage: true },
							);
						}}
					>
						{usersData?.list.map((u) => (
							<Select.Option key={u.id} value={u.id}>
								{getFullName(u)}
							</Select.Option>
						))}
					</Select>
				</Col>

				<Col md={12}>
					<TimeRangeFilter />
				</Col>
			</Row>
		</>
	);
};
