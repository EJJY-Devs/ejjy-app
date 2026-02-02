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
	Table,
	Tooltip,
	message,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import {
	ModifyUserModal,
	RequestErrors,
	TableHeader,
	ViewUserModal,
} from 'components';
import { Label } from 'components/elements';
import {
	ServiceType,
	filterOption,
	getFullName,
	useBranches,
	useUserDelete,
	useUsers,
} from 'ejjy-global';
import {
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	DEV_USERNAME,
	MAX_PAGE_SIZE,
	NO_BRANCH_ID,
	SEARCH_DEBOUNCE_TIME,
	appTypes,
	pageSizeOptions,
	userTypes,
} from 'global';
import { useQueryParams, useUserPendingApprovals } from 'hooks';
import { getBaseUrl } from 'hooks/helper';
import _ from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import { useQueryClient } from 'react-query';
import { Link } from 'react-router-dom';
import {
	convertIntoArray,
	getAppType,
	getId,
	getLocalApiUrl,
	getUserTypeName,
	isStandAlone,
} from 'utils';

interface Props {
	disabled: boolean;
}

const columns: ColumnsType = [
	{ title: 'ID', dataIndex: 'id' },
	{ title: 'Name', dataIndex: 'name' },
	{ title: 'Type', dataIndex: 'type' },
	{ title: 'Actions', dataIndex: 'actions' },
];

export const TabUsers = ({ disabled }: Props) => {
	// STATES
	const [dataSource, setDataSource] = useState([]);
	const [viewUserModalVisible, setViewUserModalVisible] = useState(false);
	const [modifyUserModalVisible, setModifyUserModalVisible] = useState(false);
	const [selectedUser, setSelectedUser] = useState(null);

	// CUSTOM HOOKS
	const queryClient = useQueryClient();
	const { params, setQueryParams } = useQueryParams();
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
		error: requestUserDeletionError,
	} = useUserDelete({}, getBaseUrl());

	// METHODS
	useEffect(() => {
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
				actions:
					getAppType() === appTypes.HEAD_OFFICE ? (
						<Space>
							{user.user_type !== userTypes.ADMIN && (
								<>
									<Tooltip title="Cashiering Assignment">
										<Link to={`/office-manager/users/assign/${user.id}`}>
											<Button
												disabled={disabled}
												icon={<DesktopOutlined />}
												type="primary"
												ghost
											/>
										</Link>
									</Tooltip>

									<Tooltip title="Assign Branch">
										<Button
											disabled={disabled}
											icon={<SelectOutlined />}
											type="primary"
											ghost
											onClick={() => {
												setSelectedUser({ ...user, branchId: getId(branch) });
											}}
										/>
									</Tooltip>
								</>
							)}

							<Tooltip title="Edit">
								<Button
									disabled={disabled}
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
											disabled={disabled}
											icon={<DeleteOutlined />}
											type="primary"
											danger
											ghost
										/>
									</Tooltip>
								</Popconfirm>
							)}
						</Space>
					) : null,
			}));

		setDataSource(formattedUsers);
	}, [usersData, branchesData, disabled]);

	const handleSearchDebounced = useCallback(
		_.debounce((search) => {
			setQueryParams({ search }, { shouldResetPage: true });
		}, SEARCH_DEBOUNCE_TIME),
		[],
	);

	return (
		<div>
			<TableHeader title="Users" wrapperClassName="pt-2 px-0" />

			<RequestErrors
				errors={[
					...convertIntoArray(usersError),
					...convertIntoArray(branchesError),
					...convertIntoArray(userPendingApprovalsError),
					...convertIntoArray(requestUserDeletionError),
				]}
				withSpaceBottom
			/>

			<Row className="mb-4" gutter={[16, 16]}>
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

				<Col lg={12} span={24}>
					<Label label="Branch" spacing />
					<Select
						className="w-100"
						defaultValue={params.branchId}
						filterOption={filterOption}
						loading={isFetchingBranches}
						optionFilterProp="children"
						allowClear
						showSearch
						onChange={(value) => {
							setQueryParams({ branchId: value }, { shouldResetPage: true });
						}}
					>
						<Select.Option value={NO_BRANCH_ID}>No Branch</Select.Option>
						{branchesData?.list.map((branch) => (
							<Select.Option key={branch.id} value={branch.id}>
								{branch.name}
							</Select.Option>
						))}
					</Select>
				</Col>
			</Row>

			<Table
				columns={columns}
				dataSource={dataSource}
				loading={isFetchingUsers || isFetchingUserPendingApprovals}
				pagination={{
					current: Number(params.page) || DEFAULT_PAGE,
					total: usersData?.total,
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
				scroll={{ x: 800 }}
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

			{modifyUserModalVisible && selectedUser && (
				<ModifyUserModal
					user={selectedUser}
					onClose={() => {
						setModifyUserModalVisible(false);
						setSelectedUser(null);
						queryClient.invalidateQueries('useUsers');
					}}
				/>
			)}

			{/* {reassignUserModalVisible && selectedUser && (
				<BranchAssignmentUserModal
					user={selectedUser}
					onClose={() => {
						setReassignUserModalVisible(false);
						setSelectedUser(null);
						queryClient.invalidateQueries('useUsers');
					}}
				/>
			)} */}
		</div>
	);
};
