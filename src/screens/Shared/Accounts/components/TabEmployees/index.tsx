import {
	ClockCircleFilled,
	EditFilled,
	EyeOutlined,
	EyeInvisibleOutlined,
	SearchOutlined,
	UserOutlined,
	UserAddOutlined,
} from '@ant-design/icons';
import {
	Button,
	Col,
	Descriptions,
	Input,
	Row,
	Space,
	Table,
	Tag,
	Tooltip,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import {
	ModifyAccountModal,
	ModifyAttendanceScheduleModal,
	ModifyUserModal,
	RequestErrors,
	TableHeader,
} from 'components';
import { Label } from 'components/elements';
import { getFullName } from 'ejjy-global';
import {
	appTypes,
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	SEARCH_DEBOUNCE_TIME,
	accountTypes,
	pageSizeOptions,
} from 'global';
import { useAccounts, useQueryParams } from 'hooks';
import _ from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useUserStore } from 'stores';
import {
	convertIntoArray,
	formatDate,
	getAccountTypeName,
	getAppType,
	getUserTypeName,
} from 'utils';

interface Props {
	disabled: boolean;
}

const modals = {
	CREATE: 1,
	EDIT: 2,
	ATTENDANCE: 3,
	CREATE_USER: 4,
	EDIT_USER: 5,
};

export const TabEmployees = ({ disabled }: Props) => {
	// STATES
	const [dataSource, setDataSource] = useState([]);
	const [selectedAccount, setSelectedAccount] = useState(null);
	const [modalVisible, setModalVisible] = useState(null);
	const [showPinUserId, setShowPinUserId] = useState<number | null>(null);

	// CUSTOM HOOKS
	const { params, setQueryParams } = useQueryParams();
	const user = useUserStore((state) => state.user);
	const {
		data: { accounts, total },
		error: accountError,
		refetch: refetchAccounts,
	} = useAccounts({
		params: {
			...params,
			type: accountTypes.EMPLOYEE,
		},
	});

	// METHODS
	useEffect(() => {
		const data = accounts.map((account) => ({
			key: account.id,
			clientCode: (
				<Link to={`accounts/${account.id}`}>{account.account_code}</Link>
			),
			name: getFullName(account),
			type: getAccountTypeName(account.type),
			homeAddress: account.home_address,
			businessAddress: account.business_address,
			contactNumber: account.contact_number,
			datetimeCreated: formatDate(account.datetime_created),
			userStatus: account.user ? (
				<Tag color="green">Has User</Tag>
			) : (
				<Tag color="orange">No User</Tag>
			),
			actions: (
				<Space>
					<Tooltip title="Edit">
						<Button
							disabled={disabled}
							icon={<EditFilled />}
							type="primary"
							ghost
							onClick={() => {
								setModalVisible(modals.EDIT);
								setSelectedAccount(account);
							}}
						/>
					</Tooltip>
					{account.type === accountTypes.EMPLOYEE && (
						<>
							<Tooltip title="Set Attendance">
								<Button
									disabled={disabled}
									icon={<ClockCircleFilled />}
									type="primary"
									ghost
									onClick={() => {
										setModalVisible(modals.ATTENDANCE);
										setSelectedAccount(account);
									}}
								/>
							</Tooltip>
							{account.user ? (
								<Tooltip title="Edit User Account">
									<Button
										disabled={disabled}
										icon={<UserOutlined />}
										type="primary"
										ghost
										onClick={() => {
											setModalVisible(modals.EDIT_USER);
											setSelectedAccount(account);
										}}
									/>
								</Tooltip>
							) : (
								<Tooltip title="Create User Account">
									<Button
										disabled={disabled}
										icon={<UserAddOutlined />}
										type="primary"
										ghost
										onClick={() => {
											setModalVisible(modals.CREATE_USER);
											setSelectedAccount(account);
										}}
									/>
								</Tooltip>
							)}
						</>
					)}
				</Space>
			),
		}));

		setDataSource(data);
	}, [accounts, disabled]);

	const getColumns = useCallback(() => {
		const columns: ColumnsType = [
			{ title: 'Client Code', dataIndex: 'clientCode' },
			{ title: 'Name', dataIndex: 'name' },
			{ title: 'Type', dataIndex: 'type' },
			{ title: 'Address (Home)', dataIndex: 'homeAddress' },
			{ title: 'Address (Business)', dataIndex: 'businessAddress' },
			{ title: 'Contact #', dataIndex: 'contactNumber' },
			{ title: 'Date of Registration', dataIndex: 'datetimeCreated' },
			{ title: 'User Status', dataIndex: 'userStatus', width: 120 },
		];

		if (getAppType() === appTypes.HEAD_OFFICE) {
			columns.push({
				title: 'Actions',
				dataIndex: 'actions',
				width: 150,
				fixed: 'right',
			});
		}

		return columns;
	}, [user]);

	return (
		<div>
			<TableHeader title="Employees" wrapperClassName="pt-2 px-0" />

			<RequestErrors errors={convertIntoArray(accountError)} withSpaceBottom />

			<Filter />

			<Table
				columns={getColumns()}
				dataSource={dataSource}
				expandable={{
					expandedRowRender: (record) => {
						const account = accounts.find((a) => a.id === record.key);
						if (!account?.user) return null;

						const isPinVisible = showPinUserId === account.user.id;

						return (
							<div style={{ padding: '16px', background: '#fafafa' }}>
								<strong style={{ fontSize: '14px' }}>User Information</strong>
								<Descriptions
									column={3}
									size="small"
									style={{ marginTop: '12px' }}
									bordered
								>
									<Descriptions.Item label={<strong>Username</strong>}>
										{account.user.username}
									</Descriptions.Item>
									<Descriptions.Item label={<strong>Email</strong>}>
										{account.user.email}
									</Descriptions.Item>
									<Descriptions.Item label={<strong>User Type</strong>}>
										{getUserTypeName(account.user.user_type)}
									</Descriptions.Item>
									<Descriptions.Item label={<strong>PIN</strong>}>
										{account.user.pin ? (
											<Space>
												{isPinVisible ? account.user.pin : '••••••'}
												<Button
													icon={
														isPinVisible ? (
															<EyeInvisibleOutlined />
														) : (
															<EyeOutlined />
														)
													}
													size="small"
													type="link"
													onClick={() =>
														setShowPinUserId(
															isPinVisible ? null : account.user.id,
														)
													}
												/>
											</Space>
										) : (
											'Not Set'
										)}
									</Descriptions.Item>
									<Descriptions.Item label={<strong>Last Login</strong>}>
										{account.user.last_login
											? formatDate(account.user.last_login)
											: 'Never'}
									</Descriptions.Item>
									<Descriptions.Item label={<strong>Status</strong>}>
										<Tag color="green">Active</Tag>
									</Descriptions.Item>
								</Descriptions>
							</div>
						);
					},
					rowExpandable: (record) => {
						const account = accounts.find((a) => a.id === record.key);
						return !!account?.user;
					},
				}}
				pagination={{
					current: Number(params.page) || DEFAULT_PAGE,
					total,
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

			{(modalVisible === modals.CREATE ||
				(modalVisible === modals.EDIT && selectedAccount)) && (
				<ModifyAccountModal
					account={selectedAccount}
					onClose={() => {
						setModalVisible(null);
						setSelectedAccount(null);
					}}
					onSuccess={refetchAccounts}
				/>
			)}

			{modalVisible === modals.ATTENDANCE && selectedAccount && (
				<ModifyAttendanceScheduleModal
					account={selectedAccount}
					onClose={() => {
						setModalVisible(null);
						setSelectedAccount(null);
					}}
				/>
			)}

			{(modalVisible === modals.CREATE_USER ||
				modalVisible === modals.EDIT_USER) &&
				selectedAccount && (
					<ModifyUserModal
						account={selectedAccount}
						user={selectedAccount.user}
						onClose={() => {
							setModalVisible(null);
							setSelectedAccount(null);
						}}
						onSuccess={refetchAccounts}
					/>
				)}
		</div>
	);
};

const Filter = () => {
	const { params, setQueryParams } = useQueryParams();

	const handleSearchDebounced = useCallback(
		_.debounce((search) => {
			setQueryParams({ search }, { shouldResetPage: true });
		}, SEARCH_DEBOUNCE_TIME),
		[],
	);

	return (
		<Row className="mb-4" gutter={[16, 16]}>
			<Col lg={12} span={24}>
				<Label label="Search" spacing />
				<Input
					defaultValue={params.search}
					prefix={<SearchOutlined />}
					allowClear
					onChange={(event) => handleSearchDebounced(event.target.value.trim())}
				/>
			</Col>
		</Row>
	);
};
