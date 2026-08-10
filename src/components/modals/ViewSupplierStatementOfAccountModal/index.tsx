import {
	StatementHistoryItem,
	StatementOfAccountModal,
	StatementPeriodModal,
	getDefaultStatementPeriod,
} from 'components/Printing';
import { DATE_FORMAT, MAX_PAGE_SIZE } from 'global';
import { useDisbursementVouchers, usePurchases } from 'hooks';
import useExpenseVouchers from 'hooks/useExpenseVouchers';
import moment, { Moment } from 'moment';
import React, { useMemo, useState } from 'react';

interface SupplierRegistration {
	id: number;
	total_balance: string;
	account: any;
}

interface Props {
	supplierRegistration: SupplierRegistration;
	onClose: () => void;
}

export const ViewSupplierStatementOfAccountModal = ({
	supplierRegistration,
	onClose,
}: Props) => {
	const { account } = supplierRegistration;

	// STATES
	const [step, setStep] = useState<'period' | 'statement'>('period');
	const [period, setPeriod] = useState<[Moment, Moment]>(
		getDefaultStatementPeriod,
	);

	const historyRange = useMemo(() => {
		const start = account?.datetime_created
			? moment(account.datetime_created)
			: period[0];

		return [start.format(DATE_FORMAT), period[1].format(DATE_FORMAT)].join(',');
	}, [account?.datetime_created, period]);

	const { data: purchasesData, isFetching: isFetchingPurchases } = usePurchases(
		{
			params: {
				supplierAccountId: account?.id,
				timeRange: historyRange,
				pageSize: MAX_PAGE_SIZE,
				journalEntryStatus: 'all',
			},
			options: { enabled: !!account?.id },
		},
	);

	const {
		data: disbursementVouchersData,
		isFetching: isFetchingDisbursementVouchers,
	} = useDisbursementVouchers({
		params: {
			supplierAccountId: account?.id,
			timeRange: historyRange,
			pageSize: MAX_PAGE_SIZE,
		},
		options: { enabled: !!account?.id },
	});

	const {
		data: expenseVouchersData,
		isFetching: isFetchingExpenseVouchers,
	} = useExpenseVouchers({
		params: {
			supplierAccountId: account?.id,
			timeRange: historyRange,
			pageSize: MAX_PAGE_SIZE,
			journalEntryStatus: 'all',
		},
		options: { enabled: !!account?.id },
	});

	const isLoading =
		isFetchingPurchases ||
		isFetchingDisbursementVouchers ||
		isFetchingExpenseVouchers;

	const history: StatementHistoryItem[] = useMemo(() => {
		const items: StatementHistoryItem[] = [];

		// Every purchase linked to this supplier account adds to the supplier's
		// outstanding balance (see purchases views.py).
		(purchasesData?.purchases || []).forEach((purchase: any) => {
			items.push({
				rawDatetime: purchase.datetime_created,
				referenceNumber: purchase.reference_number || '',
				description: 'Purchases',
				amount: Number(purchase.total_amount),
				direction: 1,
			});
		});

		// Only "On Account" expense vouchers add to the supplier's outstanding
		// balance; "Pay" expense vouchers are settled immediately in cash (see
		// accounting views.py).
		(expenseVouchersData?.expenseVouchers || [])
			.filter(
				(expenseVoucher: any) => expenseVoucher.payment_type === 'on_account',
			)
			.forEach((expenseVoucher: any) => {
				items.push({
					rawDatetime: expenseVoucher.datetime_created,
					referenceNumber: expenseVoucher.reference_number || '',
					description: 'Expense Voucher',
					amount: Number(expenseVoucher.amount),
					direction: 1,
				});
			});

		(disbursementVouchersData?.disbursementVouchers || []).forEach(
			(voucher: any) => {
				items.push({
					rawDatetime: voucher.datetime_created,
					referenceNumber: voucher.reference_number || '',
					description: 'Disbursement',
					amount: Number(voucher.amount),
					direction: -1,
				});
			},
		);

		return items;
	}, [purchasesData, expenseVouchersData, disbursementVouchersData]);

	if (step === 'period') {
		return (
			<StatementPeriodModal
				defaultPeriod={period}
				title="Select Statement Period"
				onClose={onClose}
				onConfirm={(newPeriod) => {
					setPeriod(newPeriod);
					setStep('statement');
				}}
			/>
		);
	}

	return (
		<StatementOfAccountModal
			account={account}
			currentOutstandingBalance={supplierRegistration.total_balance}
			filenamePrefix="SupplierStatementOfAccount"
			history={history}
			isLoading={isLoading}
			period={period}
			title="[View] Statement of Account"
			isSupplier
			onChangePeriod={() => setStep('period')}
			onClose={onClose}
		/>
	);
};
