import { Button, Col, Row, Table, Tag } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import {
	CreateOrderOfPaymentModal,
	RequestErrors,
	TableHeader,
	TimeRangeFilter,
} from 'components';
import {
	Transaction,
	ViewTransactionModal,
	getFullName,
	transactionStatuses,
} from 'ejjy-global';
import {
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	pageSizeOptions,
	paymentTypes,
	refetchOptions,
	timeRangeTypes,
} from 'global';
import { useQueryParams, useSiteSettingsNew, useTransactions } from 'hooks';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { convertIntoArray, formatDateTime, formatInPeso } from 'utils';
import { Payor } from 'utils/type';
import { accountTabs } from '../../data';
import { AccountTotalBalance } from './components/AccountTotalBalance';

type Props = {
	disabled: boolean;
};

const columns: ColumnsType = [
	{ title: 'Date & Time', dataIndex: 'datetime' },
	{ title: 'Client Code', dataIndex: 'clientCode' },
	{ title: 'Invoice Number', dataIndex: 'invoiceNumber' },
	{ title: 'Amount', dataIndex: 'amount' },
	{ title: 'Cashier', dataIndex: 'cashier' },
	{ title: 'Authorizer', dataIndex: 'authorizer' },
	{ title: 'Remarks', dataIndex: 'remarks' },
];

export const TabCreditTransactions = ({ disabled }: Props) => {
	// STATES
	const [dataSource, setDataSource] = useState([]);
	const [selectedTransaction, setSelectedTransaction] = useState(null);
	const [
		selectedCreditTransaction,
		setSelectedCreditTransaction,
	] = useState<Transaction | null>(null);
	const [
		isCreateOrderOfPaymentModalVisible,
		setIsCreateOrderOfPaymentModalVisible,
	] = useState(false);
	const [payor, setPayor] = useState<Payor | null>(null);

	// CUSTOM HOOKS
	const { params, setQueryParams } = useQueryParams();
	const { data: siteSettings } = useSiteSettingsNew();
	const {
		data: { transactions, total },
		isFetching: isFetchingTransactions,
		isFetched: isTransactionsFetched,
		error: transactionsError,
	} = useTransactions({
		params: {
			modeOfPayment: paymentTypes.CREDIT,
			payorCreditorAccountId: payor?.account?.id,
			timeRange: params?.timeRange || timeRangeTypes.DAILY,
			...params,
		},
		options: refetchOptions,
	});

	// METHODS
	useEffect(() => {
		const data = transactions.map((transaction) => {
			const {
				id,
				invoice,
				total_amount,
				teller,
				datetime_created,
				payment,
				status,
			} = transaction;

			let remarks = null;
			if (status === transactionStatuses.FULLY_PAID) {
				remarks = <Tag color="green">Completed</Tag>;
			} else if (status === transactionStatuses.VOID_CANCELLED) {
				remarks = <Tag color="red">Cancelled</Tag>;
			}

			return {
				key: id,
				datetime: formatDateTime(datetime_created),
				clientCode: payment?.creditor_account?.account_code,
				invoiceNumber: (
					<Button
						className="pa-0"
						type="link"
						onClick={() => setSelectedTransaction(transaction)}
					>
						{invoice.or_number}
					</Button>
				),
				amount: formatInPeso(total_amount),
				cashier: getFullName(teller),
				authorizer: getFullName(transaction.payment.credit_payment_authorizer),
				remarks,
			};
		});

		setDataSource(data);
	}, [transactions, payor, disabled]);

	useEffect(() => {
		if (params.payor) {
			setPayor(JSON.parse(_.toString(params.payor)));
		}
	}, [params.payor]);

	const handleCreateOrderOfPaymentsSuccess = () => {
		setQueryParams(
			{ tab: accountTabs.ORDER_OF_PAYMENTS },
			{ shouldResetPage: true, shouldIncludeCurrentParams: false },
		);
	};

	return (
		<div>
			<TableHeader title="Credit Transactions" wrapperClassName="pt-2 px-0" />

			{payor && (
				<AccountTotalBalance
					account={payor.account}
					disabled={disabled}
					totalBalance={payor.total_balance}
					onClick={() => setIsCreateOrderOfPaymentModalVisible(true)}
				/>
			)}

			<RequestErrors
				errors={convertIntoArray(transactionsError)}
				withSpaceBottom
			/>

			<Filter isLoading={isFetchingTransactions && !isTransactionsFetched} />

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
				scroll={{ x: 1000 }}
				bordered
			/>

			{selectedTransaction && (
				<ViewTransactionModal
					siteSettings={siteSettings}
					transaction={selectedTransaction}
					onClose={() => setSelectedTransaction(null)}
				/>
			)}

			{(selectedCreditTransaction || isCreateOrderOfPaymentModalVisible) && (
				<CreateOrderOfPaymentModal
					payor={payor}
					transaction={selectedCreditTransaction}
					onClose={() => {
						setSelectedCreditTransaction(null);
						setIsCreateOrderOfPaymentModalVisible(false);
					}}
					onSuccess={handleCreateOrderOfPaymentsSuccess}
				/>
			)}
		</div>
	);
};

type FilterProps = {
	isLoading: boolean;
};

const Filter = ({ isLoading }: FilterProps) => (
	<Row className="mb-4" gutter={[16, 16]}>
		<Col lg={12} span={24}>
			<TimeRangeFilter disabled={isLoading} />
		</Col>
	</Row>
);
