import { Button, Col, Row, Select, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { RequestErrors, TableHeader, TimeRangeFilter } from 'components';
import { Label } from 'components/elements';
import {
	Branch,
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	EMPTY_CELL,
	MAX_PAGE_SIZE,
	NaacFields,
	PWDFields,
	ServiceType,
	SpecialDiscountCode,
	Transaction,
	ViewTransactionModal,
	filterOption,
	formatInPeso,
	getComputedDiscount,
	getDiscountFields,
	getFullName,
	timeRangeTypes,
	useBranchMachines,
	useDiscountOptions,
	useQueryParams,
	useTransactions,
	useUsers,
} from 'ejjy-global';
import { pageSizeOptions } from 'global';
import { useSiteSettingsNew } from 'hooks';
import React, { ReactNode, useEffect, useState } from 'react';
import { convertIntoArray, getLocalApiUrl, isStandAlone } from 'utils';

const columns: ColumnsType = [
	{
		title: 'Invoice #',
		dataIndex: 'invoiceNumber',
		fixed: 'left',
	},
	{
		title: 'Client Name',
		dataIndex: 'clientName',
	},
	{
		title: 'ID Number',
		dataIndex: 'idNumber',
	},
	{
		title: 'Discount Name',
		dataIndex: 'discountName',
	},
	{
		title: 'Gross Amount',
		dataIndex: 'grossAmount',
	},
	{
		title: 'Discount',
		dataIndex: 'discount',
	},
	{
		title: 'VAT Amount',
		dataIndex: 'vatAmount',
	},
	{
		title: 'Amount Due',
		dataIndex: 'amountDue',
	},
];

type Props = {
	branch?: Branch;
	branchMachineId?: number;
};

export const TabDiscountedTransactions = ({
	branch,
	branchMachineId,
}: Props) => {
	// STATES
	const [dataSource, setDataSource] = useState([]);
	const [
		selectedTransaction,
		setSelectedTransaction,
	] = useState<Transaction | null>(null);

	// CUSTOM HOOKS
	const { params, setQueryParams } = useQueryParams();
	const {
		data: transactionsData,
		isFetching: isFetchingTransactions,
		error: transactionsError,
	} = useTransactions({
		params: {
			timeRange: timeRangeTypes.DAILY,
			discountName: '*',
			...params,
			branchId: branch?.id,
			branchMachineId,
		},
		serviceOptions: {
			baseURL: getLocalApiUrl(),
			type: isStandAlone() ? ServiceType.ONLINE : ServiceType.OFFLINE,
		},
	});
	const { data: siteSettings } = useSiteSettingsNew();

	// METHODS
	useEffect(() => {
		if (transactionsData?.list) {
			const data = transactionsData.list.map((transaction) => {
				const discountOption = transaction.adjustment_remarks.discount_option;
				let cliendId = transaction.client?.id?.toString();
				let clientName: string | ReactNode[] = transaction.client?.name;

				if (discountOption.is_special_discount) {
					const fields = getDiscountFields(
						discountOption.code as SpecialDiscountCode,
						transaction.discount_option_additional_fields_values || '',
					);

					cliendId = fields?.id;
					clientName =
						(fields as NaacFields)?.coach || (fields as PWDFields)?.name;
				} else if (
					transaction.discount_option_additional_fields_values?.length
				) {
					const discountOptionFields = JSON.parse(
						transaction.discount_option_additional_fields_values,
					);

					const fields = Object.keys(discountOptionFields).map((key) => ({
						key,
						value: discountOptionFields[key],
					}));

					clientName = fields.map(({ key, value }) => (
						<div key={key}>
							{key}: {value}
						</div>
					));
				}

				return {
					key: transaction.id,
					invoiceNumber: (
						<Button
							type="link"
							onClick={() => setSelectedTransaction(transaction)}
						>
							{transaction.invoice.or_number}
						</Button>
					),
					clientName: clientName || EMPTY_CELL,
					idNumber: cliendId || EMPTY_CELL,
					discountName: discountOption.name,
					grossAmount: formatInPeso(transaction.gross_amount),
					discount: formatInPeso(getComputedDiscount(transaction)),
					vatAmount: formatInPeso(transaction.invoice.vat_amount),
					amountDue: formatInPeso(transaction.total_amount),
				};
			});

			setDataSource(data);
		}
	}, [transactionsData]);

	return (
		<>
			<TableHeader
				title="Discounted Transactions"
				wrapperClassName="pt-2 px-0"
			/>

			<Filter branchMachineId={branchMachineId} />

			<RequestErrors errors={convertIntoArray(transactionsError)} />

			<Table
				columns={columns}
				dataSource={dataSource}
				loading={isFetchingTransactions}
				pagination={{
					current: Number(params.page) || DEFAULT_PAGE,
					total: transactionsData?.total,
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

			{selectedTransaction && (
				<ViewTransactionModal
					siteSettings={siteSettings}
					transaction={selectedTransaction}
					onClose={() => setSelectedTransaction(null)}
				/>
			)}
		</>
	);
};

type FilterProps = Pick<Props, 'branchMachineId'>;

const Filter = ({ branchMachineId }: FilterProps) => {
	const { params, setQueryParams } = useQueryParams();
	const {
		data: usersData,
		isFetching: isFetchingUsers,
		error: usersError,
	} = useUsers({
		params: { pageSize: MAX_PAGE_SIZE },
		serviceOptions: {
			baseURL: getLocalApiUrl(),
			type: isStandAlone() ? ServiceType.ONLINE : ServiceType.OFFLINE,
		},
	});
	const {
		data: branchMachinesData,
		isFetching: isFetchingBranchMachines,
		error: branchMachinesError,
	} = useBranchMachines({
		params: { pageSize: MAX_PAGE_SIZE },
		options: { enabled: !branchMachineId },
		serviceOptions: {
			baseURL: getLocalApiUrl(),
			type: isStandAlone() ? ServiceType.ONLINE : ServiceType.OFFLINE,
		},
	});
	const {
		data: discountOptionsData,
		isFetching: isFetchingDiscountOptions,
		error: discountOptionsErrors,
	} = useDiscountOptions({
		params: { pageSize: MAX_PAGE_SIZE },
		serviceOptions: {
			baseURL: getLocalApiUrl(),
			type: isStandAlone() ? ServiceType.ONLINE : ServiceType.OFFLINE,
		},
	});

	return (
		<>
			<RequestErrors
				errors={[
					...convertIntoArray(branchMachinesError, 'Branch Machines'),
					...convertIntoArray(discountOptionsErrors, 'Discount Options'),
					...convertIntoArray(usersError, 'Users'),
				]}
				withSpaceBottom
			/>
			<Row className="mb-4" gutter={[16, 16]}>
				<Col lg={12} span={24}>
					<Label label="User" spacing />
					<Select
						className="w-100"
						filterOption={filterOption}
						loading={isFetchingUsers}
						optionFilterProp="children"
						value={params.tellerId ? Number(params.tellerId) : null}
						allowClear
						showSearch
						onChange={(value) => {
							setQueryParams({ tellerId: value }, { shouldResetPage: true });
						}}
					>
						{usersData?.list.map((user) => (
							<Select.Option key={user.id} value={user.id}>
								{getFullName(user)}
							</Select.Option>
						))}
					</Select>
				</Col>

				<Col lg={12} span={24}>
					<Label label="Discount Options" spacing />
					<Select
						className="w-100"
						filterOption={filterOption}
						loading={isFetchingDiscountOptions}
						optionFilterProp="children"
						value={params.discountName ? params.discountName : null}
						allowClear
						showSearch
						onChange={(value) => {
							setQueryParams(
								{ discountName: value },
								{ shouldResetPage: true },
							);
						}}
					>
						{discountOptionsData?.list.map((discountOption) => (
							<Select.Option
								key={discountOption.id}
								value={discountOption.name}
							>
								{discountOption.name}
							</Select.Option>
						))}
					</Select>
				</Col>

				{!branchMachineId && (
					<Col lg={12} span={24}>
						<Label label="Branch Machine" spacing />
						<Select
							className="w-100"
							filterOption={filterOption}
							loading={isFetchingBranchMachines}
							optionFilterProp="children"
							value={
								params.branchMachineId ? Number(params.branchMachineId) : null
							}
							allowClear
							showSearch
							onChange={(value) => {
								setQueryParams(
									{ branchMachineId: value },
									{ shouldResetPage: true },
								);
							}}
						>
							{branchMachinesData?.list.map(({ id, name }) => (
								<Select.Option key={id} value={id}>
									{name}
								</Select.Option>
							))}
						</Select>
					</Col>
				)}

				<Col lg={12} span={24}>
					<TimeRangeFilter />
				</Col>
			</Row>
		</>
	);
};
