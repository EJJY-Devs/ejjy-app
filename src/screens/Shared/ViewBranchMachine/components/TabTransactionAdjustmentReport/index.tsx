import { Button, Col, DatePicker, Descriptions, Row, Space, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import {
	ModeOfPayment,
	RequestErrors,
	TableHeader,
	TransactionStatus,
	ViewBackOrderModal,
	ViewTransactionModal,
} from 'components';
import { Label } from 'components/elements';
import { PdfButtons } from 'components/Printing';
import { printAdjustmentReport } from 'configurePrinter';
import {
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	pageSizeOptions,
	refetchOptions,
	timeRangeTypes,
	transactionStatus,
} from 'global';
import { usePdf, useQueryParams, useTransactions } from 'hooks';
import _ from 'lodash';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useUserStore } from 'stores';
import {
	convertIntoArray,
	formatDateTime,
	formatInPeso,
	getFullName,
} from 'utils';

const columns: ColumnsType = [
	{ title: 'Date & Time', dataIndex: 'dateTime' },
	{ title: 'Invoice Number', dataIndex: 'invoiceNumber' },
	{ title: 'Invoice Type', dataIndex: 'invoiceType' },
	{ title: 'Payment', dataIndex: 'payment' },
	{ title: 'Remarks', dataIndex: 'remarks' },
	{ title: 'Total Amount', dataIndex: 'totalAmount' },
	{ title: 'Cashier', dataIndex: 'cashier' },
	{ title: 'Authorizer', dataIndex: 'authorizer' },
];

interface Props {
	branchMachineId: number;
}

export const TabTransactionAdjustmentReport = ({ branchMachineId }: Props) => {
	// STATES
	const [dataSource, setDataSource] = useState([]);
	const [selectedTransaction, setSelectedTransaction] = useState(null);
	const [selectedBackOrder, setSelectedBackOrder] = useState(null);

	// CUSTOM HOOKS
	const user = useUserStore((state) => state.user);
	const { params, setQueryParams } = useQueryParams();
	const {
		data: { transactions, total },
		error: transactionsError,
		isFetching: isFetchingTransactions,
		isFetched: isTransactionsFetched,
	} = useTransactions({
		params: {
			isAdjusted: true,
			branchMachineId,
			timeRange: timeRangeTypes.DAILY,
			...params,
		},
		options: refetchOptions,
	});
	const { htmlPdf, isLoadingPdf, previewPdf, downloadPdf } = usePdf({
		title: 'TransactionAdjustmentReport.pdf',
		jsPdfSettings: {
			orientation: 'l',
			unit: 'px',
			format: [1225, 840],
			hotfixes: ['px_scaling'],
			putOnlyUsedFonts: true,
		},
		print: () => printAdjustmentReport({ transactions, user }),
	});

	// METHODS
	useEffect(() => {
		const data = transactions.map((transaction) => {
			const backOrder = transaction?.adjustment_remarks?.back_order;
			const newTransaction =
				transaction?.adjustment_remarks?.new_updated_transaction;
			const discountOption = transaction?.adjustment_remarks?.discount_option;

			const remarks = (
				<Space direction="vertical">
					{backOrder && (
						<Button
							type="link"
							onClick={() => setSelectedBackOrder(backOrder.id)}
						>
							Back Order - {backOrder.id}
						</Button>
					)}
					{transaction.status === transactionStatus.VOID_CANCELLED && (
						<TransactionStatus status={transaction.status} />
					)}
					{newTransaction && (
						<Button
							type="link"
							onClick={() => setSelectedTransaction(newTransaction.id)}
						>
							New Invoice - {newTransaction.invoice.or_number}
						</Button>
					)}
					{discountOption && (
						<Descriptions column={1} size="small" bordered>
							<Descriptions.Item label="Name">
								{discountOption.name}
							</Descriptions.Item>
							<Descriptions.Item label="Type">
								{_.upperFirst(discountOption.type)}{' '}
								{discountOption.percentage > 0
									? `${discountOption.percentage}%`
									: ''}
							</Descriptions.Item>
							<Descriptions.Item label="Amount">
								{formatInPeso(transaction.overall_discount)}
							</Descriptions.Item>
						</Descriptions>
					)}
				</Space>
			);

			return {
				key: transaction.id,
				dateTime: formatDateTime(transaction.invoice.datetime_created),
				invoiceNumber: (
					<Button
						type="link"
						onClick={() => setSelectedTransaction(transaction)}
					>
						{transaction.invoice.or_number}
					</Button>
				),
				invoiceType: <ModeOfPayment modeOfPayment={transaction.payment.mode} />,
				payment: (
					<>
						<span>
							{transaction?.is_fully_paid ? 'Fully Paid' : 'Pending'}{' '}
						</span>
						(<ModeOfPayment modeOfPayment={transaction.payment.mode} />)
					</>
				),
				remarks,
				totalAmount: formatInPeso(transaction.total_amount),
				cashier: getFullName(transaction.teller),
				authorizer: getFullName(transaction.void_authorizer),
			};
		});

		setDataSource(data);
	}, [transactions]);

	return (
		<>
			<TableHeader
				buttons={
					<PdfButtons
						key="pdf"
						downloadPdf={downloadPdf}
						isDisabled={dataSource.length === 0 || isLoadingPdf}
						previewPdf={previewPdf}
					/>
				}
				title="Transaction Adjustment Report"
				wrapperClassName="pt-2 px-0"
			/>

			<Filter isLoading={isFetchingTransactions && !isTransactionsFetched} />

			<RequestErrors errors={convertIntoArray(transactionsError)} />

			<Table
				columns={columns}
				dataSource={dataSource}
				loading={isFetchingTransactions && !isTransactionsFetched}
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
				scroll={{ x: 1200 }}
				bordered
			/>

			{selectedTransaction && (
				<ViewTransactionModal
					transaction={selectedTransaction}
					onClose={() => setSelectedTransaction(null)}
				/>
			)}

			{selectedBackOrder && (
				<ViewBackOrderModal
					backOrder={selectedBackOrder}
					onClose={() => setSelectedBackOrder(null)}
				/>
			)}

			<div
				// eslint-disable-next-line react/no-danger
				dangerouslySetInnerHTML={{ __html: htmlPdf }}
				style={{ display: 'none' }}
			/>
		</>
	);
};

interface FilterProps {
	isLoading: boolean;
}

const Filter = ({ isLoading }: FilterProps) => {
	const { params, setQueryParams } = useQueryParams();

	return (
		<Row className="mb-4" gutter={[16, 16]}>
			<Col lg={12} span={24}>
				<Label label="Date" spacing />
				<DatePicker
					allowClear={false}
					disabled={isLoading}
					format="MM/DD/YY"
					value={
						_.toString(params.timeRange).split(',')?.length === 2
							? moment(_.toString(params.timeRange).split(',')[0])
							: moment()
					}
					onChange={(date, dateString) => {
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
