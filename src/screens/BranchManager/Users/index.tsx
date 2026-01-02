import { DeleteOutlined, DesktopOutlined, EditFilled } from '@ant-design/icons';
import { Button, Popconfirm, Space, Table, Tooltip } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import cn from 'classnames';
import {
	Content,
	ModifyUserModal,
	RequestErrors,
	TableHeader,
} from 'components';
import { Box } from 'components/elements';
import { getFullName, ServiceType, useUserDelete, useUsers } from 'ejjy-global';
import { appTypes, DEV_USERNAME, MAX_PAGE_SIZE, userTypes } from 'global';
import { getBaseUrl } from 'hooks/helper';
import React, { useCallback, useEffect, useState } from 'react';
import { useQueryClient } from 'react-query';
import { Link } from 'react-router-dom';
import { useUserStore } from 'stores';
import {
	convertIntoArray,
	getAppType,
	getLocalApiUrl,
	getLocalBranchId,
	getUserTypeName,
	isStandAlone,
} from 'utils';

export const Users = () => {
	// STATES
	const [modifyUserModalVisible, setModifyUserModalVisible] = useState(false);
	const [selectedUser, setSelectedUser] = useState(null);
	const [dataSource, setDataSource] = useState([]);

	// CUSTOM HOOKS
	const queryClient = useQueryClient();
	const user = useUserStore((state) => state.user);
	const {
		data: usersData,
		isFetching: isFetchingUsers,
		error: usersError,
	} = useUsers({
		params: {
			branchId: isStandAlone() ? undefined : Number(getLocalBranchId()),
			pageSize: MAX_PAGE_SIZE,
		},
		serviceOptions: {
			baseURL: getLocalApiUrl(),
			type: isStandAlone() ? ServiceType.ONLINE : ServiceType.OFFLINE,
		},
	});
	const {
		mutate: deleteUser,
		isLoading: isDeletingUser,
		error: deleteUserError,
	} = useUserDelete(
		{ onSuccess: () => queryClient.invalidateQueries('useUsers') },
		getBaseUrl(),
	);

	// METHODS
	useEffect(() => {
		const data = usersData?.list
			.filter((filteredUser) => {
				const isDev = filteredUser.username === DEV_USERNAME;

				const isAdminAndNotStandalone =
					filteredUser.user_type === userTypes.ADMIN && !isStandAlone();

				return !(isDev || isAdminAndNotStandalone);
			})
			.map((mappedUser) => ({
				key: mappedUser.id,
				id: mappedUser.employee_id,
				name: getFullName(mappedUser),
				type: getUserTypeName(mappedUser.user_type),
				actions: (
					<Space>
						{mappedUser.user_type !== userTypes.ADMIN && (
							<Tooltip title="Cashiering Assignment">
								<Link to={`/branch-manager/users/assign/${mappedUser.id}`}>
									<Button icon={<DesktopOutlined />} type="primary" ghost />
								</Link>
							</Tooltip>
						)}
						<Tooltip title="Edit">
							<Button
								icon={<EditFilled />}
								type="primary"
								ghost
								onClick={() => {
									setSelectedUser(mappedUser);
									setModifyUserModalVisible(true);
								}}
							>
								Edit
							</Button>
						</Tooltip>
						{mappedUser.user_type !== userTypes.ADMIN && (
							<Popconfirm
								cancelText="No"
								okText="Yes"
								placement="left"
								title="Are you sure to remove this user?"
								onConfirm={() => deleteUser(mappedUser.id)}
							>
								<Button icon={<DeleteOutlined />} type="primary" danger ghost />
							</Popconfirm>
						)}
					</Space>
				),
			}));

		setDataSource(data);
	}, [usersData?.list]);

	const getColumns = useCallback(() => {
		const columns: ColumnsType = [
			{ title: 'ID', dataIndex: 'id' },
			{ title: 'Name', dataIndex: 'name' },
			{ title: 'Type', dataIndex: 'type' },
		];

		if (getAppType() === appTypes.HEAD_OFFICE) {
			columns.push({ title: 'Actions', dataIndex: 'actions' });
		}

		return columns;
	}, [user]);

	const handleSuccess = (addedUser) => {
		queryClient.setQueriesData<any>('useUsers', (cachedData) => {
			cachedData.data.results = [addedUser, ...cachedData.data.results];
			return cachedData;
		});
	};

	return (
		<Content title="Users">
			<Box padding>
				{getAppType() === appTypes.HEAD_OFFICE && (
					<TableHeader
						buttonName="Create User"
						onCreate={() => setModifyUserModalVisible(true)}
					/>
				)}

				<RequestErrors
					className={cn('px-6', {
						'mt-6': getAppType() !== appTypes.HEAD_OFFICE,
					})}
					errors={[
						...convertIntoArray(usersError),
						...convertIntoArray(deleteUserError?.errors),
					]}
					withSpaceBottom
				/>

				<Table
					columns={getColumns()}
					dataSource={dataSource}
					loading={isFetchingUsers || isDeletingUser}
					pagination={false}
					scroll={{ x: 650 }}
					bordered
				/>
			</Box>

			{modifyUserModalVisible && (
				<ModifyUserModal
					user={selectedUser}
					branchUsersOnly
					onClose={() => {
						setSelectedUser(null);
						setModifyUserModalVisible(false);
					}}
					onSuccess={handleSuccess}
				/>
			)}
		</Content>
	);
};
