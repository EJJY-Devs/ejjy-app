import { EditOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Button, Col, message, Row, Select, Table, Tooltip } from 'antd';
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
import {
	useBranches,
	useCashDisbursementDetailUpsert,
	useCashDisbursements,
	useQueryParams,
} from 'hooks';
import React, { useMemo, useState } from 'react';
import { formatDateTime, formatInPeso } from 'utils';
import { EditCashDisbursementDetailModal } from '../../modals/EditCashDisbursementDetailModal';

export interface CashDisbursementEntry {
	sourceType: 'expense' | 'purchase';
	sourceId: number;
	date: string;
	payee?: string | null;
	tin?: string | null;
	invoiceNumber?: string | null;
	debitAccount?: string | null;
	creditAccount?: string | null;
	amount: number;
	vatInput: number;
	expensePurchaseVatExclusive: number;
	ewtPercentage: number;
	ewt: number;
	otherDeductions: number;
	otherDeductionsRemarks?: string | null;
	totalDisbursement: number;
}

interface Props {
	isHeadOffice: boolean;
	localBranchId: number;
}

export const CashDisbursementsTab = ({
	isHeadOffice,
	localBranchId,
}: Props) => {
	const { params, setQueryParams } = useQueryParams();
	const [editEntry, setEditEntry] = useState<CashDisbursementEntry | null>(
		null,
	);

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
		data: { cashDisbursements, total },
		isFetching,
	} = useCashDisbursements({
		params: {
			page: params.page,
			pageSize: params.pageSize,
			timeRange: params.cashDisbursementsTimeRange,
			...(selectedBranchId && { branchId: selectedBranchId }),
		},
	});

	const {
		mutateAsync: upsertDetail,
		isLoading: isUpdatingDetail,
	} = useCashDisbursementDetailUpsert();

	const entries: CashDisbursementEntry[] = (cashDisbursements || []).map(
		(entry: any) => ({
			sourceType: entry.source_type,
			sourceId: entry.source_id,
			date: formatDateTime(entry.date, true),
			payee: entry.payee,
			tin: entry.tin,
			invoiceNumber: entry.invoice_number,
			debitAccount: entry.debit_account,
			creditAccount: entry.credit_account,
			amount: entry.amount,
			vatInput: entry.vat_input,
			expensePurchaseVatExclusive: entry.expense_purchase_vat_exclusive,
			ewtPercentage: entry.ewt_percentage,
			ewt: entry.ewt,
			otherDeductions: entry.other_deductions,
			otherDeductionsRemarks: entry.other_deductions_remarks,
			totalDisbursement: entry.total_disbursement,
		}),
	);

	const handleUpdateDetail = async (values: {
		ewtPercentage: number;
		otherDeductionsAmount: number;
		otherDeductionsRemarks: string;
	}) => {
		if (!editEntry) return;

		try {
			await upsertDetail({
				sourceType: editEntry.sourceType,
				sourceId: editEntry.sourceId,
				...values,
			});
			message.success('Cash disbursement details updated successfully');
			setEditEntry(null);
		} catch (error) {
			message.error('Failed to update cash disbursement details');
		}
	};

	const columns: ColumnsType<CashDisbursementEntry> = [
		{
			title: 'Date',
			dataIndex: 'date',
			key: 'date',
			align: 'left',
		},
		{
			title: 'Payee',
			dataIndex: 'payee',
			key: 'payee',
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
			title: 'Debit Account',
			dataIndex: 'debitAccount',
			key: 'debitAccount',
			align: 'left',
			render: (value: string | null) => value || EMPTY_CELL,
		},
		{
			title: 'Credit Account',
			dataIndex: 'creditAccount',
			key: 'creditAccount',
			align: 'left',
			render: (value: string | null) => value || EMPTY_CELL,
		},
		{
			title: 'Amount',
			dataIndex: 'amount',
			key: 'amount',
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
			title: 'Expense / Purchase - VAT Exclusive',
			dataIndex: 'expensePurchaseVatExclusive',
			key: 'expensePurchaseVatExclusive',
			align: 'left',
			render: (value: number) => formatInPeso(value, '₱ '),
		},
		{
			title: (
				<>
					EWT{' '}
					<Tooltip title="Manual % input, entered via the Edit action. Computed on the VAT-exclusive amount.">
						<QuestionCircleOutlined />
					</Tooltip>
				</>
			),
			dataIndex: 'ewt',
			key: 'ewt',
			align: 'left',
			render: (value: number, record: CashDisbursementEntry) => (
				<>
					{formatInPeso(value, '₱ ')}
					{record.ewtPercentage > 0 && ` (${record.ewtPercentage}%)`}
				</>
			),
		},
		{
			title: (
				<>
					Other Deductions{' '}
					<Tooltip title="Manual entry — definition still being confirmed on the BIR Compliance card.">
						<QuestionCircleOutlined />
					</Tooltip>
				</>
			),
			dataIndex: 'otherDeductions',
			key: 'otherDeductions',
			align: 'left',
			render: (value: number, record: CashDisbursementEntry) => (
				<>
					{formatInPeso(value, '₱ ')}
					{record.otherDeductionsRemarks &&
						` - ${record.otherDeductionsRemarks}`}
				</>
			),
		},
		{
			title: 'Total Disbursement',
			dataIndex: 'totalDisbursement',
			key: 'totalDisbursement',
			align: 'left',
			render: (value: number) => formatInPeso(value, '₱ '),
		},
		{
			title: '',
			key: 'action',
			align: 'center',
			fixed: 'right',
			width: 60,
			render: (_value, record: CashDisbursementEntry) => (
				<Button
					icon={<EditOutlined />}
					size="small"
					title="Edit EWT / Other Deductions"
					onClick={() => setEditEntry(record)}
				/>
			),
		},
	];

	return (
		<>
			<div className="BooksOfAccounts_header">
				<Row className="BooksOfAccounts_filters" gutter={[16, 16]}>
					<Col className="BooksOfAccounts_timeRangeFilter">
						<TimeRangeFilter
							dateRangeLabel="Select Date"
							queryName="cashDisbursementsTimeRange"
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
				scroll={{ x: 1700 }}
				bordered
			/>
			<EditCashDisbursementDetailModal
				entry={editEntry}
				isSubmitting={isUpdatingDetail}
				open={!!editEntry}
				onClose={() => setEditEntry(null)}
				onUpdate={handleUpdateDetail}
			/>
		</>
	);
};
