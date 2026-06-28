import { Button, Col, DatePicker, Row, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { RequestErrors, TableHeader } from 'components';
import { Label } from 'components/elements';
import {
	ViewDeliveryInvoiceModal,
	getFullName,
	useDeliveryInvoices,
} from 'ejjy-global';
import {
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	pageSizeOptions,
	timeRangeTypes,
} from 'global';
import { useQueryParams, useSiteSettingsNew } from 'hooks';
import _ from 'lodash';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import {
	convertIntoArray,
	formatDateTime,
	formatInPeso,
	getLocalApiUrl,
} from 'utils';

const columns: ColumnsType = [
	{ title: 'Date & Time', dataIndex: 'dateTime' },
	{ title: 'OR Number', dataIndex: 'orNumber' },
	{ title: 'Creditor Account', dataIndex: 'creditorAccount' },
	{ title: 'Total Amount', dataIndex: 'totalAmount' },
	{ title: 'Cashier', dataIndex: 'cashier' },
	{ title: 'Authorizer', dataIndex: 'authorizer' },
];

interface Props {
	branchMachineId: number;
}

export const TabDeliveryInvoice = ({ branchMachineId }: Props) => {
	// STATES
	const [dataSource, setDataSource] = useState([]);
	const [selectedDeliveryInvoice, setSelectedDeliveryInvoice] = useState<
		any | null
	>(null);

	// CUSTOM HOOKS
	const { params, setQueryParams } = useQueryParams();
	const { data: siteSettings } = useSiteSettingsNew();
	const {
		data,
		error: deliveryInvoicesError,
		isFetching: isFetchingDeliveryInvoices,
		isFetchedAfterMount: isDeliveryInvoicesFetchedAfterMount,
	} = useDeliveryInvoices({
		params: {
			branchMachineId,
			timeRange: (params?.timeRange as string) || timeRangeTypes.DAILY,
		},
		serviceOptions: { baseURL: getLocalApiUrl() },
	});

	// METHODS
	useEffect(() => {
		const invoices = data?.list || [];
		const rows = invoices.map((invoice: any) => ({
			key: invoice.id,
			dateTime: formatDateTime(invoice.datetime_created),
			orNumber: (
				<Button
					className="pa-0"
					type="link"
					onClick={() => setSelectedDeliveryInvoice(invoice)}
				>
					{invoice.or_number}
				</Button>
			),
			creditorAccount: getFullName(invoice.creditor_account) || '-',
			totalAmount: formatInPeso(invoice.total_amount),
			cashier: getFullName(invoice.teller),
			authorizer: getFullName(invoice.authorizer),
		}));

		setDataSource(rows);
	}, [data]);

	return (
		<>
			<TableHeader
				title="Delivery Invoice Report"
				wrapperClassName="pt-2 px-0"
			/>

			<Filter
				isLoading={
					isFetchingDeliveryInvoices && !isDeliveryInvoicesFetchedAfterMount
				}
			/>

			<RequestErrors errors={convertIntoArray(deliveryInvoicesError)} />

			<Table
				columns={columns}
				dataSource={dataSource}
				loading={
					isFetchingDeliveryInvoices && !isDeliveryInvoicesFetchedAfterMount
				}
				pagination={{
					current: Number(params.page) || DEFAULT_PAGE,
					total: data?.total || 0,
					pageSize: Number(params.pageSize) || DEFAULT_PAGE_SIZE,
					onChange: (page, newPageSize) => {
						setQueryParams({ page, pageSize: newPageSize });
					},
					disabled: !dataSource,
					position: ['bottomCenter'],
					pageSizeOptions,
				}}
				scroll={{ x: 800 }}
				bordered
			/>

			{selectedDeliveryInvoice && (
				<ViewDeliveryInvoiceModal
					deliveryInvoice={selectedDeliveryInvoice}
					serviceOptions={{ baseURL: getLocalApiUrl() }}
					siteSettings={siteSettings}
					onClose={() => setSelectedDeliveryInvoice(null)}
				/>
			)}
		</>
	);
};

interface FilterProps {
	isLoading: boolean;
}

const Filter = ({ isLoading }: FilterProps) => {
	const { params, setQueryParams } = useQueryParams();

	return (
		<Row className="mb-4" gutter={[16, 16]}>
			<Col lg={12} span={24}>
				<Label label="Date" spacing />
				<DatePicker
					allowClear={false}
					disabled={isLoading}
					format="MM/DD/YY"
					value={
						_.toString(params.timeRange).split(',')?.length === 2
							? moment(_.toString(params.timeRange).split(',')[0])
							: moment()
					}
					onChange={(_date, dateString) => {
						setQueryParams(
							{ timeRange: [dateString, dateString].join(',') },
							{ shouldResetPage: true },
						);
					}}
				/>
			</Col>
		</Row>
	);
};
