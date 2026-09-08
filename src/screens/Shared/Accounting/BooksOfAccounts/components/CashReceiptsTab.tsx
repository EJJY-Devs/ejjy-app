import { Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { TimeRangeFilter } from 'components';
import { EMPTY_CELL } from 'global';
import React from 'react';
import { formatInPeso } from 'utils';

export interface CashReceiptEntry {
	id: number;
	date: string;
	payor: string;
	tin?: string | null;
	invoice: string;
	account: string;
	amount: number;
	vatOutput: number;
	salesIncomeVatExclusive: number;
	otherReceipts: number;
	totalReceipts: number;
}

export const CashReceiptsTab = () => {
	// NOTE: Frontend scaffold only — this tab is not yet wired to an API.
	// Replace this static, empty dataset with a real hook once the
	// cash receipts backend endpoint is available.
	const entries: CashReceiptEntry[] = [];
	const isFetching = false;

	const columns: ColumnsType<CashReceiptEntry> = [
		{
			title: 'Date',
			dataIndex: 'date',
			key: 'date',
			align: 'center',
		},
		{
			title: 'Payor',
			dataIndex: 'payor',
			key: 'payor',
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
			title: 'Invoice',
			dataIndex: 'invoice',
			key: 'invoice',
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
			title: 'VAT Output',
			dataIndex: 'vatOutput',
			key: 'vatOutput',
			align: 'center',
			render: (value: number) => formatInPeso(value, '₱ '),
		},
		{
			title: 'Sales / Income - VAT Exclusive',
			dataIndex: 'salesIncomeVatExclusive',
			key: 'salesIncomeVatExclusive',
			align: 'center',
			render: (value: number) => formatInPeso(value, '₱ '),
		},
		{
			title: 'Other Receipts',
			dataIndex: 'otherReceipts',
			key: 'otherReceipts',
			align: 'center',
			render: (value: number) => formatInPeso(value, '₱ '),
		},
		{
			title: 'Total Receipts',
			dataIndex: 'totalReceipts',
			key: 'totalReceipts',
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
							queryName="cashReceiptsTimeRange"
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
				scroll={{ x: 1100 }}
				bordered
			/>
		</>
	);
};
