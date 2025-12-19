/* eslint-disable react/jsx-one-expression-per-line */
import { Spin } from 'antd';
import { RequestErrors } from 'components';
import { Box, Button } from 'components/elements';
import { printCancelledTransactions } from 'ejjy-global';
import { appTypes, MAX_PAGE_SIZE } from 'global';
import { useSiteSettings, useTransactions } from 'hooks';
import React, { useEffect, useState } from 'react';
import { useUserStore } from 'stores';
import { convertIntoArray, formatInPeso, getAppType } from 'utils';

interface Props {
	branchId?: string;
	serverUrl?: string;
	timeRange?: string;
	statuses?: string;
}

export const TransactionsCancelled = ({
	branchId,
	serverUrl,
	timeRange,
	statuses,
}: Props) => {
	// STATES
	const [amount, setAmount] = useState(0);
	const [isPrinting, setIsPrinting] = useState(false);

	// CUSTOM HOOKS
	const user = useUserStore((state) => state.user);
	const {
		data: { transactions },
		isFetching: isFetchingTransactions,
		error: transactionsError,
	} = useTransactions({
		params: {
			timeRange,
			statuses,
			branchId,
			serverUrl,
			pageSize: MAX_PAGE_SIZE,
		},
	});
	const {
		data: siteSettings,
		isFetching: isFetchingSiteSettings,
		error: siteSettingsError,
	} = useSiteSettings({
		params: { branchId },
	});

	useEffect(() => {
		const totalAmount = transactions.reduce(
			(previousValue, transaction) =>
				previousValue + Number(transaction.total_amount),
			0,
		);

		setAmount(totalAmount);
	}, [transactions]);

	const handlePrint = () => {
		setIsPrinting(true);

		printCancelledTransactions(
			amount,
			timeRange,
			statuses,
			siteSettings,
			transactions,
			user,
			() => {
				setIsPrinting(false);
			},
		);
	};

	return (
		<Box className="TransactionsCancelled">
			<Spin spinning={isFetchingTransactions || isFetchingSiteSettings}>
				<div className="TransactionsCancelled_container">
					<RequestErrors
						errors={[
							...convertIntoArray(transactionsError, 'Transactions'),
							...convertIntoArray(siteSettingsError, 'Settings'),
						]}
						withSpaceBottom
					/>

					<div>
						<p className="TransactionsCancelled_title">
							{formatInPeso(amount)}
						</p>
						<span className="TransactionsCancelled_date">
							{transactions.length} Cancelled Transactions
						</span>
					</div>

					{getAppType() !== appTypes.BACK_OFFICE && (
						<Button
							disabled={transactions.length === 0}
							loading={isPrinting}
							text="Print"
							variant="primary"
							onClick={handlePrint}
						/>
					)}
				</div>
			</Spin>
		</Box>
	);
};
