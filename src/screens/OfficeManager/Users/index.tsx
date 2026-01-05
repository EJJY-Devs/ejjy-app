import {
	DeleteOutlined,
	DesktopOutlined,
	EditFilled,
	SearchOutlined,
	SelectOutlined,
} from '@ant-design/icons';
import {
	Button,
	Col,
	Input,
	Popconfirm,
	Row,
	Select,
	Space,
	Spin,
	Table,
	Tooltip,
	message,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import {
	BranchAssignmentUserModal,
	ConnectionAlert,
	Content,
	ModifyUserModal,
	RequestErrors,
	TableHeader,
	// UserPendingApprovalType,
	ViewUserModal,
} from 'components';
import { Box, Label } from 'components/elements';
import {
	ServiceType,
	filterOption,
	getFullName,
	useBranches,
	useUserDelete,
	// useUserRequestUserDeletion,
	useUsers,
	// userPendingApprovalTypes,
} from 'ejjy-global';
import {
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	DEV_USERNAME,
	MAX_PAGE_SIZE,
	NO_BRANCH_ID,
	SEARCH_DEBOUNCE_TIME,
	pageSizeOptions,
	userTypes,
} from 'global';
import {
	usePingOnlineServer,
	useQueryParams,
	useUserPendingApprovals,
} from 'hooks';
import { getBaseUrl } from 'hooks/helper';
import _ from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import { useQueryClient } from 'react-query';
import { Link } from 'react-router-dom';
import { useUserStore } from 'stores';
import {
	convertIntoArray,
	getId,
	getLocalApiUrl,
	getUserTypeName,
	isStandAlone,
	isUserFromOffice,
} from 'utils';

const columns: ColumnsType = [
	{ title: 'ID', dataIndex: 'id' },
	{ title: 'Name', dataIndex: 'name' },
	{ title: 'Type', dataIndex: 'type' },
	{ title: 'Actions', dataIndex: 'actions' },
];

export const Users = () => {
	// STATES
	const [dataSource, setDataSource] = useState([]);
	const [viewUserModalVisible, setViewUserModalVisible] = useState(false);
	const [modifyUserModalVisible, setModifyUserModalVisible] = useState(false);
	const [reassignUserModalVisible, setReassignUserModalVisible] = useState(
		false,
	);
	const [selectedUser, setSelectedUser] = useState(null);

	// CUSTOM HOOKS
	const queryClient = useQueryClient();
	const { params, setQueryParams } = useQueryParams();
	const { isConnected } = usePingOnlineServer();
	const {
		data: branchesData,
		isFetching: isFetchingBranches,
		error: branchesError,
	} = useBranches({
		params: { pageSize: MAX_PAGE_SIZE },
		serviceOptions: {
			baseURL: getLocalApiUrl(),
			type: isStandAlone() ? ServiceType.ONLINE : ServiceType.OFFLINE,
		},
	});

	const {
		isFetchedAfterMount: isUserPendingApprovalsFetched,
		isFetching: isFetchingUserPendingApprovals,
		error: userPendingApprovalsError,
	} = useUserPendingApprovals({
		options: { onSuccess: () => queryClient.invalidateQueries('useUsers') },
	});
	const {
		data: usersData,
		isFetching: isFetchingUsers,
		error: usersError,
	} = useUsers({
		params,
		options: { enabled: isUserPendingApprovalsFetched },
		serviceOptions: {
			baseURL: getLocalApiUrl(),
			type: isStandAlone() ? ServiceType.ONLINE : ServiceType.OFFLINE,
		},
	});

	const {
		mutateAsync: requestUserDeletion,
		isLoading: isRequestingUserDeletion,
		error: requestUserDeletionError,
	} = useUserDelete({}, getBaseUrl());

	// TEMPORARILY DISABLE REQUEST USER CRUD FUNCTIONS

	// const {
	// 	mutateAsync: requestUserDeletion,
	// 	isLoading: isRequestingUserDeletion,
	// 	error: requestUserDeletionError,
	// } = useUserRequestUserDeletion(null, getBaseUrl());

	// METHODS
	useEffect(() => {
		const isDisabled = isConnected === false;
		const branchId = Number(params?.branchId);
		let branch = null;

		if (branchId === NO_BRANCH_ID) {
			branch = { id: NO_BRANCH_ID, online_id: NO_BRANCH_ID };
		} else {
			branch = branchesData?.list.filter(({ id }) => id === branchId);
		}

		// Find the oldest admin (by datetime_created)
		const oldestAdmin = usersData?.list
			?.filter((user) => user.user_type === userTypes.ADMIN)
			?.reduce(
				(oldest, user) =>
					!oldest ||
					new Date(user.datetime_created) < new Date(oldest.datetime_created)
						? user
						: oldest,
				null,
			);
		const oldestAdminId = oldestAdmin?.id;

		const formattedUsers = usersData?.list
			.filter((user) => user.username !== DEV_USERNAME)
			.map((user) => ({
				key: user.id,
				id: (
					<Button
						className="pa-0"
						type="link"
						onClick={() => {
							setViewUserModalVisible(true);
							setSelectedUser(user);
						}}
					>
						{user.employee_id}
					</Button>
				),
				name: getFullName(user),
				type: getUserTypeName(user.user_type),
				actions: (
					// user.pending_approval?.approval_type ? (
					// 	<UserPendingApprovalType
					// 		type={user.pending_approval?.approval_type}
					// 	/>
					// )
					<Space>
						{user.user_type !== userTypes.ADMIN && (
							<>
								<Tooltip title="Cashiering Assignment">
									<Link to={`/office-manager/users/assign/${user.id}`}>
										<Button
											disabled={isDisabled}
											icon={<DesktopOutlined />}
											type="primary"
											ghost
										/>
									</Link>
								</Tooltip>

								<Tooltip title="Assign Branch">
									<Button
										disabled={isDisabled}
										icon={<SelectOutlined />}
										type="primary"
										ghost
										onClick={() => {
											setReassignUserModalVisible(true);
											setSelectedUser({ ...user, branchId: getId(branch) });
										}}
									/>
								</Tooltip>
							</>
						)}

						<Tooltip title="Edit">
							<Button
								disabled={isDisabled}
								icon={<EditFilled />}
								type="primary"
								ghost
								onClick={() => {
									setModifyUserModalVisible(true);
									setSelectedUser({ ...user, branchId: getId(branch) });
								}}
							/>
						</Tooltip>

						{user.id !== oldestAdminId && (
							<Popconfirm
								cancelText="No"
								okText="Yes"
								placement="left"
								title="Are you sure to remove this user?"
								onConfirm={async () => {
									try {
										await requestUserDeletion(getId(user));
										message.success('User deleted successfully');
										queryClient.invalidateQueries('useUsers');
									} catch (e) {
										// Optionally handle error here
									}
								}}
							>
								<Tooltip title="Remove">
									<Button
										disabled={isDisabled}
										icon={<DeleteOutlined />}
										type="primary"
										danger
										ghost
									/>
								</Tooltip>
							</Popconfirm>
						)}
					</Space>
				),
			}));

		setDataSource(formattedUsers);
	}, [usersData?.list, params?.branchId, branchesData?.list, isConnected]);

	// const handleUserCreateSuccess = (user) => {
	// 	if (!user.online_id) {
	// 		const formattedUsers = _.cloneDeep(dataSource);
	// 		formattedUsers.unshift({
	// 			key: user.id,
	// 			id: (
	// 				<Button
	// 					className="pa-0"
	// 					type="link"
	// 					onClick={() => {
	// 						setViewUserModalVisible(true);
	// 						setSelectedUser(user);
	// 					}}
	// 				>
	// 					{user.employee_id}
	// 				</Button>
	// 			),
	// 			name: getFullName(user),
	// 			type: getUserTypeName(user.user_type),
	// 			actions: (
	// 				<UserPendingApprovalType type={userPendingApprovalTypes.CREATE} />
	// 			),
	// 		});

	// 		setDataSource(formattedUsers);
	// 	}
	// };

	return (
		<Content title="Users">
			<ConnectionAlert />

			<Box padding>
				<Spin spinning={isFetchingBranches || isFetchingUserPendingApprovals}>
					<TableHeader
						buttonName="Create User"
						onCreate={() => setModifyUserModalVisible(true)}
					/>

					<RequestErrors
						className="px-6"
						errors={[
							...convertIntoArray(branchesError, 'Branches'),
							...convertIntoArray(
								userPendingApprovalsError,
								'User Pending Approvals',
							),
							...convertIntoArray(usersError, 'Users'),
							...convertIntoArray(
								requestUserDeletionError?.errors,
								'User Deletion',
							),
						]}
						withSpaceBottom
					/>

					<Filter />

					<Table
						columns={columns}
						dataSource={dataSource}
						loading={isFetchingUsers || isRequestingUserDeletion}
						pagination={{
							current: Number(params.page) || DEFAULT_PAGE,
							total: usersData?.total || 0,
							pageSize: Number(params.pageSize) || DEFAULT_PAGE_SIZE,
							onChange: (page, newPageSize) => {
								setQueryParams({
									page,
									pageSize: newPageSize,
								});
							},
							disabled: !dataSource,
							position: ['bottomCenter'],
							pageSizeOptions,
						}}
						scroll={{ x: 1000 }}
						bordered
					/>

					{viewUserModalVisible && selectedUser && (
						<ViewUserModal
							user={selectedUser}
							onClose={() => {
								setViewUserModalVisible(false);
								setSelectedUser(null);
							}}
						/>
					)}

					{modifyUserModalVisible && (
						<ModifyUserModal
							user={selectedUser}
							onClose={() => {
								setModifyUserModalVisible(false);
								setSelectedUser(null);
							}}
							// onSuccess={handleUserCreateSuccess}
						/>
					)}

					{reassignUserModalVisible && selectedUser && (
						<BranchAssignmentUserModal
							branches={branchesData?.list || []}
							user={selectedUser}
							onClose={() => {
								setReassignUserModalVisible(false);
								setSelectedUser(null);
							}}
						/>
					)}
				</Spin>
			</Box>
		</Content>
	);
};

const Filter = () => {
	// CUSTOM HOOKS
	const { params, setQueryParams } = useQueryParams();
	const user = useUserStore((state) => state.user);
	const {
		data: branchesData,
		isFetching: isFetchingBranches,
		error: branchErrors,
	} = useBranches({
		params: { pageSize: MAX_PAGE_SIZE },
		options: { enabled: isUserFromOffice(user.user_type) },
		serviceOptions: {
			baseURL: getLocalApiUrl(),
			type: isStandAlone() ? ServiceType.ONLINE : ServiceType.OFFLINE,
		},
	});
	const handleSearchDebounced = useCallback(
		_.debounce((search) => {
			setQueryParams({ search }, { shouldResetPage: true });
		}, SEARCH_DEBOUNCE_TIME),
		[],
	);

	return (
		<div className="pa-6 pt-0">
			<RequestErrors
				errors={convertIntoArray(branchErrors, 'Branches')}
				withSpaceBottom
			/>

			<Row gutter={[16, 16]}>
				<Col lg={12} span={24}>
					<Label label="Search" spacing />
					<Input
						defaultValue={params.search}
						prefix={<SearchOutlined />}
						allowClear
						onChange={(event) =>
							handleSearchDebounced(event.target.value.trim())
						}
					/>
				</Col>

				{isUserFromOffice(user.user_type) && (
					<Col lg={12} span={24}>
						<Label label="Branch" spacing />
						<Select
							className="w-100"
							filterOption={filterOption}
							loading={isFetchingBranches}
							optionFilterProp="children"
							value={params.branchId ? Number(params.branchId) : null}
							allowClear
							showSearch
							onChange={(value) => {
								setQueryParams({ branchId: value }, { shouldResetPage: true });
							}}
						>
							<Select.Option key={NO_BRANCH_ID} value={NO_BRANCH_ID}>
								Unassigned
							</Select.Option>
							{branchesData?.list.map((branch) => (
								<Select.Option key={branch.id} value={branch.id}>
									{branch.name}
								</Select.Option>
							))}
						</Select>
					</Col>
				)}
			</Row>
		</div>
	);
};
