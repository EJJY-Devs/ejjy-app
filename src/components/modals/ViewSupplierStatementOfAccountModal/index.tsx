import {
	StatementHistoryItem,
	StatementOfAccountModal,
	StatementPeriodModal,
	getDefaultStatementPeriod,
} from 'components/Printing';
import { DATE_FORMAT, MAX_PAGE_SIZE } from 'global';
import { useDisbursementVouchers, usePurchases } from 'hooks';
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

	const isLoading = isFetchingPurchases || isFetchingDisbursementVouchers;

	const history: StatementHistoryItem[] = useMemo(() => {
		const items: StatementHistoryItem[] = [];

		// Only "On Account" purchases add to the supplier's outstanding
		// balance; "Pay" purchases are settled immediately (see purchases
		// views.py) and must be excluded to keep this in sync with total_balance.
		(purchasesData?.purchases || [])
			.filter((purchase: any) => purchase.payment_type === 'on_account')
			.forEach((purchase: any) => {
				items.push({
					rawDatetime: purchase.datetime_created,
					referenceNumber: purchase.reference_number || '',
					description: 'Purchases',
					amount: Number(purchase.total_amount),
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
	}, [purchasesData, disbursementVouchersData]);

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
