import {
	StatementHistoryItem,
	StatementOfAccountModal,
	StatementPeriodModal,
	getDefaultStatementPeriod,
} from 'components/Printing';
import { useCollectionReceipts } from 'ejjy-global';
import { DATE_FORMAT, MAX_PAGE_SIZE } from 'global';
import { usePurchases } from 'hooks';
import moment, { Moment } from 'moment';
import React, { useMemo, useState } from 'react';
import { getLocalApiUrl } from 'utils';

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
		data: collectionReceiptsData,
		isFetching: isFetchingCollectionReceipts,
	} = useCollectionReceipts({
		params: {
			payorId: account?.id,
			timeRange: historyRange,
			pageSize: MAX_PAGE_SIZE,
		} as any,
		serviceOptions: { baseURL: getLocalApiUrl() },
		options: { enabled: !!account?.id },
	});

	const isLoading = isFetchingPurchases || isFetchingCollectionReceipts;

	const history: StatementHistoryItem[] = useMemo(() => {
		const items: StatementHistoryItem[] = [];

		(purchasesData?.purchases || []).forEach((purchase: any) => {
			items.push({
				rawDatetime: purchase.datetime_created,
				referenceNumber: purchase.reference_number || '',
				description: 'Purchases',
				amount: Number(purchase.total_amount),
				direction: 1,
			});
		});

		(collectionReceiptsData?.list || []).forEach((receipt: any) => {
			items.push({
				rawDatetime: receipt.datetime_created,
				referenceNumber: receipt.reference_number || '',
				description: 'Collection Receipt',
				amount: Number(receipt.amount),
				direction: -1,
			});
		});

		return items;
	}, [purchasesData, collectionReceiptsData]);

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
			isSupplier
			period={period}
			title="[View] Statement of Account"
			onChangePeriod={() => setStep('period')}
			onClose={onClose}
		/>
	);
};
