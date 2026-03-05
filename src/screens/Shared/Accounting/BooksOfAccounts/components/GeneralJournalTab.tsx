import { PlusOutlined } from '@ant-design/icons';
import { Button, Col, Row, Select, Table } from 'antd';
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
import { useBranches, useJournalEntries, useQueryParams } from 'hooks';
import React, { useEffect, useMemo } from 'react';
import { formatDateTime } from 'utils';

export interface GeneralJournalEntry {
	id: number;
	datetime: string;
	branch?: string;
	referenceNumber: string;
	debitAccount: string;
	creditAccount: string;
	amount: string;
	remarks: string;
}

interface Props {
	isHeadOffice: boolean;
	localBranchId: number;
	onCreateJournalEntry: () => void;
	onOpenJournalEntry: (entry: GeneralJournalEntry) => void;
}

export const GeneralJournalTab = ({
	isHeadOffice,
	localBranchId,
	onCreateJournalEntry,
	onOpenJournalEntry,
}: Props) => {
	const { params, setQueryParams } = useQueryParams();
	const { data: { branches } = { branches: [] } } = useBranches({
		params: {
			pageSize: MAX_PAGE_SIZE,
		},
	});

	useEffect(() => {
		if (isHeadOffice && !params.branchId) {
			setQueryParams({ branchId: 'all' }, { shouldResetPage: false });
		}
	}, [isHeadOffice, params.branchId, setQueryParams]);

	const selectedBranchId = useMemo(() => {
		if (!isHeadOffice) return localBranchId || undefined;
		if (params.branchId === 'all') return undefined;
		if (params.branchId) return Number(params.branchId);
		return undefined;
	}, [isHeadOffice, localBranchId, params.branchId]);

	const {
		data: { journalEntries, total },
		isFetching,
	} = useJournalEntries({
		params: {
			page: params.page,
			pageSize: params.pageSize,
			timeRange: params.timeRange,
			...(selectedBranchId && { branchId: selectedBranchId }),
		},
	});

	const entries: GeneralJournalEntry[] = (journalEntries || []).map(
		(entry: any) => ({
			id: entry.id,
			datetime: formatDateTime(entry.datetime_created, true),
			branch: entry.branch_name,
			referenceNumber: entry.reference_number,
			debitAccount: entry.debit_account,
			creditAccount: entry.credit_account,
			amount: `₱ ${Number(entry.amount || 0).toFixed(2)}`,
			remarks: entry.remarks || EMPTY_CELL,
		}),
	);

	const columns = useMemo(() => {
		const baseColumns: ColumnsType<GeneralJournalEntry> = [
			{
				title: 'Datetime',
				dataIndex: 'datetime',
				key: 'datetime',
			},
			{
				title: 'Reference Number',
				dataIndex: 'referenceNumber',
				key: 'referenceNumber',
				render: (value: string, record: GeneralJournalEntry) => (
					<Button type="link" onClick={() => onOpenJournalEntry(record)}>
						{value}
					</Button>
				),
			},
			{
				title: 'Debit Account',
				dataIndex: 'debitAccount',
				key: 'debitAccount',
			},
			{
				title: 'Credit Account',
				dataIndex: 'creditAccount',
				key: 'creditAccount',
			},
			{
				title: 'Amount',
				dataIndex: 'amount',
				key: 'amount',
			},
			{
				title: 'Remarks',
				dataIndex: 'remarks',
				key: 'remarks',
			},
		];

		if (isHeadOffice) {
			baseColumns.splice(2, 0, {
				title: 'Branch',
				dataIndex: 'branch',
				key: 'branch',
			});
		}

		return baseColumns;
	}, [isHeadOffice, onOpenJournalEntry]);

	return (
		<>
			<div className="BooksOfAccounts_header">
				<Row className="BooksOfAccounts_filters" gutter={[16, 16]}>
					<Col className="BooksOfAccounts_timeRangeFilter">
						<TimeRangeFilter
							dateRangeLabel="Select Date"
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
				{!isHeadOffice && (
					<Button
						icon={<PlusOutlined />}
						type="primary"
						onClick={onCreateJournalEntry}
					>
						Create Journal Entry
					</Button>
				)}
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
				scroll={{ x: 900 }}
				bordered
			/>
		</>
	);
};
