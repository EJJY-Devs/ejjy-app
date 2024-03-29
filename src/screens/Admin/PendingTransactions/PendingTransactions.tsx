import Table, { ColumnsType } from 'antd/lib/table';
import React, { useEffect, useRef, useState } from 'react';
import { formatDateTime, showErrorMessages } from 'utils';
import { Content, TableActions } from '../../../components';
import { Box } from '../../../components/elements';
import { PendingTransactionsSection } from '../../../components/PendingTransactionsSection/PendingTransactionsSection';
import { TableHeader } from '../../../components/Table/TableHeaders/TableHeader';
import { pendingTransactionTypes, request } from '../../../global/types';
import { usePendingTransactions } from '../../../hooks/usePendingTransactions';

const columns: ColumnsType = [
	{ title: 'Description', dataIndex: 'description', key: 'description' },
	{ title: 'Branch', dataIndex: 'branch', key: 'branch' },
	{ title: 'Datetime', dataIndex: 'datetime_created', key: 'datetime_created' },
	{ title: 'Actions', dataIndex: 'actions', key: 'actions' },
];

export const PendingTransactions = () => {
	// STATES
	const [pendingTransactions, setPendingTransactions] = useState([]);
	const [data, setData] = useState([]);

	// REFS
	const productPendingTransactionsRef = useRef(null);
	const userPendingTransactionsRef = useRef(null);

	// CUSTOM HOOKS
	const {
		listPendingTransactions,
		editPendingTransaction,
		removePendingTransaction,
		status: pendingTransactionsStatus,
	} = usePendingTransactions();

	// METHODS
	useEffect(() => {
		fetchPendingTransactions();
	}, []);

	// Effect: Format pending transactions to be rendered in Table
	useEffect(() => {
		const handleCallbackSuccess = ({ status, error, requestModel }) => {
			if (status === request.SUCCESS) {
				fetchPendingTransactions();

				if (requestModel === pendingTransactionTypes.PRODUCTS) {
					productPendingTransactionsRef.current?.refreshList();
				}

				if (requestModel === pendingTransactionTypes.USERS) {
					userPendingTransactionsRef.current?.refreshList();
				}
			} else if (status === request.ERROR) {
				showErrorMessages(error);
			}
		};
		const formattedPendingTransactions = pendingTransactions.map(
			(pendingTransaction) => {
				const {
					id,
					name,
					branch,
					datetime_created,
					request_model,
				} = pendingTransaction;

				return {
					description: name,
					branch: branch?.name,
					datetime_created: formatDateTime(datetime_created),
					actions: (
						<TableActions
							onRemove={() => {
								removePendingTransaction(
									{ id },
									(response) =>
										handleCallbackSuccess({
											requestModel: request_model,
											...response,
										}),
									true,
								);
							}}
							onRestore={() => {
								editPendingTransaction(
									{ id, is_pending_approval: false },
									(response) =>
										handleCallbackSuccess({
											requestModel: request_model,
											...response,
										}),
								);
							}}
						/>
					),
				};
			},
		);

		setData(formattedPendingTransactions);
	}, [pendingTransactions]);

	const fetchPendingTransactions = () => {
		listPendingTransactions(
			{ isPendingApproval: true },
			({ status, data: responseData }) => {
				if (status === request.SUCCESS) {
					setPendingTransactions(responseData.results);
				}
			},
		);
	};

	return (
		<Content className="PendingTransactions" title="Pending Transactions">
			<Box>
				<TableHeader title="For Approval" />

				<Table
					columns={columns}
					dataSource={data}
					loading={pendingTransactionsStatus === request.REQUESTING}
					pagination={false}
					scroll={{ x: 800 }}
					bordered
				/>
			</Box>

			<PendingTransactionsSection
				ref={productPendingTransactionsRef}
				title="All Product Transactions"
				transactionType={pendingTransactionTypes.PRODUCTS}
			/>

			<PendingTransactionsSection
				ref={userPendingTransactionsRef}
				title="All User Transactions"
				transactionType={pendingTransactionTypes.USERS}
			/>
		</Content>
	);
};
