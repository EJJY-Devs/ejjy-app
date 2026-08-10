import { ArrowLeftOutlined, EyeFilled } from '@ant-design/icons';
import { Button, Col, Row, Statistic, Table, Tooltip } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { RequestErrors, TableHeader, TimeRangeFilter } from 'components';
import {
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	EMPTY_CELL,
	pageSizeOptions,
	timeRangeTypes,
} from 'global';
import {
	useAccountRetrieve,
	useDisbursementVouchers,
	useQueryParams,
} from 'hooks';
import React, { useMemo, useState } from 'react';
import { getSupplierLabel } from 'screens/Shared/Accounts/components/TabSupplierPurchases/components/SupplierTotalBalance';
import { convertIntoArray, formatDateTime, formatInPeso } from 'utils';
import {
	DisbursementVoucher,
	ViewDisbursementVoucherModal,
} from '../TabSupplierPurchases/modals/ViewDisbursementVoucherModal';

const getPaymentMethodLabel = (value: string) => {
	if (value === 'check') return 'Check';
	if (value === 'e_payment') return 'E-Payment';
	return 'Cash';
};

const getColumns = (
	onView: (record: DisbursementVoucher) => void,
): ColumnsType<DisbursementVoucher> => [
	{
		title: 'Reference #',
		dataIndex: 'reference_number',
		render: (value: string | null, record: DisbursementVoucher) => (
			<Button className="pa-0" type="link" onClick={() => onView(record)}>
				{value || `DV-${record.id}`}
			</Button>
		),
	},
	{
		title: 'Date & Time',
		dataIndex: 'datetime_created',
		render: (value: string) => formatDateTime(value),
	},
	{
		title: 'Payment Method',
		dataIndex: 'payment_method',
		render: (value: string) => getPaymentMethodLabel(value),
	},
	{
		title: 'Purchase Voucher',
		dataIndex: 'purchase_reference_number',
		render: (value: string | null) => value || EMPTY_CELL,
	},
	{
		title: 'Amount',
		dataIndex: 'amount',
		align: 'right',
		render: (value: string) => formatInPeso(value),
	},
	{
		title: 'Actions',
		key: 'actions',
		width: 90,
		align: 'center',
		render: (_value, record: DisbursementVoucher) => (
			<Tooltip title="View">
				<Button
					icon={<EyeFilled />}
					size="small"
					type="primary"
					ghost
					onClick={() => onView(record)}
				/>
			</Tooltip>
		),
	},
];

type Props = {
	supplierAccountId: number;
	onBack: () => void;
};

export const TabSupplierDisbursementVouchers = ({
	supplierAccountId,
	onBack,
}: Props) => {
	// STATES
	const [
		selectedDisbursementVoucher,
		setSelectedDisbursementVoucher,
	] = useState<DisbursementVoucher | null>(null);
	const columns = useMemo(
		() => getColumns((record) => setSelectedDisbursementVoucher(record)),
		[],
	);

	// CUSTOM HOOKS
	const { params, setQueryParams } = useQueryParams();
	const { data: supplierAccount } = useAccountRetrieve({
		id: supplierAccountId,
		options: { enabled: !!supplierAccountId },
	});
	const { data, isFetching, error } = useDisbursementVouchers({
		params: {
			supplierAccountId,
			timeRange: params?.timeRange || timeRangeTypes.DAILY,
			page: Number(params.page) || DEFAULT_PAGE,
			pageSize: Number(params.pageSize) || DEFAULT_PAGE_SIZE,
		},
		options: { enabled: !!supplierAccountId },
	});
	const disbursementVouchers = data?.disbursementVouchers || [];

	return (
		<div>
			<Button
				className="pa-0 mb-2"
				icon={<ArrowLeftOutlined />}
				style={{ display: 'inline-flex', alignItems: 'center' }}
				type="link"
				onClick={onBack}
			>
				Back to Supplier Accounts
			</Button>

			<TableHeader title="Disbursement Vouchers" wrapperClassName="pt-2 px-0" />

			{supplierAccount && (
				<Row className="mb-4" gutter={[16, 16]}>
					<Col md={12}>
						<Statistic
							title="Supplier"
							value={getSupplierLabel(supplierAccount)}
						/>
					</Col>
				</Row>
			)}

			<RequestErrors errors={convertIntoArray(error)} withSpaceBottom />

			<Row className="mb-4" gutter={[16, 16]}>
				<Col span={24}>
					<TimeRangeFilter disabled={isFetching} />
				</Col>
			</Row>

			<Table
				columns={columns}
				dataSource={disbursementVouchers}
				loading={isFetching}
				pagination={{
					current: Number(params.page) || DEFAULT_PAGE,
					total: data?.total || 0,
					pageSize: Number(params.pageSize) || DEFAULT_PAGE_SIZE,
					onChange: (page, newPageSize) => {
						setQueryParams({ page, pageSize: newPageSize });
					},
					disabled: !disbursementVouchers.length,
					position: ['bottomCenter'],
					pageSizeOptions,
				}}
				rowKey="id"
				scroll={{ x: 1000 }}
				bordered
			/>

			<ViewDisbursementVoucherModal
				disbursementVoucher={selectedDisbursementVoucher}
				open={!!selectedDisbursementVoucher}
				onClose={() => setSelectedDisbursementVoucher(null)}
			/>
		</div>
	);
};
