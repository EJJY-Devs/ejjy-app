import { Button, Col, DatePicker, Row, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { RequestErrors, TableHeader, TransactionStatus } from 'components';
import { Label } from 'components/elements';
import {
	BranchMachine,
	getFullName,
	useTransactions,
	ViewTransactionModal,
} from 'ejjy-global';
import {
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	pageSizeOptions,
	timeRangeTypes,
	transactionStatuses,
} from 'global';
import { useQueryParams, useSiteSettingsNew } from 'hooks';
import _ from 'lodash';
import moment from 'moment';
import React, { useEffect, useMemo, useState } from 'react';
import {
	convertIntoArray,
	formatDateTime,
	formatInPeso,
	getLocalApiUrl,
} from 'utils';

const columns: ColumnsType = [
	{ title: 'Date & Time', dataIndex: 'dateTime' },
	{ title: 'OR Number', dataIndex: 'orNumber' },
	{ title: 'Total Amount', dataIndex: 'totalAmount' },
	{ title: 'Cashier', dataIndex: 'cashier' },
	{ title: 'Authorizer', dataIndex: 'authorizer' },
	{ title: 'Status', dataIndex: 'status' },
];

const voidedStatuses = [
	transactionStatuses.VOID_EDITED,
	transactionStatuses.VOID_CANCELLED,
].join(',');

type Props = {
	branchMachine: BranchMachine;
};

export const VoidedInvoiceReportTab = ({ branchMachine }: Props) => {
	// STATES
	const [dataSource, setDataSource] = useState([]);
	const [selectedTransaction, setSelectedTransaction] = useState<any | null>(
		null,
	);

	// CUSTOM HOOKS
	const { params, setQueryParams } = useQueryParams();
	const { data: siteSettings } = useSiteSettingsNew();
	const {
		data: transactionsData,
		error: transactionsError,
		isFetching: isFetchingTransactions,
		isFetchedAfterMount: isTransactionsFetchedAfterMount,
	} = useTransactions({
		params: {
			branchMachineId: branchMachine.id,
			timeRange: (params?.timeRange as string) || timeRangeTypes.DAILY,
			statuses: voidedStatuses,
			page: Number(params?.page) || DEFAULT_PAGE,
			pageSize: Number(params?.pageSize) || DEFAULT_PAGE_SIZE,
		},
		serviceOptions: { baseURL: getLocalApiUrl() },
	});

	// METHODS
	useEffect(() => {
		const transactions = transactionsData?.list || [];
		const rows = transactions.map((transaction: any) => ({
			key: transaction.id,
			dateTime: formatDateTime(transaction.datetime_created),
			orNumber: (
				<Button
					className="pa-0"
					type="link"
					onClick={() => setSelectedTransaction(transaction)}
				>
					{transaction.invoice?.or_number}
				</Button>
			),
			totalAmount: formatInPeso(transaction.total_amount),
			cashier: getFullName(transaction.teller),
			authorizer: getFullName(transaction.void_authorizer),
			status: <TransactionStatus transaction={transaction} />,
		}));

		setDataSource(rows);
	}, [transactionsData]);

	return (
		<>
			<TableHeader
				title="Voided Invoice Reports"
				wrapperClassName="pt-2 px-0"
			/>

			<Filter
				isLoading={isFetchingTransactions && !isTransactionsFetchedAfterMount}
			/>

			<RequestErrors errors={convertIntoArray(transactionsError)} />

			<Table
				columns={columns}
				dataSource={dataSource}
				loading={isFetchingTransactions && !isTransactionsFetchedAfterMount}
				pagination={{
					current: Number(params.page) || DEFAULT_PAGE,
					total: transactionsData?.total || 0,
					pageSize: Number(params.pageSize) || DEFAULT_PAGE_SIZE,
					onChange: (page, newPageSize) => {
						setQueryParams({ page, pageSize: newPageSize });
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
					serviceOptions={{ baseURL: getLocalApiUrl() }}
					siteSettings={siteSettings}
					transaction={selectedTransaction}
					onClose={() => setSelectedTransaction(null)}
				/>
			)}
		</>
	);
};

interface FilterProps {
	isLoading: boolean;
}

const Filter = ({ isLoading }: FilterProps) => {
	const { params, setQueryParams } = useQueryParams();

	const value = useMemo(
		() =>
			_.toString(params.timeRange).split(',')?.length === 2
				? moment(_.toString(params.timeRange).split(',')[0])
				: moment(),
		[params.timeRange],
	);

	return (
		<Row className="mb-4" gutter={[16, 16]}>
			<Col lg={12} span={24}>
				<Label label="Date" spacing />
				<DatePicker
					allowClear={false}
					disabled={isLoading}
					format="MM/DD/YY"
					value={value}
					onChange={(_date, dateString) => {
						setQueryParams(
							{ timeRange: [dateString, dateString].join(',') },
							{ shouldResetPage: true },
						);
					}}
				/>
			</Col>
		</Row>
	);
};
