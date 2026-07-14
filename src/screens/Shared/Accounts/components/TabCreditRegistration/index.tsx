import {
	DollarOutlined,
	EditFilled,
	EyeFilled,
	FileDoneOutlined,
	SearchOutlined,
} from '@ant-design/icons';
import { Button, Col, Input, Row, Space, Table, Tooltip } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import {
	ModifyCreditRegistrationModal,
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
import { useCreditRegistrations, useQueryParams } from 'hooks';
import _ from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TabCollectionReceipts } from 'screens/Shared/Accounts/components/TabCollectionReceipts';
import { TabCreditTransactions } from 'screens/Shared/Accounts/components/TabCreditTransactions';
import { TabOrderOfPayments } from 'screens/Shared/Accounts/components/TabOrderOfPayments';
import { accountViews } from 'screens/Shared/Accounts/data';
import { convertIntoArray, formatDate, formatInPeso, getAppType } from 'utils';

const columns: ColumnsType = [
	{ title: 'Client Code', dataIndex: 'clientCode' },
	{ title: 'Client Name', dataIndex: 'clientName' },
	{ title: 'Credit Limit', dataIndex: 'creditLimit' },
	{ title: 'Total Balance', dataIndex: 'totalBalance' },
	{ title: 'Date of Registration', dataIndex: 'datetimeCreated' },
	{ title: 'Actions', dataIndex: 'actions' },
];

interface Props {
	disabled: boolean;
}

export const TabCreditRegistrations = ({ disabled }: Props) => {
	// STATES
	const [dataSource, setDataSource] = useState([]);
	const [selectedAccount, setSelectedAccount] = useState(null);
	const [selectedCreditRegistration, setSelectedCreditRegistration] = useState(
		null,
	);
	const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);

	// CUSTOM HOOKS
	const { params, setQueryParams } = useQueryParams();
	const {
		data: { creditRegistrations, total },
		isFetching: isFetchingCreditRegistrations,
		error: creditRegistrationsError,
	} = useCreditRegistrations({ params: { ...params, isActive: true } });

	// METHODS
	useEffect(() => {
		const data = creditRegistrations.map((creditRegistration) => {
			const { id, account, credit_limit, total_balance } = creditRegistration;

			return {
				key: id,
				clientCode: (
					<Link to={`accounts/${account.id}`}>{account.account_code}</Link>
				),
				clientName: getFullName(account),
				creditLimit: formatInPeso(credit_limit),
				totalBalance: formatInPeso(total_balance),
				datetimeCreated: formatDate(account.datetime_created),
				actions: (
					<Space>
						{getAppType() === appTypes.HEAD_OFFICE && (
							<Tooltip title="Edit">
								<Button
									disabled={disabled}
									icon={<EditFilled />}
									type="primary"
									ghost
									onClick={() =>
										setSelectedCreditRegistration(creditRegistration)
									}
								/>
							</Tooltip>
						)}
						<Tooltip title="View Credit Transactions">
							<Button
								disabled={disabled}
								icon={<EyeFilled />}
								type="primary"
								ghost
								onClick={() => {
									setQueryParams(
										{
											payorId: creditRegistration.account.id,
											accountView: accountViews.TRANSACTIONS,
										},
										{ shouldResetPage: true },
									);
								}}
							/>
						</Tooltip>
						<Tooltip title="View Order of Payments">
							<Button
								disabled={disabled}
								icon={<DollarOutlined />}
								type="primary"
								ghost
								onClick={() => {
									setQueryParams(
										{
											payorId: creditRegistration.account.id,
											accountView: accountViews.ORDER_OF_PAYMENTS,
										},
										{ shouldResetPage: true },
									);
								}}
							/>
						</Tooltip>
						<Tooltip title="View Collection Receipts">
							<Button
								disabled={disabled}
								icon={<FileDoneOutlined />}
								type="primary"
								ghost
								onClick={() => {
									setQueryParams(
										{
											payorId: creditRegistration.account.id,
											accountView: accountViews.COLLECTION_RECEIPTS,
										},
										{ shouldResetPage: true },
									);
								}}
							/>
						</Tooltip>
					</Space>
				),
			};
		});

		setDataSource(data);
	}, [creditRegistrations, disabled]);

	if (params.payorId) {
		const onBack = () =>
			setQueryParams(
				{ payorId: undefined, accountView: undefined },
				{ shouldResetPage: true },
			);

		if (params.accountView === accountViews.ORDER_OF_PAYMENTS) {
			return <TabOrderOfPayments onBack={onBack} />;
		}

		if (params.accountView === accountViews.COLLECTION_RECEIPTS) {
			return <TabCollectionReceipts onBack={onBack} />;
		}

		return <TabCreditTransactions onBack={onBack} />;
	}

	return (
		<div>
			<TableHeader
				buttonName="Create Credit Account"
				title="Credit Accounts"
				wrapperClassName="pt-2 px-0"
				onCreate={
					getAppType() === appTypes.HEAD_OFFICE
						? () => setIsCreateModalVisible(true)
						: null
				}
				onCreateDisabled={disabled}
			/>

			<RequestErrors
				errors={convertIntoArray(creditRegistrationsError)}
				withSpaceBottom
			/>

			<Filter />

			<Table
				columns={columns}
				dataSource={dataSource}
				loading={isFetchingCreditRegistrations}
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

			{(isCreateModalVisible || selectedCreditRegistration) && (
				<ModifyCreditRegistrationModal
					creditRegistration={selectedCreditRegistration}
					onClose={() => {
						setIsCreateModalVisible(false);
						setSelectedCreditRegistration(null);
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
