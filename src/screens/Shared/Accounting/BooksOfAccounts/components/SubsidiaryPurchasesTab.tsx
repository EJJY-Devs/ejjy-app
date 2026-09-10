import { QuestionCircleOutlined } from '@ant-design/icons';
import { Col, Row, Select, Table, Tooltip } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { TimeRangeFilter } from 'components';
import { Label } from 'components/elements';
import {
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	EMPTY_CELL,
	MAX_PAGE_SIZE,
	pageSizeOptions,
} from 'global';
import { useBranches, useQueryParams, useSubsidiaryPurchases } from 'hooks';
import React, { useMemo } from 'react';
import { formatDateTime, formatInPeso } from 'utils';

export interface SubsidiaryPurchaseEntry {
	sourceType: 'expense' | 'purchase';
	sourceId: number;
	date: string;
	supplier?: string | null;
	tin?: string | null;
	invoiceNumber?: string | null;
	description?: string | null;
	purchasesExpenseVatExclusive: number;
	vatInput: number;
	totalPurchases: number;
	paymentReference?: string | null;
	ewt: number;
	remarks?: string | null;
}

interface Props {
	isHeadOffice: boolean;
	localBranchId: number;
}

const notYetAvailableTooltip = (
	<Tooltip title="Not yet computed — what this column should hold is still being confirmed on the BIR Compliance card.">
		<QuestionCircleOutlined />
	</Tooltip>
);

export const SubsidiaryPurchasesTab = ({
	isHeadOffice,
	localBranchId,
}: Props) => {
	const { params, setQueryParams } = useQueryParams();
	const { data: { branches } = { branches: [] } } = useBranches({
		params: {
			pageSize: MAX_PAGE_SIZE,
		},
	});

	const selectedBranchId = useMemo(() => {
		if (!isHeadOffice) return localBranchId || undefined;
		if (params.branchId === 'all' || !params.branchId) return undefined;
		return Number(params.branchId);
	}, [isHeadOffice, localBranchId, params.branchId]);

	const {
		data: { subsidiaryPurchases, total },
		isFetching,
	} = useSubsidiaryPurchases({
		params: {
			page: params.page,
			pageSize: params.pageSize,
			timeRange: params.subsidiaryPurchasesTimeRange,
			...(selectedBranchId && { branchId: selectedBranchId }),
		},
	});

	const entries: SubsidiaryPurchaseEntry[] = (subsidiaryPurchases || []).map(
		(entry: any) => ({
			sourceType: entry.source_type,
			sourceId: entry.source_id,
			date: formatDateTime(entry.date, true),
			supplier: entry.supplier,
			tin: entry.tin,
			invoiceNumber: entry.invoice_number,
			description: entry.description,
			purchasesExpenseVatExclusive: entry.purchases_expense_vat_exclusive,
			vatInput: entry.vat_input,
			totalPurchases: entry.total_purchases,
			paymentReference: entry.payment_reference,
			ewt: entry.ewt,
			remarks: entry.remarks,
		}),
	);

	const columns: ColumnsType<SubsidiaryPurchaseEntry> = [
		{
			title: 'Date',
			dataIndex: 'date',
			key: 'date',
			align: 'left',
		},
		{
			title: 'Supplier',
			dataIndex: 'supplier',
			key: 'supplier',
			align: 'left',
			render: (value: string | null) => value || EMPTY_CELL,
		},
		{
			title: 'TIN',
			dataIndex: 'tin',
			key: 'tin',
			align: 'left',
			render: (value: string | null) => value || EMPTY_CELL,
		},
		{
			title: 'Invoice #',
			dataIndex: 'invoiceNumber',
			key: 'invoiceNumber',
			align: 'left',
			render: (value: string | null) => value || EMPTY_CELL,
		},
		{
			title: <>Description {notYetAvailableTooltip}</>,
			dataIndex: 'description',
			key: 'description',
			align: 'left',
			render: (value: string | null) => value || EMPTY_CELL,
		},
		{
			title: 'Purchases / Expense - VAT Exclusive',
			dataIndex: 'purchasesExpenseVatExclusive',
			key: 'purchasesExpenseVatExclusive',
			align: 'left',
			render: (value: number) => formatInPeso(value, '₱ '),
		},
		{
			title: 'VAT Input',
			dataIndex: 'vatInput',
			key: 'vatInput',
			align: 'left',
			render: (value: number) => formatInPeso(value, '₱ '),
		},
		{
			title: 'Total Purchases',
			dataIndex: 'totalPurchases',
			key: 'totalPurchases',
			align: 'left',
			render: (value: number) => formatInPeso(value, '₱ '),
		},
		{
			title: <>Payment Reference {notYetAvailableTooltip}</>,
			dataIndex: 'paymentReference',
			key: 'paymentReference',
			align: 'left',
			render: (value: string | null) => value || EMPTY_CELL,
		},
		{
			title: (
				<>
					EWT{' '}
					<Tooltip title="Same manual % entered for this voucher on the Cash Disbursements book — 0 until it's set there.">
						<QuestionCircleOutlined />
					</Tooltip>
				</>
			),
			dataIndex: 'ewt',
			key: 'ewt',
			align: 'left',
			render: (value: number) => formatInPeso(value, '₱ '),
		},
		{
			title: <>Remarks {notYetAvailableTooltip}</>,
			dataIndex: 'remarks',
			key: 'remarks',
			align: 'left',
			render: (value: string | null) => value || EMPTY_CELL,
		},
	];

	return (
		<>
			<div className="BooksOfAccounts_header">
				<Row className="BooksOfAccounts_filters" gutter={[16, 16]}>
					<Col className="BooksOfAccounts_timeRangeFilter">
						<TimeRangeFilter
							dateRangeLabel="Select Date"
							queryName="subsidiaryPurchasesTimeRange"
							useSingleDateForDateRange
						/>
					</Col>
					{isHeadOffice && (
						<Col className="BooksOfAccounts_timeRangeFilter" lg={4}>
							<Label label="Branch" spacing />
							<Select
								className="w-100"
								optionFilterProp="children"
								placeholder="Select Branch"
								value={(() => {
									if (params.branchId === 'all') return 'all';
									if (params.branchId) return Number(params.branchId);
									return undefined;
								})()}
								allowClear
								showSearch
								onChange={(value) => {
									setQueryParams(
										{ branchId: value },
										{ shouldResetPage: true },
									);
								}}
							>
								<Select.Option value="all">All</Select.Option>
								{branches.map(({ id, name }: any) => (
									<Select.Option key={id} value={id}>
										{name}
									</Select.Option>
								))}
							</Select>
						</Col>
					)}
				</Row>
			</div>
			<Table
				className="BooksOfAccounts_table"
				columns={columns}
				dataSource={entries}
				loading={isFetching}
				pagination={{
					current: Number(params.page) || DEFAULT_PAGE,
					total,
					pageSize: Number(params.pageSize) || DEFAULT_PAGE_SIZE,
					onChange: (page, pageSize) => {
						setQueryParams({
							page,
							pageSize,
						});
					},
					disabled: !entries?.length,
					position: ['bottomCenter'],
					pageSizeOptions,
				}}
				rowKey={(record) => `${record.sourceType}-${record.sourceId}`}
				scroll={{ x: 1500 }}
				bordered
			/>
		</>
	);
};
