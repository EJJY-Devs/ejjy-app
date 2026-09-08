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
	account: string;
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
			align: 'center',
		},
		{
			title: 'Payee',
			dataIndex: 'payee',
			key: 'payee',
			align: 'center',
		},
		{
			title: 'TIN',
			dataIndex: 'tin',
			key: 'tin',
			align: 'center',
			render: (value: string | null) => value || EMPTY_CELL,
		},
		{
			title: 'Invoice #',
			dataIndex: 'invoiceNumber',
			key: 'invoiceNumber',
			align: 'center',
		},
		{
			title: 'Account',
			dataIndex: 'account',
			key: 'account',
			align: 'center',
		},
		{
			title: 'Amount',
			dataIndex: 'amount',
			key: 'amount',
			align: 'center',
			render: (value: number) => formatInPeso(value, '₱ '),
		},
		{
			title: 'VAT Input',
			dataIndex: 'vatInput',
			key: 'vatInput',
			align: 'center',
			render: (value: number) => formatInPeso(value, '₱ '),
		},
		{
			title: 'Expense / Purchase - VAT Exclusive',
			dataIndex: 'expensePurchaseVatExclusive',
			key: 'expensePurchaseVatExclusive',
			align: 'center',
			render: (value: number) => formatInPeso(value, '₱ '),
		},
		{
			title: 'EWT',
			dataIndex: 'ewt',
			key: 'ewt',
			align: 'center',
			render: (value: number) => formatInPeso(value, '₱ '),
		},
		{
			title: 'Other Deductions',
			dataIndex: 'otherDeductions',
			key: 'otherDeductions',
			align: 'center',
			render: (value: number) => formatInPeso(value, '₱ '),
		},
		{
			title: 'Total Disbursement',
			dataIndex: 'totalDisbursement',
			key: 'totalDisbursement',
			align: 'center',
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
				scroll={{ x: 1200 }}
				bordered
			/>
		</>
	);
};
