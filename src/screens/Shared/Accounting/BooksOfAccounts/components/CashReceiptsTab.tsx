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
import {
	useBranches,
	useBranchMachines,
	useCashReceipts,
	useQueryParams,
} from 'hooks';
import React, { useMemo } from 'react';
import { formatDateTime, formatInPeso } from 'utils';

export interface CashReceiptEntry {
	id: number;
	date: string;
	payor?: string | null;
	tin?: string | null;
	invoice: string;
	debitAccount?: string | null;
	creditAccount?: string | null;
	amount: number;
	vatOutput: number;
	salesIncomeVatExclusive: number;
	otherReceipts?: number | null;
	totalReceipts?: number | null;
}

interface Props {
	isHeadOffice: boolean;
	localBranchId: number;
}

export const CashReceiptsTab = ({ isHeadOffice, localBranchId }: Props) => {
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

	const selectedBranchMachineId = useMemo(() => {
		if (params.branchMachineId === 'all' || !params.branchMachineId) {
			return undefined;
		}
		return Number(params.branchMachineId);
	}, [params.branchMachineId]);

	const {
		data: { branchMachines } = { branchMachines: [] },
	} = useBranchMachines({
		params: {
			branchId: selectedBranchId,
			pageSize: MAX_PAGE_SIZE,
		},
	});

	const {
		data: { cashReceipts, total },
		isFetching,
	} = useCashReceipts({
		params: {
			page: params.page,
			pageSize: params.pageSize,
			timeRange: params.cashReceiptsTimeRange,
			...(selectedBranchId && { branchId: selectedBranchId }),
			...(selectedBranchMachineId && {
				branchMachineId: selectedBranchMachineId,
			}),
		},
	});

	const entries: CashReceiptEntry[] = (cashReceipts || []).map(
		(entry: any) => ({
			id: entry.id,
			date: formatDateTime(entry.date, true),
			payor: entry.payor,
			tin: entry.tin,
			invoice: entry.invoice,
			debitAccount: entry.debit_account,
			creditAccount: entry.credit_account,
			amount: entry.amount,
			vatOutput: entry.vat_output,
			salesIncomeVatExclusive: entry.sales_income_vat_exclusive,
			otherReceipts: entry.other_receipts,
			totalReceipts: entry.total_receipts,
		}),
	);

	const columns: ColumnsType<CashReceiptEntry> = [
		{
			title: 'Date',
			dataIndex: 'date',
			key: 'date',
			align: 'left',
		},
		{
			title: 'Payor',
			dataIndex: 'payor',
			key: 'payor',
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
			title: 'Invoice',
			dataIndex: 'invoice',
			key: 'invoice',
			align: 'left',
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
			title: 'VAT Output',
			dataIndex: 'vatOutput',
			key: 'vatOutput',
			align: 'left',
			render: (value: number) => formatInPeso(value, '₱ '),
		},
		{
			title: 'Sales / Income - VAT Exclusive',
			dataIndex: 'salesIncomeVatExclusive',
			key: 'salesIncomeVatExclusive',
			align: 'left',
			render: (value: number) => formatInPeso(value, '₱ '),
		},
		{
			title: (
				<>
					Other Receipts{' '}
					<Tooltip title="Formula still being confirmed on the BIR Compliance card — not computed yet.">
						<QuestionCircleOutlined />
					</Tooltip>
				</>
			),
			dataIndex: 'otherReceipts',
			key: 'otherReceipts',
			align: 'left',
			render: (value: number | null) =>
				value === null || value === undefined
					? EMPTY_CELL
					: formatInPeso(value, '₱ '),
		},
		{
			title: (
				<>
					Total Receipts{' '}
					<Tooltip title="Formula still being confirmed on the BIR Compliance card — not computed yet.">
						<QuestionCircleOutlined />
					</Tooltip>
				</>
			),
			dataIndex: 'totalReceipts',
			key: 'totalReceipts',
			align: 'left',
			render: (value: number | null) =>
				value === null || value === undefined
					? EMPTY_CELL
					: formatInPeso(value, '₱ '),
		},
	];

	return (
		<>
			<div className="BooksOfAccounts_header">
				<Row className="BooksOfAccounts_filters" gutter={[16, 16]}>
					<Col className="BooksOfAccounts_timeRangeFilter">
						<TimeRangeFilter
							dateRangeLabel="Select Date"
							queryName="cashReceiptsTimeRange"
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
										{ branchId: value, branchMachineId: undefined },
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
					<Col className="BooksOfAccounts_timeRangeFilter" lg={4}>
						<Label label="Branch Machine" spacing />
						<Select
							className="w-100"
							optionFilterProp="children"
							placeholder="Select Branch Machine"
							value={(() => {
								if (params.branchMachineId === 'all') return 'all';
								if (params.branchMachineId)
									return Number(params.branchMachineId);
								return undefined;
							})()}
							allowClear
							showSearch
							onChange={(value) => {
								setQueryParams(
									{ branchMachineId: value },
									{ shouldResetPage: true },
								);
							}}
						>
							<Select.Option value="all">All</Select.Option>
							{branchMachines.map(({ id, name }: any) => (
								<Select.Option key={id} value={id}>
									{name}
								</Select.Option>
							))}
						</Select>
					</Col>
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
				rowKey="id"
				scroll={{ x: 1500 }}
				bordered
			/>
		</>
	);
};
