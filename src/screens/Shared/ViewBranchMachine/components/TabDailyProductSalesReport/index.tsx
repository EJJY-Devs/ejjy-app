import { Button, Col, Radio, Row, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import {
	ModeOfPayment,
	RequestErrors,
	TableHeader,
	TimeRangeFilter,
	TransactionStatus,
} from 'components';
import { Label } from 'components/elements';
import {
	NaacFields,
	PWDFields,
	SpecialDiscountCode,
	ViewTransactionModal,
	getDiscountFields,
	getProductCode,
} from 'ejjy-global';
import {
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	EMPTY_CELL,
	pageSizeOptions,
	refetchOptions,
	timeRangeTypes,
	transactionStatuses,
} from 'global';
import {
	useQueryParams,
	useSiteSettingsNew,
	useTransactionProducts,
} from 'hooks';
import React, { ReactNode, useEffect, useState } from 'react';
import {
	convertIntoArray,
	formatDateTime,
	formatInPeso,
	formatQuantity,
} from 'utils';

const columns: ColumnsType = [
	{ title: 'Date & Time', dataIndex: 'dateTime', width: 125 },
	{ title: 'Client Name', dataIndex: 'clientName' },
	{ title: 'ID Number', dataIndex: 'idNumber' },
	{ title: 'Invoice Number', dataIndex: 'invoiceNumber', width: 150 },
	{ title: 'Invoice Type', dataIndex: 'invoiceType', width: 150 },
	{ title: 'Quantity', dataIndex: 'quantity' },
	{ title: 'Textcode / Code', dataIndex: 'code', width: 150 },
	{ title: 'Item Name / Description', dataIndex: 'name', width: 300 },
	{ title: 'Sale Price', dataIndex: 'sellingPrice', width: 150 },
	{ title: 'V/VE', dataIndex: 'vatable' },
	{ title: 'Total Amount', dataIndex: 'totalAmount', width: 150 },
	{ title: 'Remarks', dataIndex: 'remarks' },
];

const ALL_STATUS = [
	transactionStatuses.VOID_CANCELLED,
	transactionStatuses.FULLY_PAID,
].join(',');

type Props = {
	branchMachineId: number;
};

export const TabDailyProductSalesReport = ({ branchMachineId }: Props) => {
	// STATES
	const [dataSource, setDataSource] = useState([]);
	const [selectedTransaction, setSelectedTransaction] = useState(null);

	// CUSTOM HOOKS
	const { params, setQueryParams } = useQueryParams();
	const { data: siteSettings } = useSiteSettingsNew();
	const {
		data: { transactionProducts, total },
		isFetching: isFetchingTransactionProducts,
		isFetchedAfterMount: isTransactionProductsFetchedAfterMount,
		error: transactionProductsError,
	} = useTransactionProducts({
		params: {
			...params,
			branchMachineId,
			timeRange: params?.timeRange || timeRangeTypes.DAILY,
			isVatExempted: params.isVatExempted
				? params.isVatExempted === 'true'
				: undefined,
			statuses: params.statuses || undefined,
		},
		options: refetchOptions,
	});

	// METHODS
	useEffect(() => {
		const data = transactionProducts.map((transactionProduct) => {
			const {
				id,
				datetime_created,
				transaction,
				quantity,
				branch_product,
				price_per_piece,
				amount,
			} = transactionProduct;
			const product = branch_product?.product || {};

			const remarks = [
				transactionStatuses.VOID_CANCELLED,
				transactionStatuses.VOID_EDITED,
			].includes(transaction.status) && (
				<TransactionStatus transaction={transaction} />
			);

			const discountOption = transaction.discount_option;
			let cliendId = transaction.client?.id?.toString();
			let clientName: string | ReactNode[] = transaction.client?.name;

			if (discountOption?.is_special_discount) {
				const fields = getDiscountFields(
					discountOption.code as SpecialDiscountCode,
					transaction.discount_option_additional_fields_values || '',
				);

				cliendId = fields?.id;
				clientName =
					(fields as NaacFields)?.coach || (fields as PWDFields)?.name;
			} else if (transaction.discount_option_additional_fields_values?.length) {
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
				key: id,
				dateTime: formatDateTime(datetime_created),
				clientName: clientName || EMPTY_CELL,
				idNumber: cliendId || EMPTY_CELL,
				invoiceNumber: transaction.invoice ? (
					<Button
						type="link"
						onClick={() => setSelectedTransaction(transaction)}
					>
						{transaction.invoice.or_number}
					</Button>
				) : (
					EMPTY_CELL
				),
				invoiceType: <ModeOfPayment modeOfPayment={transaction.payment.mode} />,
				quantity: formatQuantity({
					unitOfMeasurement: product?.unit_of_measurement,
					quantity,
				}),
				code: `${product?.textcode || ''} / ${getProductCode(product)}`,
				name: `${product?.name} / ${product?.description}`,
				sellingPrice: formatInPeso(price_per_piece),
				vatable: product?.is_vat_exempted ? 'VAT Exempt' : 'Vatable',
				totalAmount: formatInPeso(amount),
				remarks,
			};
		});

		setDataSource(data);
	}, [transactionProducts]);

	return (
		<>
			<TableHeader title="Daily Product Sales" wrapperClassName="pt-2 px-0" />

			<Filter
				isLoading={
					isFetchingTransactionProducts &&
					!isTransactionProductsFetchedAfterMount
				}
			/>

			<RequestErrors errors={convertIntoArray(transactionProductsError)} />

			<Table
				columns={columns}
				dataSource={dataSource}
				loading={
					isFetchingTransactionProducts &&
					!isTransactionProductsFetchedAfterMount
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
				scroll={{ x: 1400 }}
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

type FilterProps = {
	isLoading: boolean;
};

const Filter = ({ isLoading }: FilterProps) => {
	const { params, setQueryParams } = useQueryParams();

	return (
		<Row className="mb-4" gutter={[16, 16]}>
			<Col lg={12} span={24}>
				<TimeRangeFilter disabled={isLoading} />
			</Col>

			<Col lg={12} span={24}>
				<Label label="V/VE" spacing />
				<Radio.Group
					defaultValue=""
					options={[
						{
							label: 'All',
							value: '',
						},
						{
							label: 'VAT',
							value: 'false',
						},
						{
							label: 'VAT-Exempt',
							value: 'true',
						},
					]}
					optionType="button"
					value={params.isVatExempted}
					onChange={(e) => {
						setQueryParams(
							{ isVatExempted: e.target.value },
							{ shouldResetPage: true },
						);
					}}
				/>
			</Col>
			<Col lg={12} span={24}>
				<Label label="Status" spacing />
				<Radio.Group
					defaultValue={ALL_STATUS}
					options={[
						{
							label: 'All',
							value: ALL_STATUS,
						},
						{
							label: 'Success',
							value: transactionStatuses.FULLY_PAID,
						},
						{
							label: 'Voided',
							value: [
								transactionStatuses.VOID_CANCELLED,
								transactionStatuses.VOID_EDITED,
							].join(','),
						},
					]}
					optionType="button"
					value={params.statuses}
					onChange={(e) => {
						setQueryParams(
							{ statuses: e.target.value },
							{ shouldResetPage: true },
						);
					}}
				/>
			</Col>
		</Row>
	);
};
