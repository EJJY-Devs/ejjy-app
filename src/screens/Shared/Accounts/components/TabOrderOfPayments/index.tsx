import { Button, Col, Row, Select, Spin, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { RequestErrors, TableHeader, TimeRangeFilter } from 'components';
import { Label } from 'components/elements';
import {
	getFullName,
	ServiceType,
	useAccounts,
	useOrderOfPayments,
	ViewOrderOfPaymentModal,
	ViewTransactionModal,
} from 'ejjy-global';
import {
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	EMPTY_CELL,
	orderOfPaymentPurposes,
	pageSizeOptions,
	SEARCH_DEBOUNCE_TIME,
	timeRangeTypes,
} from 'global';
import { useQueryParams, useSiteSettingsNew } from 'hooks';
import _ from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import {
	convertIntoArray,
	formatDateTime,
	formatInPeso,
	getLocalApiUrl,
} from 'utils';

const columns: ColumnsType = [
	{ title: 'OP #', dataIndex: 'referenceNumber' },
	{ title: 'Date & Time Created', dataIndex: 'datetime' },
	{ title: 'Payor', dataIndex: 'payor' },
	{ title: 'Address', dataIndex: 'address' },
	{ title: 'Amount of Payment', dataIndex: 'amountOfPayment' },
	{ title: 'Purpose', dataIndex: 'purpose' },
	{ title: 'Charge Sales Invoice', dataIndex: 'chargeSalesInvoice' },
];

export const TabOrderOfPayments = () => {
	// STATES
	const [dataSource, setDataSource] = useState([]);
	const [selectedTransaction, setSelectedTransaction] = useState(null);
	const [selectedOrderOfPayment, setSelectedOrderOfPayment] = useState(null);

	// CUSTOM HOOKS
	const { params, setQueryParams } = useQueryParams();
	const { data: siteSettings } = useSiteSettingsNew();
	const {
		data: orderOfPaymentsData,
		isFetching: isFetchingOrderOfPayments,
		error: orderOfPaymentsError,
	} = useOrderOfPayments({
		params: {
			...params,
			timeRange: (params?.timeRange || timeRangeTypes.DAILY) as string,
		},
		serviceOptions: {
			type: ServiceType.OFFLINE,
			baseURL: getLocalApiUrl(),
		},
	});

	// METHODS
	useEffect(() => {
		const formattedOrderOfPayments = orderOfPaymentsData?.list.map(
			(orderOfPayment) => {
				const {
					id,
					reference_number,
					datetime_created,
					amount,
					payor,
					purpose,
					extra_description,
					charge_sales_transaction,
				} = orderOfPayment;

				let purposeDescription = extra_description;
				if (purpose === orderOfPaymentPurposes.PARTIAL_PAYMENT) {
					purposeDescription = 'Partial Payment';
				} else if (purpose === orderOfPaymentPurposes.FULL_PAYMENT) {
					purposeDescription = 'Full Payment';
				}

				return {
					key: id,
					referenceNumber: (
						<Button
							className="pa-0"
							type="link"
							onClick={() => setSelectedOrderOfPayment(orderOfPayment)}
						>
							{reference_number || id}
						</Button>
					),
					datetime: formatDateTime(datetime_created),
					payor: getFullName(payor),
					address: payor.home_address,
					amountOfPayment: formatInPeso(amount),
					purpose: purposeDescription,
					chargeSalesInvoice: charge_sales_transaction?.invoice ? (
						<>
							<Button
								className="pa-0"
								type="link"
								onClick={() => setSelectedTransaction(charge_sales_transaction)}
							>
								{charge_sales_transaction.invoice.or_number}
							</Button>
							<span>
								{' '}
								-{' '}
								{formatDateTime(
									charge_sales_transaction.invoice.datetime_created,
								)}
							</span>
						</>
					) : (
						EMPTY_CELL
					),
				};
			},
		);

		setDataSource(formattedOrderOfPayments);
	}, [orderOfPaymentsData?.list]);

	return (
		<div>
			<TableHeader title="Order of Payments" wrapperClassName="pt-2 px-0" />

			<RequestErrors
				errors={convertIntoArray(orderOfPaymentsError)}
				withSpaceBottom
			/>

			<Filter isLoading={isFetchingOrderOfPayments} />

			<Table
				columns={columns}
				dataSource={dataSource}
				loading={isFetchingOrderOfPayments}
				pagination={{
					current: Number(params.page) || DEFAULT_PAGE,
					total: orderOfPaymentsData?.total || 0,
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
				scroll={{ x: 1200 }}
				bordered
			/>

			{selectedTransaction && (
				<ViewTransactionModal
					siteSettings={siteSettings}
					transaction={selectedTransaction}
					onClose={() => setSelectedTransaction(null)}
				/>
			)}

			{selectedOrderOfPayment && (
				<ViewOrderOfPaymentModal
					orderOfPayment={selectedOrderOfPayment}
					onClose={() => setSelectedOrderOfPayment(null)}
				/>
			)}
		</div>
	);
};

type FilterProps = {
	isLoading: boolean;
};

const Filter = ({ isLoading }: FilterProps) => {
	// STATES
	const [accountSearch, setAccountSearch] = useState('');

	// CUSTOM HOOKS
	const { params, setQueryParams } = useQueryParams();
	const { data: accountsData, isFetching: isFetchingAccounts } = useAccounts({
		params: { search: accountSearch },
		serviceOptions: { baseURL: getLocalApiUrl() },
	});

	// METHODS
	const handleSearchDebounced = useCallback(
		_.debounce((search) => {
			setAccountSearch(search);
		}, SEARCH_DEBOUNCE_TIME),
		[],
	);

	return (
		<Row className="mb-4" gutter={[16, 16]}>
			<Col lg={12} span={24}>
				<Label label="Payor" spacing />
				<Select
					className="w-100"
					defaultActiveFirstOption={false}
					filterOption={false}
					notFoundContent={isFetchingAccounts ? <Spin size="small" /> : null}
					value={params.payorId ? Number(params.payorId) : null}
					allowClear
					showSearch
					onChange={(value) => {
						setQueryParams({ payorId: value }, { shouldResetPage: true });
					}}
					onSearch={handleSearchDebounced}
				>
					{accountsData?.list?.map((account) => (
						<Select.Option key={account.id} value={account.id}>
							{getFullName(account)}
						</Select.Option>
					))}
				</Select>
			</Col>
			<Col lg={12} span={24}>
				<TimeRangeFilter disabled={isLoading} />
			</Col>
		</Row>
	);
};
