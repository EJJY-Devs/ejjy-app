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
	ViewTransactionModal,
	formatDateTime,
	getFullName,
	filterOption,
	useCollectionReceipts,
	CollectionReceipt,
	ViewCollectionReceiptModal,
} from 'ejjy-global';
import {
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	pageSizeOptions,
	refetchOptions,
	timeRangeTypes,
	transactionStatuses,
} from 'global';
import { useQueryParams, useSiteSettingsNew, useTransactions } from 'hooks';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { TransactionsCancelled } from 'screens/Shared/Branches/components/TabTransactions/components/TransactionsCancelled';
import { convertIntoArray, formatInPeso, getLocalApiUrl } from 'utils';
import { Summary } from './components/Summary';

const columns: ColumnsType = [
	{ title: 'Datetime', dataIndex: 'datetime' },
	{ title: 'Receipt Type', dataIndex: 'receipt_type' },
	{ title: 'Reference Number', dataIndex: 'invoice' },
	{ title: 'Payment', dataIndex: 'payment' },
	{ title: 'Cashier', dataIndex: 'cashier' },
	{ title: 'Mode of Payment', dataIndex: 'mode_of_payment' },
	{ title: 'Remarks', dataIndex: 'remarks' },
];

const invoiceTypes = {
	sales_invoice: 'Sales Invoice',
	charge_invoice: 'Charge Invoice',
};

const modeOfPayment = {
	cash: 'Cash',
	credit_card: 'Credit Pay',
	check: 'Check',
	others: 'Others',
};

const voidedStatuses = [
	transactionStatuses.VOID_CANCELLED,
	transactionStatuses.VOID_EDITED,
];

interface Props {
	branchMachineId: number;
}

export const TabPaymentsReceived = ({ branchMachineId }: Props) => {
	// STATES
	const [dataSource, setDataSource] = useState([]);
	const [selectedTransaction, setSelectedTransaction] = useState(null);
	const [
		selectedCollectionReceipt,
		setSelectedCollectionReceipt,
	] = useState<CollectionReceipt | null>(null);

	// CUSTOM HOOKS
	const { params, setQueryParams } = useQueryParams();
	const { data: siteSettings } = useSiteSettingsNew();
	const {
		data: { transactions, total },
		error: transactionsError,
		isFetching: isFetchingTransactions,
		isFetchedAfterMount: isTransactionsFetchedAfterMount,
	} = useTransactions({
		params: {
			...params,
			branchMachineId,
			timeRange: params?.timeRange || timeRangeTypes.DAILY,
		},
		options: refetchOptions,
	});

	const {
		data: collectionReceiptsData,
		isFetching: isFetchingCollectionReceipts,
		error: collectionReceiptsError,
	} = useCollectionReceipts({
		params: {
			...params,
			timeRange: (params?.timeRange || timeRangeTypes.DAILY) as string,
		},
		options: refetchOptions,
		serviceOptions: { baseURL: getLocalApiUrl() },
	});

	console.log(collectionReceiptsData);

	const receiptsArray = collectionReceiptsData?.list || [];

	const receiptsMap = {};
	receiptsArray.forEach((receipt) => {
		if (receipt.order_of_payment) {
			receiptsMap[receipt.order_of_payment.id] = receipt;
		}
	});

	// METHODS
	useEffect(() => {
		if (transactions && collectionReceiptsData) {
			// Convert transactions to table rows
			const transactionsData = transactions.map((transaction) => ({
				key: `transaction-${transaction.id}`,
				datetime: formatDateTime(transaction.datetime_created),
				receipt_type: 'Cash Sales Invoice',
				invoice: (
					<Button
						className="pa-0"
						type="link"
						onClick={() => setSelectedTransaction(transaction)}
					>
						{transaction.invoice?.or_number}
					</Button>
				),
				payment: formatInPeso(transaction.payment?.amount_tendered),
				cashier: getFullName(transaction.teller),
				mode_of_payment: transaction.payment?.mode,
				remarks: 'N/A',
			}));

			// Convert collection receipts to table rows
			const receiptsData = collectionReceiptsData.list.map((receipt) => ({
				key: `receipt-${receipt.id}`,
				datetime: formatDateTime(receipt.datetime_created),
				receipt_type: 'Collection Receipt',
				invoice: receipt.order_of_payment ? (
					<Button
						className="pa-0"
						type="link"
						onClick={() => setSelectedCollectionReceipt(receipt)}
					>
						{receipt.order_of_payment.id}
					</Button>
				) : (
					'N/A'
				),
				payment: formatInPeso(receipt.amount),
				cashier: getFullName(receipt.created_by),
				mode_of_payment: 'Cash',
				remarks: `OP: ${receipt.order_of_payment.id}`,
			}));

			// Merge transactions and receipts
			const mergedData = [...transactionsData, ...receiptsData];

			setDataSource(mergedData);
		}
	}, [transactions, collectionReceiptsData]);

	return (
		<>
			<TableHeader title="Payments Received" wrapperClassName="pt-2 px-0" />

			<RequestErrors errors={convertIntoArray(transactionsError)} />

			<Filter
				isLoading={isFetchingTransactions && !isTransactionsFetchedAfterMount}
			/>

			{voidedStatuses.includes(_.toString(params?.statuses)) && (
				<TransactionsCancelled
					statuses={_.toString(params?.statuses)}
					timeRange={_.toString(params?.timeRange)}
				/>
			)}

			<Summary branchMachineId={branchMachineId} />

			<Table
				columns={columns}
				dataSource={dataSource}
				loading={isFetchingTransactions && !isTransactionsFetchedAfterMount}
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

			{selectedTransaction && (
				<ViewTransactionModal
					siteSettings={siteSettings}
					transaction={selectedTransaction}
					onClose={() => setSelectedTransaction(false)}
				/>
			)}
			{selectedCollectionReceipt && siteSettings && (
				<ViewCollectionReceiptModal
					collectionReceipt={selectedCollectionReceipt}
					siteSettings={siteSettings}
					onClose={() => setSelectedCollectionReceipt(null)}
				/>
			)}
		</>
	);
};

interface FilterProps {
	isLoading: boolean;
}

const Filter = ({ isLoading }: FilterProps) => {
	return (
		<Row className="mb-4" gutter={[16, 16]}>
			<Col lg={12} span={24}>
				<TimeRangeFilter disabled={isLoading} />
			</Col>
		</Row>
	);
};
