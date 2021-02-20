/* eslint-disable react-hooks/exhaustive-deps */
import { message, Tabs } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { AddIcon, Container, TableActions } from '../../../components';
import { Box, Button } from '../../../components/elements';
import { PendingTransactionsSection } from '../../../components/PendingTransactionsSection/PendingTransactionsSection';
import { types as pendingTransactionsTypes } from '../../../ducks/OfficeManager/pending-transactions';
import { pendingTransactionTypes, request, userTypes } from '../../../global/types';
import { getUserTypeName } from '../../../utils/function';
import { useBranches } from '../hooks/useBranches';
import { usePendingTransactions } from '../hooks/usePendingTransactions';
import { useUsers } from '../hooks/useUsers';
import { BranchUsers } from './components/BranchUsers';
import { CreateUserModal } from './components/CreateUserModal';
import { EditUserModal } from './components/EditUserModal';
import './style.scss';

const { TabPane } = Tabs;

const NO_BRANCHES_ID = 'no-branches-id';

const Users = () => {
	// STATES
	const [editUserModalVisible, setEditUserModalVisible] = useState(false);
	const [createUserModalVisible, setCreateUserModalVisible] = useState(false);
	const [selectedUser, setSelectedUser] = useState(null);

	// CUSTOM HOOKS
	const history = useHistory();
	const { branches } = useBranches();
	const { users, getUsers, removeUser, status: usersStatus, errors, warnings, reset } = useUsers();
	const {
		pendingTransactions,
		listPendingTransactions,
		status: pendingTransactionsStatus,
		recentRequest: pendingTransactionRecentRequest,
	} = usePendingTransactions();

	useEffect(() => {
		if (branches?.length) {
			onTabClick(branches?.[0]?.id);
		}
	}, [branches]);

	useEffect(() => {
		if (usersStatus === request.ERROR && errors?.length) {
			errors?.forEach((error) => {
				message.error(error);
			});

			reset();
		}
	}, [usersStatus, errors]);

	useEffect(() => {
		if (usersStatus === request.SUCCESS && warnings?.length) {
			warnings?.forEach((warning) => {
				message.warning(warning);
			});

			reset();
		}
	}, [usersStatus, warnings]);

	const getFetchLoading = useCallback(
		() =>
			usersStatus === request.REQUESTING ||
			(pendingTransactionsStatus === request.REQUESTING &&
				pendingTransactionRecentRequest === pendingTransactionsTypes.LIST_PENDING_TRANSACTIONS),
		[usersStatus, pendingTransactionsStatus, pendingTransactionRecentRequest],
	);

	const getTableDataSource = (branchId) => {
		if (branchId === NO_BRANCHES_ID) {
			branchId = undefined;
		}

		let hasPendingTransactions = pendingTransactions.some(
			({ request_model }) => request_model === pendingTransactionTypes.USERS,
		);

		let newData =
			usersStatus === request.SUCCESS
				? users
						?.filter(({ branch }) => branch?.id === branchId)
						?.map((user) => {
							const { id, first_name, last_name, user_type } = user;
							const isBranchUsers = [userTypes.BRANCH_MANAGER, userTypes.BRANCH_PERSONNEL];

							return [
								`${first_name} ${last_name}`,
								getUserTypeName(user_type),
								hasPendingTransactions ? null : (
									<TableActions
										onAssign={branchId ? () => history.push(`/users/assign/${id}`) : null}
										onEdit={isBranchUsers.includes(user_type) ? () => onEditUser(user) : null}
										onRemove={isBranchUsers.includes(user_type) ? () => onRemoveUser(user) : null}
									/>
								),
							];
						})
				: [];

		return newData;
	};

	const onTabClick = (branchId) => {
		if (branchId === NO_BRANCHES_ID) {
			getUsers({});
		} else {
			getUsers({ branchId });
		}
	};

	const onEditUser = (user) => {
		setEditUserModalVisible(true);
		setSelectedUser(user);
	};

	const onCreateUser = () => {
		setCreateUserModalVisible(true);
	};

	const onRemoveUser = (user) => {
		removeUser(user.id, ({ status, response }) => {
			if (status === request.SUCCESS) {
				if (response?.length) {
					message.warning(
						'We found an error while deleting the user in local branch. Please check the pending transaction table below.',
					);
					listPendingTransactions(null);
				}

				onTabClick(user?.branch?.id || NO_BRANCHES_ID);
			}
		});
	};

	const onSuccessEditUser = (branchId) => {
		onTabClick(branchId);
	};

	return (
		<Container title="Users" loading={getFetchLoading()}>
			<section>
				<Box>
					<Tabs
						type="card"
						defaultActiveKey={branches?.[0]?.id}
						onTabClick={onTabClick}
						tabBarExtraContent={
							<Button
								text="Create User"
								variant="primary"
								onClick={onCreateUser}
								iconDirection="left"
								icon={<AddIcon />}
							/>
						}
						style={{ padding: '20px 25px' }}
					>
						{branches.map(({ name, id, online_url }) => (
							<TabPane key={id} tab={name} disabled={!online_url}>
								<BranchUsers dataSource={getTableDataSource(id)} />
							</TabPane>
						))}

						<TabPane key={NO_BRANCHES_ID} tab="No Branches">
							<BranchUsers dataSource={getTableDataSource(NO_BRANCHES_ID)} />
						</TabPane>
					</Tabs>

					<CreateUserModal
						visible={createUserModalVisible}
						onSuccess={() => onTabClick(NO_BRANCHES_ID)}
						onClose={() => setCreateUserModalVisible(false)}
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

			<PendingTransactionsSection
				title="Pending User Transactions"
				transactionType={pendingTransactionTypes.USERS}
			/>
		</Container>
	);
};

export default Users;
