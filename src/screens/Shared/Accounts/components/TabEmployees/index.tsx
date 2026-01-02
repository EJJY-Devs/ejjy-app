import {
	ClockCircleFilled,
	EditFilled,
	SearchOutlined,
} from '@ant-design/icons';
import { Button, Col, Input, Row, Space, Table, Tooltip } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import {
	ModifyAccountModal,
	ModifyAttendanceScheduleModal,
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
} from 'utils';

interface Props {
	disabled: boolean;
}

const modals = {
	CREATE: 1,
	EDIT: 2,
	ATTENDANCE: 3,
};

export const TabEmployees = ({ disabled }: Props) => {
	// STATES
	const [dataSource, setDataSource] = useState([]);
	const [selectedAccount, setSelectedAccount] = useState(null);
	const [modalVisible, setModalVisible] = useState(null);

	// CUSTOM HOOKS
	const { params, setQueryParams } = useQueryParams();
	const user = useUserStore((state) => state.user);
	const {
		data: { accounts, total },
		isFetching: isFetchingAccounts,
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
		];

		if (getAppType() === appTypes.HEAD_OFFICE) {
			columns.push({
				title: 'Actions',
				dataIndex: 'actions',
				width: 100,
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
				loading={isFetchingAccounts}
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
