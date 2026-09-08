import { Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { TimeRangeFilter } from 'components';
import { EMPTY_CELL } from 'global';
import React from 'react';
import { formatInPeso } from 'utils';

export interface SubsidiaryPurchaseEntry {
	id: number;
	date: string;
	supplier: string;
	tin?: string | null;
	invoiceNumber: string;
	description: string;
	purchasesExpenseVatExclusive: number;
	vatInput: number;
	totalPurchases: number;
	paymentReference: string;
	ewt: number;
	remarks: string;
}

export const SubsidiaryPurchasesTab = () => {
	// NOTE: Frontend scaffold only — this tab is not yet wired to an API.
	// Replace this static, empty dataset with a real hook once the
	// subsidiary purchases backend endpoint is available.
	const entries: SubsidiaryPurchaseEntry[] = [];
	const isFetching = false;

	const columns: ColumnsType<SubsidiaryPurchaseEntry> = [
		{
			title: 'Date',
			dataIndex: 'date',
			key: 'date',
			align: 'center',
		},
		{
			title: 'Supplier',
			dataIndex: 'supplier',
			key: 'supplier',
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
			title: 'Description',
			dataIndex: 'description',
			key: 'description',
			align: 'center',
		},
		{
			title: 'Purchases / Expense - VAT Exclusive',
			dataIndex: 'purchasesExpenseVatExclusive',
			key: 'purchasesExpenseVatExclusive',
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
			title: 'Total Purchases',
			dataIndex: 'totalPurchases',
			key: 'totalPurchases',
			align: 'center',
			render: (value: number) => formatInPeso(value, '₱ '),
		},
		{
			title: 'Payment Reference',
			dataIndex: 'paymentReference',
			key: 'paymentReference',
			align: 'center',
		},
		{
			title: 'EWT',
			dataIndex: 'ewt',
			key: 'ewt',
			align: 'center',
			render: (value: number) => formatInPeso(value, '₱ '),
		},
		{
			title: 'Remarks',
			dataIndex: 'remarks',
			key: 'remarks',
			align: 'center',
			render: (value: string) => value || EMPTY_CELL,
		},
	];

	return (
		<>
			<div className="BooksOfAccounts_header">
				<div className="BooksOfAccounts_filters">
					<div className="BooksOfAccounts_timeRangeFilter">
						<TimeRangeFilter
							dateRangeLabel="Select Date"
							queryName="subsidiaryPurchasesTimeRange"
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
