import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button, Col, message, Row, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import {
	RequestErrors,
	TableHeader,
	TimeRangeFilter,
	ViewPurchaseModal,
	ViewSupplierStatementOfAccountModal,
} from 'components';
import { getFullName } from 'ejjy-global';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, pageSizeOptions } from 'global';
import { timeRangeTypes, appTypes } from 'global/types';
import {
	useAccounts,
	useDisbursementVoucherCreate,
	useDisbursementVouchers,
	usePurchases,
	useQueryParams,
} from 'hooks';
import React, { useEffect, useMemo, useState } from 'react';
import {
	convertIntoArray,
	formatInPeso,
	getAppType,
	formatDateTime,
} from 'utils';
import { CreateDisbursementVoucherModal } from './modals/CreateDisbursementVoucherModal';
import { ViewDisbursementVoucherModal } from './modals/ViewDisbursementVoucherModal';
import {
	getSupplierLabel,
	SupplierTotalBalance,
} from './components/SupplierTotalBalance';

type Props = {
	onBack: () => void;
};

export const TabSupplierPurchases = ({ onBack }: Props) => {
	// STATES
	const [dataSource, setDataSource] = useState([]);
	const [selectedAccount, setSelectedAccount] = useState(null);
	const [selectedPurchase, setSelectedPurchase] = useState(null);
	const [
		selectedDisbursementVoucher,
		setSelectedDisbursementVoucher,
	] = useState(null);
	const [isCreateDvModalVisible, setIsCreateDvModalVisible] = useState(false);
	const [isStatementModalVisible, setIsStatementModalVisible] = useState(false);

	// CUSTOM HOOKS
	const { params, setQueryParams } = useQueryParams();

	const { data: accountsData } = useAccounts({
		params: { withSupplierRegistration: true },
	});

	const {
		data: purchasesData,
		isFetching: isFetchingPurchases,
		error: purchasesError,
	} = usePurchases({
		params: {
			supplierAccountId: params.supplierAccountId,
			timeRange: params?.timeRange || timeRangeTypes.DAILY,
			pageSize: DEFAULT_PAGE_SIZE * 3,
			journalEntryStatus: 'all',
		},
		options: { enabled: !!params.supplierAccountId },
	});

	const {
		data: disbursementVouchersData,
		isFetching: isFetchingDisbursementVouchers,
		error: disbursementVouchersError,
	} = useDisbursementVouchers({
		params: {
			supplierAccountId: params.supplierAccountId,
			timeRange: params?.timeRange || timeRangeTypes.DAILY,
			pageSize: DEFAULT_PAGE_SIZE * 3,
		},
		options: { enabled: !!params.supplierAccountId },
	});

	const {
		mutateAsync: createDisbursementVoucher,
		isLoading: isCreatingDisbursementVoucher,
	} = useDisbursementVoucherCreate();

	// TABLE COLUMNS
	const columns: ColumnsType = useMemo(
		() => [
			{ title: 'Date & Time', dataIndex: 'datetime', width: 180 },
			{
				title: 'Reference Number',
				dataIndex: 'referenceNumber',
				width: 150,
				align: 'left',
				render: (text, record: any) => {
					if (record.type === 'purchase') {
						return (
							<Button
								className="pa-0"
								type="link"
								onClick={() =>
									record.referenceData &&
									setSelectedPurchase(record.referenceData)
								}
							>
								{text}
							</Button>
						);
					}
					if (record.type === 'disbursement') {
						return (
							<Button
								className="pa-0"
								type="link"
								onClick={() =>
									record.referenceData &&
									setSelectedDisbursementVoucher(record.referenceData)
								}
							>
								{text}
							</Button>
						);
					}
					return text;
				},
			},
			{
				title: 'Description',
				dataIndex: 'description',
				width: 200,
				align: 'left',
			},
			{ title: 'Amount', dataIndex: 'amount', width: 120, align: 'left' },
			{
				title: 'Authorizer',
				dataIndex: 'authorizer',
				width: 150,
				align: 'left',
			},
			{ title: 'Balance', dataIndex: 'balance', width: 150, align: 'left' },
		],
		[],
	);

	// METHODS
	useEffect(() => {
		if (params.supplierAccountId && accountsData?.accounts) {
			const account = accountsData.accounts.find(
				(acc: any) => acc.id === Number(params.supplierAccountId),
			);
			setSelectedAccount(account || null);
		} else {
			setSelectedAccount(null);
		}
	}, [params.supplierAccountId, accountsData?.accounts]);

	useEffect(() => {
		if (!params.supplierAccountId) {
			setDataSource([]);
			return;
		}

		const purchases = purchasesData?.purchases || [];
		const disbursementVouchers =
			disbursementVouchersData?.disbursementVouchers || [];

		const combinedData = [
			...purchases.map((purchase: any) => ({
				key: `purchase-${purchase.id}`,
				datetime: formatDateTime(purchase.datetime_created),
				rawDatetime: purchase.datetime_created,
				referenceNumber: purchase.reference_number,
				referenceData: purchase,
				description: purchase.overall_remarks || '',
				amount: formatInPeso(purchase.total_amount),
				authorizer: getFullName(purchase.authorizer),
				type: 'purchase',
				balance: formatInPeso(0),
			})),
			...disbursementVouchers.map((disbursementVoucher: any) => ({
				key: `disbursement-${disbursementVoucher.id}`,
				datetime: formatDateTime(disbursementVoucher.datetime_created),
				rawDatetime: disbursementVoucher.datetime_created,
				referenceNumber: disbursementVoucher.reference_number,
				referenceData: disbursementVoucher,
				description: (disbursementVoucher.particulars || [])
					.map((item: any) => item.description)
					.join(', '),
				amount: formatInPeso(disbursementVoucher.amount),
				authorizer: getFullName(disbursementVoucher.authorizer),
				type: 'disbursement',
				balance: formatInPeso(0),
			})),
		];

		const sortedForCalculation = combinedData.sort(
			(a, b) =>
				new Date(a.rawDatetime).getTime() - new Date(b.rawDatetime).getTime(),
		);

		const currentBalance = parseFloat(
			selectedAccount?.['supplier_registration']?.total_balance || '0',
		);

		// Only "On Account" purchases add to the supplier's outstanding balance;
		// "Pay" purchases are settled immediately and have no effect on
		// total_balance (see purchases views.py), so they're excluded here to
		// keep the running balance in sync with the account's actual balance.
		const affectsBalance = (item: any) =>
			item.type === 'disbursement' ||
			(item.type === 'purchase' &&
				item.referenceData?.payment_type === 'on_account');

		let netTotal = 0;
		sortedForCalculation.forEach((item) => {
			if (!affectsBalance(item)) return;
			const amount = parseFloat(item.amount.replace(/[₱,]/g, ''));
			if (item.type === 'purchase') {
				netTotal += amount;
			} else if (item.type === 'disbursement') {
				netTotal -= amount;
			}
		});

		const initialBalance = currentBalance - netTotal;

		let runningBalance = initialBalance;
		const dataWithBalance = sortedForCalculation.map((item) => {
			if (!affectsBalance(item)) {
				return { ...item, balance: formatInPeso(runningBalance) };
			}

			const amount = parseFloat(item.amount.replace(/[₱,]/g, ''));

			if (item.type === 'purchase') {
				runningBalance += amount;
			} else if (item.type === 'disbursement') {
				runningBalance -= amount;
			}

			return { ...item, balance: formatInPeso(runningBalance) };
		});

		const sortedData = dataWithBalance.sort(
			(a, b) =>
				new Date(b.rawDatetime).getTime() - new Date(a.rawDatetime).getTime(),
		);

		setDataSource(sortedData as any);
	}, [
		purchasesData?.purchases,
		disbursementVouchersData?.disbursementVouchers,
		selectedAccount,
	]);

	const isLoading = isFetchingPurchases || isFetchingDisbursementVouchers;

	return (
		<div>
			<Button
				className="pa-0 mb-2"
				icon={<ArrowLeftOutlined />}
				style={{ display: 'inline-flex', alignItems: 'center' }}
				type="link"
				onClick={onBack}
			>
				Back to Supplier Accounts
			</Button>

			<TableHeader title="Supplier Transactions" wrapperClassName="pt-2 px-0" />

			{selectedAccount && (
				<SupplierTotalBalance
					account={selectedAccount}
					disabled={false}
					totalBalance={
						selectedAccount?.['supplier_registration']?.total_balance || '0'
					}
					onClick={() => setIsCreateDvModalVisible(true)}
					onViewStatement={() => setIsStatementModalVisible(true)}
				/>
			)}

			<RequestErrors
				errors={[
					...convertIntoArray(purchasesError, 'Purchases'),
					...convertIntoArray(
						disbursementVouchersError,
						'Disbursement Vouchers',
					),
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
						setQueryParams({ page, pageSize: newPageSize });
					},
					disabled: !dataSource,
					position: ['bottomCenter'],
					pageSizeOptions,
				}}
				scroll={{ x: 1000 }}
				bordered
			/>

			{selectedPurchase && (
				<ViewPurchaseModal
					purchase={selectedPurchase}
					onClose={() => setSelectedPurchase(null)}
				/>
			)}

			{selectedDisbursementVoucher && (
				<ViewDisbursementVoucherModal
					disbursementVoucher={selectedDisbursementVoucher}
					open={!!selectedDisbursementVoucher}
					onClose={() => setSelectedDisbursementVoucher(null)}
				/>
			)}

			{getAppType() === appTypes.BACK_OFFICE &&
				isCreateDvModalVisible &&
				selectedAccount && (
					<CreateDisbursementVoucherModal
						initialPayee={getSupplierLabel(selectedAccount)}
						isSubmitting={isCreatingDisbursementVoucher}
						open={isCreateDvModalVisible}
						supplierAccountId={selectedAccount?.['id']}
						onClose={() => setIsCreateDvModalVisible(false)}
						onCreate={async (values) => {
							try {
								await createDisbursementVoucher(values);
								message.success('Disbursement voucher created successfully');
								setIsCreateDvModalVisible(false);
							} catch {
								message.error('Failed to create disbursement voucher');
							}
						}}
					/>
				)}

			{isStatementModalVisible && selectedAccount && (
				<ViewSupplierStatementOfAccountModal
					supplierRegistration={{
						id: selectedAccount['supplier_registration']?.id,
						total_balance:
							selectedAccount['supplier_registration']?.total_balance || '0',
						account: selectedAccount,
					}}
					onClose={() => setIsStatementModalVisible(false)}
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
