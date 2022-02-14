import { Col, Row, Select, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { toString } from 'lodash';
import React, { useEffect, useState } from 'react';
import {
	RequestErrors,
	RequestWarnings,
	TableHeader,
	TimeRangeFilter,
} from '../../../../components';
import { ButtonLink, Label } from '../../../../components/elements';
import { EMPTY_CELL } from '../../../../global/constants';
import { pageSizeOptions } from '../../../../global/options';
import {
	request,
	timeRangeTypes,
	transactionStatus,
} from '../../../../global/types';
import { useQueryParams } from '../../../../hooks/useQueryParams';
import { useTimeRange } from '../../../../hooks/useTimeRange';
import { useTransactions } from '../../../../hooks/useTransactions';
import {
	convertIntoArray,
	getTransactionStatus,
	numberWithCommas,
} from '../../../../utils/function';
import { TransactionsCancelled } from '../../../Shared/Branches/components/BranchTransactions/TransactionsCancelled';
import { ViewTransactionModal } from '../../../Shared/Branches/components/BranchTransactions/ViewTransactionModal';

const columns: ColumnsType = [
	{ title: 'ID', dataIndex: 'id', key: 'id' },
	{ title: 'Invoice', dataIndex: 'invoice', key: 'invoice' },
	{ title: 'Amount', dataIndex: 'amount', key: 'amount' },
	{ title: 'Status', dataIndex: 'status', key: 'status' },
];

const transactionStatusOptions = [
	{
		value: transactionStatus.NEW,
		title: 'New',
	},
	{
		value: transactionStatus.HOLD,
		title: 'Hold',
	},
	{
		value: transactionStatus.VOID_EDITED,
		title: 'Void Edited',
	},
	{
		value: transactionStatus.VOID_CANCELLED,
		title: 'Void Cancelled',
	},
	{
		value: transactionStatus.FULLY_PAID,
		title: 'Fully Paid',
	},
];

interface Props {
	serverUrl: any;
}

export const ViewBranchTransactions = ({ serverUrl }: Props) => {
	// STATES
	const [data, setData] = useState([]);
	const [selectedTransaction, setSelectedTransaction] = useState(null);

	// CUSTOM HOOKS
	const {
		transactions,
		pageCount,
		currentPage,
		pageSize,

		listTransactions,
		status,
		errors,
		warnings,
	} = useTransactions();

	const { params: queryParams, setQueryParams } = useQueryParams({
		page: currentPage,
		pageSize,
		onParamsCheck: ({ timeRange }) => {
			const newParams = {};

			if (!toString(timeRange)) {
				// eslint-disable-next-line dot-notation
				newParams['timeRange'] = timeRangeTypes.DAILY;
			}

			return newParams;
		},
		onQueryParamChange: (params) => {
			listTransactions(
				{
					...params,
					serverUrl,
				},
				true,
			);
		},
	});

	// METHODS
	useEffect(() => {
		const formattedBranchTransactions = transactions.map(
			(branchTransaction) => {
				const {
					id,
					invoice,
					total_amount,
					status: branchTransactionStatus,
				} = branchTransaction;

				return {
					id: (
						<ButtonLink
							text={id}
							onClick={() => setSelectedTransaction(branchTransaction)}
						/>
					),
					invoice: invoice?.or_number || EMPTY_CELL,
					amount: `₱${numberWithCommas(total_amount?.toFixed(2))}`,
					status: getTransactionStatus(branchTransactionStatus),
				};
			},
		);

		setData(formattedBranchTransactions);
	}, [transactions]);

	return (
		<>
			<TableHeader title="Transactions" />

			<Filter
				params={queryParams}
				setQueryParams={(params) => {
					setQueryParams(params, { shouldResetPage: true });
				}}
				isLoading={status === request.REQUESTING}
			/>

			<RequestErrors errors={convertIntoArray(errors)} />
			<RequestWarnings warnings={convertIntoArray(warnings)} />

			{[
				transactionStatus.VOID_CANCELLED,
				transactionStatus.VOID_EDITED,
			].includes(toString(queryParams?.statuses)) && (
				<TransactionsCancelled
					serverUrl={serverUrl}
					timeRange={toString(queryParams?.timeRange)}
					statuses={toString(queryParams?.statuses)}
				/>
			)}

			<Table
				columns={columns}
				dataSource={data}
				scroll={{ x: 800 }}
				pagination={{
					current: currentPage,
					total: pageCount,
					pageSize,
					onChange: (page, newPageSize) => {
						setQueryParams({
							page,
							pageSize: newPageSize,
						});
					},
					disabled: !data,
					position: ['bottomCenter'],
					pageSizeOptions,
				}}
				loading={status === request.REQUESTING}
			/>

			{selectedTransaction && (
				<ViewTransactionModal
					transaction={selectedTransaction}
					onClose={() => setSelectedTransaction(false)}
				/>
			)}
		</>
	);
};

interface FilterProps {
	params: any;
	isLoading: boolean;
	setQueryParams: any;
}

const Filter = ({ params, isLoading, setQueryParams }: FilterProps) => {
	const { timeRangeType, setTimeRangeType } = useTimeRange({ params });

	return (
		<Row className="ViewBranchMachineTransactions_filter" gutter={[15, 15]}>
			<Col lg={12} span={24}>
				<TimeRangeFilter
					timeRange={params.timeRange}
					timeRangeType={timeRangeType}
					setTimeRangeType={setTimeRangeType}
					setQueryParams={setQueryParams}
					disabled={isLoading}
				/>
			</Col>
			<Col lg={12} span={24}>
				<Label label="Status" spacing />
				<Select
					style={{ width: '100%' }}
					value={params.statuses}
					onChange={(value) => {
						setQueryParams({ statuses: value });
					}}
					disabled={isLoading}
					allowClear
				>
					{transactionStatusOptions.map((option) => (
						<Select.Option key={option.value} value={option.value}>
							{option.title}
						</Select.Option>
					))}
				</Select>
			</Col>
		</Row>
	);
};