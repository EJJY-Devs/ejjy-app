/* eslint-disable react-hooks/exhaustive-deps */
import { message, Tabs } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Container, Table, TableActions, TableHeader } from '../../../components';
import { Box } from '../../../components/elements';
import { pendingTransactionTypes, request } from '../../../global/types';
import {
	calculateTableHeight,
	formatDateTime,
	getUserTypeName,
	showErrorMessages,
} from '../../../utils/function';
import { useBranches } from '../hooks/useBranches';
import { usePendingTransactions } from '../hooks/usePendingTransactions';
import { useUsers } from '../hooks/useUsers';
import { BranchUsers } from './components/BranchUsers';
import { EditUserModal } from './components/EditUserModal';
import './style.scss';
import { types as pendingTransactionsTypes } from '../../../ducks/OfficeManager/pending-transactions';

const { TabPane } = Tabs;

const pendingTransactionColumns = [
	{ title: 'Name', dataIndex: 'name' },
	{ title: 'Branch', dataIndex: 'branch' },
	{ title: 'Datetime', dataIndex: 'datetime_created' },
	{ title: 'Actions', dataIndex: 'actions' },
];

const Users = () => {
	// STATES
	const [pendingTransactionsData, setPendingTransactionsTableData] = useState([]);
	const [editUserModalVisible, setEditUserModalVisible] = useState(false);
	const [selectedUser, setSelectedUser] = useState(null);

	// CUSTOM HOOKS
	const history = useHistory();
	const { branches } = useBranches();
	const { users, getUsers, status: usersStatus, errors, reset } = useUsers();
	const {
		pendingTransactions,
		listPendingTransactions,
		executePendingTransactions,
		removePendingTransactions,
		status: pendingTransactionsStatus,
		recentRequest: pendingTransactionRecentRequest,
	} = usePendingTransactions();

	// METHODS
	useEffect(() => {
		listPendingTransactions(null);
	}, []);

	useEffect(() => {
		if (branches?.length) {
			onTabClick(branches?.[0]?.id);
		}
	}, [branches]);

	// Effect: Format pending transactions to be rendered in Table
	useEffect(() => {
		const formattedPendingTransactions = pendingTransactions
			.filter(({ request_model }) => request_model === pendingTransactionTypes.USERS)
			.map((pendingTransaction) => {
				const { name, branch, datetime_created } = pendingTransaction;

				return {
					name,
					branch: branch?.name,
					datetime_created: formatDateTime(datetime_created),
					actions: (
						<TableActions
							onExecutePendingTransaction={() => onExecutePendingTransaction(pendingTransaction)}
							onRemove={() => onRemovePendingTransaction(pendingTransaction.id, true)}
						/>
					),
				};
			});

		setPendingTransactionsTableData(formattedPendingTransactions);
	}, [pendingTransactions]);

	useEffect(() => {
		if (usersStatus === request.ERROR && errors?.length) {
			errors?.forEach((error) => {
				message.error(error);
			});

			reset();
		}
	}, [usersStatus, errors]);

	const getFetchLoading = useCallback(
		() =>
			usersStatus === request.REQUESTING ||
			(pendingTransactionsStatus === request.REQUESTING &&
				pendingTransactionRecentRequest === pendingTransactionsTypes.LIST_PENDING_TRANSACTIONS),
		[usersStatus, pendingTransactionsStatus, pendingTransactionRecentRequest],
	);

	const getTableDataSource = (branchId) => {
		let newData =
			usersStatus === request.SUCCESS
				? users
						?.filter(({ branch }) => branch?.id === branchId)
						?.map((user) => {
							const { id, first_name, last_name, user_type } = user;
							return [
								`${first_name} ${last_name}`,
								getUserTypeName(user_type),
								pendingTransactionsData?.length ? null : (
									<TableActions
										onAssign={() => history.push(`/users/assign/${id}`)}
										onEdit={() => onEditUser(user)}
										// onRemove={() => removeUser(id)} Note: Removing of user not supported for now
									/>
								),
							];
						})
				: [];

		return newData;
	};

	const onTabClick = (branchId) => {
		getUsers({ branchId });
	};

	const onEditUser = (user) => {
		setEditUserModalVisible(true);
		setSelectedUser(user);
	};

	const onSuccessEditUser = (branchId) => {
		onTabClick(branchId);
	};

	const onExecutePendingTransaction = (pendingTransaction) => {
		executePendingTransactions(
			{
				...pendingTransaction,
				request_body: JSON.parse(pendingTransaction?.request_body || '{}'),
				request_query_params: JSON.parse(pendingTransaction?.request_query_params || '{}'),
			},
			({ status, error }) => {
				if (status === request.SUCCESS) {
					onRemovePendingTransaction(pendingTransaction.id, false);
				} else if (status === request.ERROR) {
					console.log('error', error);
					showErrorMessages(error);
				}
			},
			true,
		);
	};

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
		<Container title="Users" loading={getFetchLoading()}>
			<section>
				<Box>
					<Tabs
						defaultActiveKey={branches?.[0]?.id}
						style={{ padding: '20px 25px' }}
						type="card"
						onTabClick={onTabClick}
					>
						{branches.map(({ name, id, online_url }) => (
							<TabPane key={id} tab={name} disabled={!online_url}>
								<BranchUsers dataSource={getTableDataSource(id)} />
							</TabPane>
						))}
					</Tabs>
				</Box>
			</section>

			<section className="PendingProductTransactions">
				<Box>
					<TableHeader title="Pending User Transactions" />

					<Table
						columns={pendingTransactionColumns}
						dataSource={pendingTransactionsData}
						scroll={{ y: calculateTableHeight(pendingTransactionsData.length), x: '100%' }}
						loading={pendingTransactionsStatus === request.REQUESTING}
					/>

					<EditUserModal
						user={selectedUser}
						visible={editUserModalVisible}
						onFetchPendingTransactions={listPendingTransactions}
						onSuccess={onSuccessEditUser}
						onClose={() => setEditUserModalVisible(false)}
					/>
				</Box>
			</section>
		</Container>
	);
};

export default Users;
