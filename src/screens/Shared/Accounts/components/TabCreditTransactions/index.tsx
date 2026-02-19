import { Button, Col, Row, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import {
	CreateOrderOfPaymentModal,
	RequestErrors,
	TableHeader,
	TimeRangeFilter,
} from 'components';
import {
	CollectionReceipt,
	EMPTY_CELL,
	formatDateTime,
	getFullName,
	timeRangeTypes,
	useAccounts,
	useCollectionReceipts,
	useOrderOfPayments,
	useTransactions,
	ViewCollectionReceiptModal,
	ViewOrderOfPaymentModal,
	ViewTransactionModal,
} from 'ejjy-global';
import {
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	pageSizeOptions,
	paymentTypes,
	appTypes,
} from 'global';
import { useQueryParams, useSiteSettingsNew } from 'hooks';
import React, { useEffect, useState, useMemo } from 'react';
import {
	convertIntoArray,
	formatInPeso,
	getLocalApiUrl,
	getAppType,
} from 'utils';
import { Payor } from 'utils/type';
import { AccountTotalBalance } from './components/AccountTotalBalance';
import { accountTabs } from '../../data';

export const TabCreditTransactions = () => {
	// STATES
	const [dataSource, setDataSource] = useState([]);
	const [selectedTransaction, setSelectedTransaction] = useState(null);
	const [
		selectedCollectionReceipt,
		setSelectedCollectionReceipt,
	] = useState<CollectionReceipt | null>(null);
	const [selectedOrderOfPayment, setSelectedOrderOfPayment] = useState<
		any | null
	>(null);
	const [selectedAccount, setSelectedAccount] = useState(null);
	const [
		isCreateOrderOfPaymentModalVisible,
		setIsCreateOrderOfPaymentModalVisible,
	] = useState(false);

	// CUSTOM HOOKS
	const { params, setQueryParams } = useQueryParams();
	const { data: siteSettings } = useSiteSettingsNew();

	// TABLE COLUMNS
	const columns: ColumnsType = useMemo(() => {
		const hasSelectedAccount = !!params.payorId;

		if (!hasSelectedAccount) {
			// Columns for Credit Transactions tab (without account)
			return [
				{ title: 'Date & Time', dataIndex: 'datetime', width: 180 },
				{
					title: 'Client Name',
					dataIndex: 'clientName',
					width: 200,
					align: 'left',
				},
				{
					title: 'Invoice Number',
					dataIndex: 'invoiceNumber',
					width: 150,
					align: 'left',
					render: (text, record: any) => {
						if (record.type === 'credit_transaction') {
							return (
								<Button
									className="pa-0"
									type="link"
									onClick={() =>
										record.referenceData &&
										setSelectedTransaction(record.referenceData)
									}
								>
									{text}
								</Button>
							);
						}
						return text;
					},
				},
				{ title: 'Amount', dataIndex: 'amount', width: 120, align: 'left' },
				{ title: 'Cashier', dataIndex: 'cashier', width: 150, align: 'left' },
				{
					title: 'Authorizer',
					dataIndex: 'authorizer',
					width: 150,
					align: 'left',
				},
			];
		}

		// Columns for Account Transaction History (with account selected)
		return [
			{ title: 'Date & Time', dataIndex: 'datetime', width: 180 },
			{
				title: 'Reference Number',
				dataIndex: 'referenceNumber',
				width: 150,
				align: 'left',
				render: (text, record: any) => {
					if (record.type === 'credit_transaction') {
						return (
							<Button
								className="pa-0"
								type="link"
								onClick={() =>
									record.referenceData &&
									setSelectedTransaction(record.referenceData)
								}
							>
								{text}
							</Button>
						);
					}
					if (record.type === 'collection_receipt') {
						return (
							<Button
								className="pa-0"
								type="link"
								onClick={() =>
									record.referenceData &&
									setSelectedCollectionReceipt(record.referenceData)
								}
							>
								{text}
							</Button>
						);
					}
					if (record.type === 'order_of_payment') {
						return (
							<Button
								className="pa-0"
								type="link"
								onClick={() =>
									record.referenceData &&
									setSelectedOrderOfPayment(record.referenceData)
								}
							>
								{text}
							</Button>
						);
					}
					return text;
				},
			},
			{ title: 'Amount', dataIndex: 'amount', width: 120, align: 'left' },
			{ title: 'Cashier', dataIndex: 'cashier', width: 150, align: 'left' },
			{
				title: 'Authorizer',
				dataIndex: 'authorizer',
				width: 150,
				align: 'left',
			},
			{ title: 'Remarks', dataIndex: 'remarks', width: 150, align: 'left' },
			{
				title: 'Balance',
				dataIndex: 'outstandingBalance',
				width: 150,
				align: 'left',
			},
		];
	}, [params.payorId, setSelectedTransaction, setSelectedCollectionReceipt]);

	// Get account details when payorId is present
	const { data: accountsData } = useAccounts({
		params: {
			withCreditRegistration: true,
		},
		serviceOptions: { baseURL: getLocalApiUrl() },
	}) as any;

	// Fetch Credit Transactions
	const {
		data: transactionsResponse,
		isFetching: isFetchingTransactions,
		error: transactionsError,
	} = useTransactions({
		params: {
			modeOfPayment: paymentTypes.CREDIT as any,
			payorCreditorAccountId: params.payorId
				? Number(params.payorId)
				: undefined,
			timeRange: (params?.timeRange || timeRangeTypes.DAILY) as string,
			pageSize: DEFAULT_PAGE_SIZE * 3,
			...params,
		},
		serviceOptions: { baseURL: getLocalApiUrl() },
	}) as any;

	const transactions = useMemo(() => transactionsResponse?.list || [], [
		transactionsResponse?.list,
	]);

	// Fetch Order of Payments - only when account is selected
	const {
		data: orderOfPaymentsData,
		isFetching: isFetchingOrderOfPayments,
		error: orderOfPaymentsError,
	} = useOrderOfPayments({
		params: {
			payorId: params.payorId ? Number(params.payorId) : undefined,
			timeRange: (params?.timeRange || timeRangeTypes.DAILY) as string,
			pageSize: DEFAULT_PAGE_SIZE * 3,
			...params,
		},
		serviceOptions: {
			baseURL: getLocalApiUrl(),
		},
		options: {
			enabled: !!params.payorId, // Only fetch when account is selected
		},
	});

	// Fetch Collection Receipts - only when account is selected
	const {
		data: collectionReceiptsData,
		isFetching: isFetchingCollectionReceipts,
		error: collectionReceiptsError,
	} = useCollectionReceipts({
		params: {
			payorId: params.payorId ? Number(params.payorId) : undefined,
			timeRange: (params?.timeRange || timeRangeTypes.DAILY) as string,
			pageSize: DEFAULT_PAGE_SIZE * 3,
			...params,
		},
		options: {
			enabled: !!params.payorId, // Only fetch when account is selected
		},
		serviceOptions: { baseURL: getLocalApiUrl() },
	});

	// METHODS
	useEffect(() => {
		const hasSelectedAccount = !!params.payorId;

		// For tab without account selected, only process if we have transactions
		// For tab with account selected, process if we have any data
		if (!hasSelectedAccount && !transactions) {
			setDataSource([]);
			return;
		}

		if (
			hasSelectedAccount &&
			!transactions &&
			!orderOfPaymentsData?.list &&
			!collectionReceiptsData?.list
		) {
			return;
		}

		const combinedData = [];

		// Process Credit Transactions
		if (transactions) {
			const creditTransactionData = transactions.map((transaction) => {
				const {
					id,
					invoice,
					total_amount,
					teller,
					datetime_created,
					payment,
				} = transaction;

				return {
					key: `credit-${id}`,
					datetime: formatDateTime(datetime_created),
					rawDatetime: datetime_created,
					clientCode: payment?.creditor_account?.account_code || '',
					clientName: getFullName(payment?.creditor_account) || '',
					invoiceNumber: invoice?.or_number || '',
					referenceNumber: invoice?.or_number,
					referenceData: transaction,
					amount: formatInPeso(total_amount),
					cashier: getFullName(teller),
					authorizer: getFullName(payment?.credit_payment_authorizer),
					remarks: 'Charge Invoice',
					type: 'credit_transaction',
					outstandingBalance: formatInPeso(0), // Will be calculated later
				};
			});
			combinedData.push(...creditTransactionData);
		}

		// Only process Order of Payments and Collection Receipts when account is selected
		if (hasSelectedAccount) {
			// Process Order of Payments
			if (orderOfPaymentsData?.list) {
				const orderOfPaymentData = orderOfPaymentsData.list.map(
					(orderOfPayment) => {
						const {
							id,
							reference_number,
							datetime_created,
							amount,
							payor,
							created_by,
						} = orderOfPayment;

						return {
							key: `op-${id}`,
							datetime: formatDateTime(datetime_created),
							rawDatetime: datetime_created,
							clientCode: payor?.account_code || '',
							clientName: getFullName(payor) || '',
							invoiceNumber: '',
							referenceNumber: reference_number || EMPTY_CELL,
							referenceData: orderOfPayment,
							amount: formatInPeso(amount),
							cashier: getFullName(created_by),
							authorizer: getFullName(created_by),
							remarks: 'Order of Payment',
							type: 'order_of_payment',
							outstandingBalance: formatInPeso(0), // Will be calculated later
						};
					},
				);
				combinedData.push(...orderOfPaymentData);
			}

			// Process Collection Receipts
			if (collectionReceiptsData?.list) {
				const collectionReceiptData = collectionReceiptsData.list.map(
					(collectionReceipt) => {
						const {
							id,
							reference_number,
							amount,
							order_of_payment,
							datetime_created,
							created_by,
						} = collectionReceipt;

						return {
							key: `cr-${id}`,
							datetime: formatDateTime(datetime_created),
							rawDatetime: datetime_created,
							clientCode: order_of_payment?.payor?.account_code || '',
							clientName: getFullName(order_of_payment?.payor) || '',
							invoiceNumber: '',
							referenceNumber: reference_number || EMPTY_CELL,
							referenceData: collectionReceipt,
							amount: formatInPeso(amount),
							cashier: getFullName(created_by),
							authorizer: getFullName(created_by),
							remarks: 'Collection Receipt',
							type: 'collection_receipt',
							outstandingBalance: formatInPeso(0), // Will be calculated later
						};
					},
				);
				combinedData.push(...collectionReceiptData);
			}
		}

		// Calculate running outstanding balance only if account is selected
		if (hasSelectedAccount) {
			// Sort by datetime (oldest first for balance calculation)
			const sortedForCalculation = combinedData.sort(
				(a, b) =>
					new Date(a.rawDatetime).getTime() - new Date(b.rawDatetime).getTime(),
			);

			// Start with the account's current total balance and work backwards
			// to find what the balance was before all transactions
			const currentBalance = parseFloat(
				selectedAccount?.credit_registration?.total_balance || '0',
			);

			// Calculate the net effect of all transactions to find initial balance
			let transactionTotal = 0;
			sortedForCalculation.forEach((item) => {
				const amount = parseFloat(item.amount.replace(/[₱,]/g, ''));
				if (item.type === 'credit_transaction') {
					transactionTotal += amount;
				} else if (item.type === 'collection_receipt') {
					transactionTotal -= amount;
				}
			});

			// Initial balance before these transactions
			const initialBalance = currentBalance - transactionTotal;

			// Calculate running outstanding balance starting from initial balance
			let runningBalance = initialBalance;
			const dataWithCalculatedBalance = sortedForCalculation.map((item) => {
				// Parse the amount back to number for calculation
				const amount = parseFloat(item.amount.replace(/[₱,]/g, ''));

				if (item.type === 'credit_transaction') {
					// Charge Invoice: Add to outstanding balance
					runningBalance += amount;
				} else if (item.type === 'collection_receipt') {
					// Collection Receipt: Subtract from outstanding balance
					runningBalance -= amount;
				}
				// Order of Payment: No change to balance (just a promise to pay)

				return {
					...item,
					outstandingBalance: formatInPeso(runningBalance),
				};
			});

			// Sort by datetime (newest first for display)
			const sortedData = dataWithCalculatedBalance.sort(
				(a, b) =>
					new Date(b.rawDatetime).getTime() - new Date(a.rawDatetime).getTime(),
			);

			setDataSource(sortedData);
		} else {
			// For general view (no account selected), sort by datetime (newest first)
			const sortedData = combinedData.sort(
				(a, b) =>
					new Date(b.rawDatetime).getTime() - new Date(a.rawDatetime).getTime(),
			);
			setDataSource(sortedData);
		}
	}, [
		transactions,
		orderOfPaymentsData?.list,
		collectionReceiptsData?.list,
		selectedAccount,
	]);

	// Update selected account when payorId changes
	useEffect(() => {
		if (params.payorId && accountsData?.list) {
			const account = accountsData.list.find(
				(acc: any) => acc.id === Number(params.payorId),
			);
			setSelectedAccount(account || null);
		} else {
			setSelectedAccount(null);
		}
	}, [params.payorId, accountsData?.list]);

	const handleCreateOrderOfPaymentsSuccess = () => {
		setQueryParams(
			{ tab: accountTabs.ORDER_OF_PAYMENTS },
			{ shouldResetPage: true, shouldIncludeCurrentParams: false },
		);
	};

	const isLoading =
		isFetchingTransactions ||
		isFetchingOrderOfPayments ||
		isFetchingCollectionReceipts;

	return (
		<div>
			<TableHeader
				title={
					params.payorId ? 'Account Transaction History' : 'Credit Transactions'
				}
				wrapperClassName="pt-2 px-0"
			/>

			{selectedAccount && (
				<AccountTotalBalance
					account={selectedAccount}
					disabled={false}
					totalBalance={
						selectedAccount.credit_registration?.total_balance || '0'
					}
					onClick={() => setIsCreateOrderOfPaymentModalVisible(true)}
				/>
			)}

			<RequestErrors
				errors={[
					...convertIntoArray(transactionsError, 'Credit Transactions'),
					...convertIntoArray(orderOfPaymentsError, 'Order of Payments'),
					...convertIntoArray(collectionReceiptsError, 'Collection Receipts'),
				]}
				withSpaceBottom
			/>

			<Filter isLoading={isLoading} />

			<Table
				columns={columns}
				dataSource={dataSource}
				loading={isLoading}
				pagination={{
					current: Number(params.page) || DEFAULT_PAGE,
					total: dataSource.length,
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

			{selectedCollectionReceipt && siteSettings && (
				<ViewCollectionReceiptModal
					collectionReceipt={selectedCollectionReceipt}
					siteSettings={siteSettings}
					onClose={() => setSelectedCollectionReceipt(null)}
				/>
			)}

			{selectedOrderOfPayment && (
				<ViewOrderOfPaymentModal
					orderOfPayment={selectedOrderOfPayment}
					onClose={() => setSelectedOrderOfPayment(null)}
				/>
			)}

			{getAppType() === appTypes.BACK_OFFICE &&
				isCreateOrderOfPaymentModalVisible &&
				selectedAccount && (
					<CreateOrderOfPaymentModal
						payor={
							{
								account: selectedAccount,
								credit_limit:
									selectedAccount.credit_registration?.credit_limit || '0',
								id: selectedAccount.id,
								online_id: selectedAccount.online_id || selectedAccount.id,
								total_balance:
									selectedAccount.credit_registration?.total_balance || '0',
							} as Payor
						}
						onClose={() => setIsCreateOrderOfPaymentModalVisible(false)}
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
		<Col span={24}>
			<TimeRangeFilter disabled={isLoading} />
		</Col>
	</Row>
);
