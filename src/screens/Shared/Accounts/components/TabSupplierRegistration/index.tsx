import { DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Col, Input, Popconfirm, Row, Table, Tooltip } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import {
	CreateSupplierRegistrationModal,
	RequestErrors,
	TableHeader,
	ViewAccountModal,
} from 'components';
import { Label } from 'components/elements';
import { getFullName } from 'ejjy-global';
import {
	appTypes,
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	SEARCH_DEBOUNCE_TIME,
	pageSizeOptions,
} from 'global';
import {
	useQueryParams,
	useSupplierRegistrationDelete,
	useSupplierRegistrations,
} from 'hooks';
import _ from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useUserStore } from 'stores';
import { convertIntoArray, formatDate, getAppType } from 'utils';

const columns: ColumnsType = [
	{ title: 'Client Code', dataIndex: 'clientCode' },
	{ title: 'Client Name', dataIndex: 'clientName' },
	{ title: 'Date of Registration', dataIndex: 'datetimeCreated' },
	{ title: 'Actions', dataIndex: 'actions' },
];

interface Props {
	disabled: boolean;
}

export const TabSupplierRegistrations = ({ disabled }: Props) => {
	// STATES
	const [dataSource, setDataSource] = useState([]);
	const [selectedAccount, setSelectedAccount] = useState(null);
	const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);

	// CUSTOM HOOKS
	const { params, setQueryParams } = useQueryParams();
	const user = useUserStore((state) => state.user);
	const {
		data: { supplierRegistrations, total },
		isFetching: isFetchingSupplierRegistrations,
		error: supplierRegistrationsError,
	} = useSupplierRegistrations({ params });
	const {
		mutateAsync: deleteSupplierRegistration,
		isLoading: isDeletingSupplierRegistration,
		error: deleteSupplierRegistrationError,
	} = useSupplierRegistrationDelete();

	// METHODS
	useEffect(() => {
		const data = supplierRegistrations.map((supplierRegistration) => {
			const { id, account } = supplierRegistration;

			return {
				key: id,
				clientCode: (
					<Link to={`accounts/${account.id}`}>{account.account_code}</Link>
				),
				clientName: getFullName(account),
				datetimeCreated: formatDate(account.datetime_created),
				actions: (
					<>
						{getAppType() === appTypes.HEAD_OFFICE && (
							<Popconfirm
								cancelText="No"
								disabled={disabled}
								okText="Yes"
								placement="left"
								title="Are you sure to remove this?"
								onConfirm={async () => {
									await deleteSupplierRegistration(id);
								}}
							>
								<Tooltip title="Remove">
									<Button
										icon={<DeleteOutlined />}
										type="primary"
										danger
										ghost
									/>
								</Tooltip>
							</Popconfirm>
						)}
					</>
				),
			};
		});

		setDataSource(data);
	}, [supplierRegistrations, disabled]);

	return (
		<div>
			<TableHeader
				buttonName="Create Supplier Account"
				title="Supplier Accounts"
				wrapperClassName="pt-2 px-0"
				onCreate={
					getAppType() === appTypes.HEAD_OFFICE
						? () => setIsCreateModalVisible(true)
						: null
				}
				onCreateDisabled={disabled}
			/>

			<RequestErrors
				errors={[
					...convertIntoArray(supplierRegistrationsError),
					...convertIntoArray(deleteSupplierRegistrationError?.errors),
				]}
				withSpaceBottom
			/>

			<Filter />

			<Table
				columns={columns}
				dataSource={dataSource}
				loading={
					isFetchingSupplierRegistrations || isDeletingSupplierRegistration
				}
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
				scroll={{ x: 800 }}
				bordered
			/>

			{selectedAccount && (
				<ViewAccountModal
					account={selectedAccount}
					onClose={() => setSelectedAccount(null)}
				/>
			)}

			{isCreateModalVisible && (
				<CreateSupplierRegistrationModal
					onClose={() => {
						setIsCreateModalVisible(false);
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
