import {
	StatementHistoryItem,
	StatementOfAccountModal,
	StatementPeriodModal,
	getDefaultStatementPeriod,
} from 'components/Printing';
import {
	CreditRegistration,
	useCollectionReceipts,
	useDeliveryInvoices,
	useTransactions,
} from 'ejjy-global';
import { DATE_FORMAT, MAX_PAGE_SIZE, paymentTypes } from 'global';
import moment, { Moment } from 'moment';
import React, { useMemo, useState } from 'react';
import { getLocalApiUrl } from 'utils';

interface Props {
	creditRegistration: CreditRegistration;
	onClose: () => void;
}

export const ViewStatementOfAccountModal = ({
	creditRegistration,
	onClose,
}: Props) => {
	const { account } = creditRegistration;

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

	const {
		data: transactionsData,
		isFetching: isFetchingTransactions,
	} = useTransactions({
		params: {
			modeOfPayment: paymentTypes.CREDIT,
			payorCreditorAccountId: account?.id,
			timeRange: historyRange,
			pageSize: MAX_PAGE_SIZE,
		} as any,
		serviceOptions: { baseURL: getLocalApiUrl() },
		options: { enabled: !!account?.id },
	}) as any;

	const {
		data: deliveryInvoicesData,
		isFetching: isFetchingDeliveryInvoices,
	} = useDeliveryInvoices({
		params: { timeRange: historyRange, pageSize: MAX_PAGE_SIZE } as any,
		serviceOptions: { baseURL: getLocalApiUrl() },
	});

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

	const isLoading =
		isFetchingTransactions ||
		isFetchingDeliveryInvoices ||
		isFetchingCollectionReceipts;

	const history: StatementHistoryItem[] = useMemo(() => {
		const items: StatementHistoryItem[] = [];

		(transactionsData?.list || []).forEach((transaction) => {
			items.push({
				rawDatetime: transaction.datetime_created,
				referenceNumber: transaction.invoice?.or_number || '',
				description: 'Charge Invoice',
				amount: Number(transaction.total_amount),
				direction: 1,
			});
		});

		(deliveryInvoicesData?.list || [])
			.filter((invoice: any) => invoice.creditor_account?.id === account?.id)
			.forEach((invoice: any) => {
				items.push({
					rawDatetime: invoice.datetime_created,
					referenceNumber: invoice.or_number || '',
					description: 'Delivery Invoice',
					amount: Number(invoice.total_amount),
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
	}, [
		transactionsData,
		deliveryInvoicesData,
		collectionReceiptsData,
		account?.id,
	]);

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
			currentOutstandingBalance={creditRegistration.total_balance}
			filenamePrefix="StatementOfAccount"
			history={history}
			isLoading={isLoading}
			period={period}
			title="[View] Statement of Account"
			onChangePeriod={() => setStep('period')}
			onClose={onClose}
		/>
	);
};
