/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { Container, Table, TableActions } from '../../../components';
import { Box } from '../../../components/elements';
import { request } from '../../../global/types';
import { calculateTableHeight, formatDateTime, showErrorMessages } from '../../../utils/function';
import { usePendingTransactions } from '../../OfficeManager/hooks/usePendingTransactions';

const columns = [
	{ title: 'Description', dataIndex: 'description' },
	{ title: 'Branch', dataIndex: 'branch' },
	{ title: 'Datetime', dataIndex: 'datetime_created' },
	{ title: 'Actions', dataIndex: 'actions' },
];

const PendingTransactions = () => {
	// STATES
	const [data, setData] = useState([]);

	// CUSTOM HOOKS
	const {
		pendingTransactions,
		listPendingTransactions,
		removePendingTransactions,
		status,
	} = usePendingTransactions();

	// METHODS
	useEffect(() => {
		listPendingTransactions(null);
	}, []);

	// Effect: Format pending transactions to be rendered in Table
	useEffect(() => {
		const formattedPendingTransactions = pendingTransactions.map((pendingTransaction) => {
			const { name, branch, datetime_created } = pendingTransaction;

			return {
				description: name,
				branch: branch?.name,
				datetime_created: formatDateTime(datetime_created),
				actions: (
					<TableActions onRemove={() => onRemovePendingTransaction(pendingTransaction.id, true)} />
				),
			};
		});

		setData(formattedPendingTransactions);
	}, [pendingTransactions]);

	const onRemovePendingTransaction = (pendingTransactionId, showFeedbackMessage) => {
		removePendingTransactions(
			{ id: pendingTransactionId },
			({ status, error }) => {
				if (status === request.SUCCESS) {
					listPendingTransactions(null);
				} else if (status === request.ERROR) {
					showErrorMessages(error);
				}
			},
			showFeedbackMessage,
		);
	};

	return (
		<Container title="Pending Transactions">
			<section className="PendingTransactions">
				<Box>
					<Table
						columns={columns}
						dataSource={data}
						scroll={{ y: calculateTableHeight(data.length), x: '100%' }}
						loading={status === request.REQUESTING}
					/>
				</Box>
			</section>
		</Container>
	);
};

export default PendingTransactions;
