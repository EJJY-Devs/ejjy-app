import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { Button, message, Space, Tooltip } from 'antd';
import Table, { ColumnsType } from 'antd/lib/table';
import { Content, RequestErrors, TableHeader } from 'components';
import { Box } from 'components/elements';
import {
	getFullName,
	ServiceType,
	UserPendingApprovalType,
	userPendingApprovalTypes,
	useUserApproveUserPendingApproval,
	useUserDeclineUserPendingApproval,
	useUsers,
} from 'ejjy-global';
import { MAX_PAGE_SIZE } from 'global';
import { getBaseUrl } from 'hooks/helper';
import React, { useEffect, useState } from 'react';
import { convertIntoArray, getGoogleApiUrl, getUserTypeName } from 'utils';

const columns: ColumnsType = [
	{ title: 'Name', dataIndex: 'name' },
	{ title: 'User Type', dataIndex: 'userType' },
	{ title: 'Actions', dataIndex: 'actions' },
];

export const Users = () => {
	const {
		mutateAsync: approveUserPendingApproval,
		isLoading: isApprovingUserPendingApproval,
		error: approveUserPendingApprovalError,
	} = useUserApproveUserPendingApproval(null, getBaseUrl());
	const {
		mutate: declineUserPendingApproval,
		isLoading: isDecliningUserPendingApproval,
		error: declineUserPendingApprovalError,
	} = useUserDeclineUserPendingApproval(null, getBaseUrl());

	const handleApprove = async (id: number, type: UserPendingApprovalType) => {
		await approveUserPendingApproval({
			id,
			pendingApprovalType: type,
		});

		if (type === userPendingApprovalTypes.CREATE) {
			message.success("User's creation was approved successfully");
		} else if (type === userPendingApprovalTypes.UPDATE_USER_TYPE) {
			message.success("User's type change request was updated successfully");
		} else {
			message.success("User's deletion was approved successfully");
		}
	};

	const handleDecline = async (id: number, type: UserPendingApprovalType) => {
		await declineUserPendingApproval({
			id,
			pendingApprovalType: type,
		});

		if (type === userPendingApprovalTypes.CREATE) {
			message.success("User's creation was declined successfully");
		} else if (type === userPendingApprovalTypes.UPDATE_USER_TYPE) {
			message.success("User's type change request was declined successfully");
		} else {
			message.success("User's deletion was declined successfully");
		}
	};

	const isLoading =
		isApprovingUserPendingApproval || isDecliningUserPendingApproval;

	const errors = [
		...convertIntoArray(approveUserPendingApprovalError?.errors),
		...convertIntoArray(declineUserPendingApprovalError?.errors),
	];

	return (
		<Content className="Users" title="Users">
			<PendingUserRequests
				errors={userPendingApprovalTypes.CREATE ? errors : []}
				isLoading={userPendingApprovalTypes.CREATE ? isLoading : false}
				title="Pending User Creation"
				type={userPendingApprovalTypes.CREATE}
				isPendingCreateApproval
				onApprove={handleApprove}
				onDecline={handleDecline}
			/>

			<PendingUserRequests
				errors={userPendingApprovalTypes.UPDATE_USER_TYPE ? errors : []}
				isLoading={
					userPendingApprovalTypes.UPDATE_USER_TYPE ? isLoading : false
				}
				title="Pending User Type Update"
				type={userPendingApprovalTypes.UPDATE_USER_TYPE}
				isPendingUpdateUserTypeApproval
				onApprove={handleApprove}
				onDecline={handleDecline}
			/>

			<PendingUserRequests
				errors={userPendingApprovalTypes.DELETE ? errors : []}
				isLoading={userPendingApprovalTypes.DELETE ? isLoading : false}
				title="Pending User Deletion"
				type={userPendingApprovalTypes.DELETE}
				isPendingDeleteApproval
				onApprove={handleApprove}
				onDecline={handleDecline}
			/>
		</Content>
	);
};

type Props = {
	type: UserPendingApprovalType;
	title: string;
	errors?: string[];
	isPendingCreateApproval?: boolean;
	isPendingUpdateUserTypeApproval?: boolean;
	isPendingDeleteApproval?: boolean;
	isLoading: boolean;
	onApprove: (id: number, type: UserPendingApprovalType) => void;
	onDecline: (id: number, type: UserPendingApprovalType) => void;
};

const PendingUserRequests = ({
	type,
	title,
	errors,
	isPendingCreateApproval,
	isPendingUpdateUserTypeApproval,
	isPendingDeleteApproval,
	isLoading,
	onApprove,
	onDecline,
}: Props) => {
	// STATES
	const [dataSource, setDataSource] = useState([]);

	// CUSTOM HOOKS
	const {
		data: usersData,
		isFetching: isFetchingUsers,
		error: userError,
	} = useUsers({
		params: {
			isPendingCreateApproval,
			isPendingUpdateUserTypeApproval,
			isPendingDeleteApproval,
			pageSize: MAX_PAGE_SIZE,
		},
		serviceOptions: {
			baseURL: getGoogleApiUrl(),
			type: ServiceType.ONLINE,
		},
	});

	// METHODS
	useEffect(() => {
		const data = usersData?.list.map((user) => {
			const { id, user_type } = user;

			return {
				key: id,
				name: getFullName(user),
				userType: getUserTypeName(user_type),
				actions: (
					<Space>
						<Tooltip title="Approve">
							<Button
								icon={<CheckCircleOutlined />}
								type="primary"
								ghost
								onClick={() => onApprove(id, type)}
							/>
						</Tooltip>
						<Tooltip title="Reject">
							<Button
								icon={<CloseCircleOutlined />}
								type="primary"
								danger
								ghost
								onClick={() => onDecline(id, type)}
							/>
						</Tooltip>
					</Space>
				),
			};
		});

		setDataSource(data);
	}, [usersData?.list]);

	return (
		<Box padding>
			<TableHeader title={title} />

			<RequestErrors
				className="px-6"
				errors={[...convertIntoArray(userError), ...errors]}
				withSpaceBottom
			/>

			<Table
				columns={columns}
				dataSource={dataSource}
				loading={isFetchingUsers || isLoading}
				pagination={false}
				scroll={{ x: 800 }}
				bordered
			/>
		</Box>
	);
};
