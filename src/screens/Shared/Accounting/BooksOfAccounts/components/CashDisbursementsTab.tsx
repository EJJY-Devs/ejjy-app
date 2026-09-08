import { Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { TimeRangeFilter } from 'components';
import { EMPTY_CELL } from 'global';
import React from 'react';
import { formatInPeso } from 'utils';

export interface CashDisbursementEntry {
	id: number;
	date: string;
	payee: string;
	tin?: string | null;
	invoiceNumber: string;
	debitAccount: string;
	creditAccount: string;
	amount: number;
	vatInput: number;
	expensePurchaseVatExclusive: number;
	ewt: number;
	otherDeductions: number;
	totalDisbursement: number;
}

export const CashDisbursementsTab = () => {
	// NOTE: Frontend scaffold only — this tab is not yet wired to an API.
	// Replace this static, empty dataset with a real hook once the
	// cash disbursements backend endpoint is available.
	const entries: CashDisbursementEntry[] = [];
	const isFetching = false;

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
		},
		{
			title: 'Debit Account',
			dataIndex: 'debitAccount',
			key: 'debitAccount',
			align: 'left',
		},
		{
			title: 'Credit Account',
			dataIndex: 'creditAccount',
			key: 'creditAccount',
			align: 'left',
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
			title: 'EWT',
			dataIndex: 'ewt',
			key: 'ewt',
			align: 'left',
			render: (value: number) => formatInPeso(value, '₱ '),
		},
		{
			title: 'Other Deductions',
			dataIndex: 'otherDeductions',
			key: 'otherDeductions',
			align: 'left',
			render: (value: number) => formatInPeso(value, '₱ '),
		},
		{
			title: 'Total Disbursement',
			dataIndex: 'totalDisbursement',
			key: 'totalDisbursement',
			align: 'left',
			render: (value: number) => formatInPeso(value, '₱ '),
		},
	];

	return (
		<>
			<div className="BooksOfAccounts_header">
				<div className="BooksOfAccounts_filters">
					<div className="BooksOfAccounts_timeRangeFilter">
						<TimeRangeFilter
							dateRangeLabel="Select Date"
							queryName="cashDisbursementsTimeRange"
							useSingleDateForDateRange
						/>
					</div>
				</div>
			</div>
			<Table
				className="BooksOfAccounts_table"
				columns={columns}
				dataSource={entries}
				loading={isFetching}
				pagination={{
					hideOnSinglePage: true,
					position: ['bottomCenter'],
				}}
				rowKey="id"
				scroll={{ x: 1300 }}
				bordered
			/>
		</>
	);
};
