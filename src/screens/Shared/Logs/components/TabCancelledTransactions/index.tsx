import { Col, Row, Select, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { RequestErrors, TableHeader, TimeRangeFilter } from 'components';
import { Label } from 'components/elements';
import { filterOption, getFullName, transactionStatuses } from 'ejjy-global';
import {
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	EMPTY_CELL,
	MAX_PAGE_SIZE,
	pageSizeOptions,
	refetchOptions,
	timeRangeTypes,
} from 'global';
import {
	useBranches,
	useBranchMachines,
	useQueryParams,
	useTransactions,
} from 'hooks';
import React, { useEffect, useState } from 'react';
import { useUserStore } from 'stores';
import {
	convertIntoArray,
	formatDateTimeExtended,
	getLocalBranchId,
	isUserFromBranch,
} from 'utils';

const columns: ColumnsType = [
	{ title: 'Transaction Number', dataIndex: 'transactionNumber' },
	{ title: 'Date & Time', dataIndex: 'datetimeCreated' },
	{ title: 'Branch', dataIndex: 'branch' },
	{ title: 'Branch Machine', dataIndex: 'branchMachine' },
	{ title: 'Cashier', dataIndex: 'cashier' },
];

interface Props {
	branchId?: number;
}

export const TabCancelledTransactions = ({ branchId = null }: Props) => {
	// STATES
	const [dataSource, setDataSource] = useState([]);
	// CUSTOM HOOKS
	const { params, setQueryParams } = useQueryParams();

	const {
		data: { transactions, total },
		error: transactionsError,
		isFetching: isFetchingTransactions,
		isFetched: isTransactionsFetched,
	} = useTransactions({
		params: {
			statuses: transactionStatuses.CANCELLED,
			branchId,
			timeRange: timeRangeTypes.DAILY,
			...params,
		},
		options: refetchOptions,
	});

	// METHODS
	useEffect(() => {
		const data = transactions.map((transaction) => ({
			key: transaction.id,
			datetimeCreated: formatDateTimeExtended(transaction.datetime_created),
			transactionNumber: transaction.id,
			branchMachine: transaction?.branch_machine?.name || EMPTY_CELL,
			branch: transaction?.branch_machine?.branch.name || EMPTY_CELL,
			cashier: getFullName(transaction.teller),
		}));

		setDataSource(data);
	}, [transactions]);

	return (
		<div>
			<TableHeader
				title="Cancelled Transactions"
				wrapperClassName="pt-2 px-0"
			/>

			<RequestErrors
				errors={convertIntoArray(transactionsError, 'Logs')}
				withSpaceBottom
			/>

			<Filter isLoading={isFetchingTransactions && !isTransactionsFetched} />

			<Table
				columns={columns}
				dataSource={dataSource}
				loading={isFetchingTransactions}
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
				scroll={{ x: 1000 }}
				bordered
			/>
		</div>
	);
};

interface FilterProps {
	isLoading: boolean;
}

const Filter = ({ isLoading }: FilterProps) => {
	const { params, setQueryParams } = useQueryParams();

	const user = useUserStore((state) => state.user);
	const {
		data: { branches },
		isFetching: isFetchingBranches,
		error: branchesError,
	} = useBranches({
		params: { pageSize: MAX_PAGE_SIZE },
		options: { enabled: !isUserFromBranch(user.user_type) },
	});
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
				errors={[
					...convertIntoArray(branchesError, 'Branches'),
					...convertIntoArray(branchMachinesError, 'Branch Machines'),
				]}
				withSpaceBottom
			/>

			<Row className="mb-4" gutter={[16, 16]}>
				{!isUserFromBranch(user.user_type) && (
					<Col md={12}>
						<Label label="Branch" spacing />
						<Select
							className="w-100"
							disabled={isLoading}
							filterOption={filterOption}
							loading={isFetchingBranches}
							optionFilterProp="children"
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
					<TimeRangeFilter />
				</Col>

				<Col md={12}>
					<Label label="Branch Machine" spacing />
					<Select
						className="w-100"
						defaultValue={params.branchMachineId}
						disabled={isLoading}
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
			</Row>
		</>
	);
};
