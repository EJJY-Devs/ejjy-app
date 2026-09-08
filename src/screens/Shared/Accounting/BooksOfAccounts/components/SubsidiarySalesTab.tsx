import { Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { TimeRangeFilter } from 'components';
import { EMPTY_CELL } from 'global';
import React from 'react';
import { formatInPeso } from 'utils';

export interface SubsidiarySaleEntry {
	id: number;
	date: string;
	customerBuyer: string;
	tin?: string | null;
	invoiceNumber: string;
	description: string;
	salesVatExclusive: number;
	vatOutput: number;
	totalSales: number;
	collectionReference: string;
	remarks: string;
}

export const SubsidiarySalesTab = () => {
	// NOTE: Frontend scaffold only — this tab is not yet wired to an API.
	// Replace this static, empty dataset with a real hook once the
	// subsidiary sales backend endpoint is available.
	const entries: SubsidiarySaleEntry[] = [];
	const isFetching = false;

	const columns: ColumnsType<SubsidiarySaleEntry> = [
		{
			title: 'Date',
			dataIndex: 'date',
			key: 'date',
			align: 'center',
		},
		{
			title: 'Customer / Buyer',
			dataIndex: 'customerBuyer',
			key: 'customerBuyer',
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
			title: 'Sales - VAT Exclusive',
			dataIndex: 'salesVatExclusive',
			key: 'salesVatExclusive',
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
			title: 'Total Sales',
			dataIndex: 'totalSales',
			key: 'totalSales',
			align: 'center',
			render: (value: number) => formatInPeso(value, '₱ '),
		},
		{
			title: 'Collection Reference',
			dataIndex: 'collectionReference',
			key: 'collectionReference',
			align: 'center',
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
							queryName="subsidiarySalesTimeRange"
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
