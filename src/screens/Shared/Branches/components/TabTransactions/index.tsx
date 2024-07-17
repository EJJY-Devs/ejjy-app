import { Button, Col, Row, Select, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import {
	RequestErrors,
	TableHeader,
	TimeRangeFilter,
	TransactionStatus,
} from 'components';
import { Label } from 'components/elements';
import {
	Branch,
	ViewTransactionModal,
	filterOption,
	useTransactions,
} from 'ejjy-global';
import {
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	MAX_PAGE_SIZE,
	pageSizeOptions,
	transactionStatuses,
} from 'global';
import { useBranchMachines, useQueryParams, useSiteSettingsNew } from 'hooks';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { convertIntoArray, formatInPeso, getId, getLocalApiUrl } from 'utils';
import { TransactionsCancelled } from './components/TransactionsCancelled';

const columns: ColumnsType = [
	{ title: 'Invoice', dataIndex: 'invoice' },
	{ title: 'Amount', dataIndex: 'amount' },
	{ title: 'Status', dataIndex: 'status' },
	{ title: 'Branch Machine', dataIndex: 'branchMachine' },
];

const transactionStatusOptions = [
	{
		value: transactionStatuses.NEW,
		title: 'New',
	},
	{
		value: transactionStatuses.HOLD,
		title: 'Hold',
	},
	{
		value: transactionStatuses.VOID_EDITED,
		title: 'Void Edited',
	},
	{
		value: transactionStatuses.VOID_CANCELLED,
		title: 'Void Cancelled',
	},
	{
		value: transactionStatuses.FULLY_PAID,
		title: 'Fully Paid',
	},
];

type Props = {
	branch: Branch;
};

export const TabTransactions = ({ branch }: Props) => {
	// STATES
	const [dataSource, setDataSource] = useState([]);
	const [selectedTransaction, setSelectedTransaction] = useState(null);

	// CUSTOM HOOKS
	const { params, setQueryParams } = useQueryParams();
	const { data: siteSettings } = useSiteSettingsNew();
	const {
		data: transactionsData,
		isFetching: isFetchingTransactions,
		error: transactionsError,
	} = useTransactions({
		params: {
			...params,
			branchId: branch.id,
		},
		serviceOptions: {
			baseURL: getLocalApiUrl(),
		},
	});

	// METHODS
	useEffect(() => {
		if (transactionsData?.list) {
			const data = transactionsData.list.map((transaction) => {
				const { id, invoice, total_amount, branch_machine } = transaction;

				return {
					key: id,
					invoice: (
						<Button
							className="pa-0"
							type="link"
							onClick={() => setSelectedTransaction(transaction)}
						>
							{invoice?.or_number}
						</Button>
					),
					amount: formatInPeso(total_amount),
					status: <TransactionStatus transaction={transaction} />,
					branchMachine: branch_machine.name,
				};
			});

			setDataSource(data);
		}
	}, [transactionsData]);

	return (
		<>
			<TableHeader title="Transactions" wrapperClassName="pt-2 px-0" />

			<Filter isLoading={isFetchingTransactions} />

			<RequestErrors errors={convertIntoArray(transactionsError)} />

			{[
				transactionStatuses.VOID_CANCELLED,
				transactionStatuses.VOID_EDITED,
			].includes(_.toString(params?.statuses)) && (
				<TransactionsCancelled
					branchId={getId(branch)}
					statuses={_.toString(params?.statuses)}
					timeRange={_.toString(params?.timeRange)}
				/>
			)}

			<Table
				columns={columns}
				dataSource={dataSource}
				loading={isFetchingTransactions}
				pagination={{
					current: Number(params.page) || DEFAULT_PAGE,
					total: transactionsData?.total || 0,
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

			{selectedTransaction && (
				<ViewTransactionModal
					siteSettings={siteSettings}
					transaction={selectedTransaction}
					onClose={() => setSelectedTransaction(false)}
				/>
			)}
		</>
	);
};

type FilterProps = {
	isLoading: boolean;
};

const Filter = ({ isLoading }: FilterProps) => {
	const { params, setQueryParams } = useQueryParams();
	const {
		data: { branchMachines },
		isFetching: isFetchingBranchMachines,
		error: branchMachinesError,
	} = useBranchMachines({
		params: { pageSize: MAX_PAGE_SIZE },
	});

	return (
		<>
			<RequestErrors
				errors={convertIntoArray(branchMachinesError, 'Branch Machines')}
				withSpaceBottom
			/>

			<Row className="mb-4" gutter={[16, 16]}>
				<Col lg={12} span={24}>
					<Label label="Status" spacing />
					<Select
						className="w-100"
						disabled={isLoading}
						filterOption={filterOption}
						optionFilterProp="children"
						value={params.statuses}
						allowClear
						showSearch
						onChange={(value) => {
							setQueryParams({ statuses: value }, { shouldResetPage: true });
						}}
					>
						{transactionStatusOptions.map((option) => (
							<Select.Option key={option.value} value={option.value}>
								{option.title}
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
					<TimeRangeFilter disabled={isLoading} />
				</Col>
			</Row>
		</>
	);
};
