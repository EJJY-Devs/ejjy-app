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
import {
	useBranches,
	useBranchMachines,
	useJournalEntries,
	useQueryParams,
} from 'hooks';
import React, { useEffect, useMemo } from 'react';
import { formatDateTime, formatInPeso } from 'utils';

export interface GeneralJournalEntry {
	id: number;
	entryType: string;
	datetime: string;
	branch?: string;
	branchMachine?: string;
	referenceNumber: string;
	debitAccount: string;
	creditAccount: string;
	amount: string;
	remarks: string;
	description: string;
	expenseId?: number | null;
	expenseReferenceNumber?: string | null;
	purchaseId?: number | null;
	purchaseReferenceNumber?: string | null;
	branchMachineId?: number | null;
}

interface Props {
	isHeadOffice: boolean;
	localBranchId: number;
	onAddTransactionEntry: () => void;
	onCreateJournalEntry: () => void;
	onOpenJournalEntry: (entry: GeneralJournalEntry) => void;
	onViewExpense?: (expenseId: number) => void;
	onViewInvoice?: (entry: GeneralJournalEntry) => void;
	onViewPurchase?: (purchaseId: number) => void;
	onViewTransaction?: (transactionId: number, description: string) => void;
}

export const GeneralJournalTab = ({
	isHeadOffice,
	localBranchId,
	onAddTransactionEntry,
	onCreateJournalEntry,
	onOpenJournalEntry,
	onViewExpense,
	onViewInvoice,
	onViewPurchase,
	onViewTransaction,
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

	const selectedBranchMachineId = useMemo(() => {
		if (params.branchMachineId === 'all') return undefined;
		if (params.branchMachineId) return Number(params.branchMachineId);
		return undefined;
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
		data: { journalEntries, total },
		isFetching,
	} = useJournalEntries({
		params: {
			page: params.page,
			pageSize: params.pageSize,
			timeRange: params.timeRange,
			...(selectedBranchId && { branchId: selectedBranchId }),
			...(selectedBranchMachineId && {
				branchMachineId: selectedBranchMachineId,
			}),
			...(params.entryType && { entryType: params.entryType }),
		},
	});

	const entries: GeneralJournalEntry[] = (journalEntries || []).map(
		(entry: any) => ({
			id: entry.id,
			entryType: entry.entry_type || '',
			datetime: formatDateTime(entry.datetime_created, true),
			branch: entry.branch_name,
			branchMachine: entry.branch_machine_name,
			referenceNumber: entry.reference_number,
			debitAccount: entry.debit_account,
			creditAccount: entry.credit_account,
			amount: formatInPeso(entry.amount, '₱ '),
			remarks: entry.remarks || EMPTY_CELL,
			description: entry.description || '',
			expenseId: entry.expense ?? null,
			expenseReferenceNumber: entry.expense_reference_number ?? null,
			purchaseId: entry.purchase ?? null,
			purchaseReferenceNumber: entry.purchase_reference_number ?? null,
			branchMachineId: entry.branch_machine ?? null,
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
				render: (_: string, record: GeneralJournalEntry) => {
					if (record.entryType === 'transaction') {
						const match = record.remarks.match(/^(.+)\s*\(TXN-(\d+)\)$/);
						if (match) {
							const txnName = match[1].trim();
							const txnId = Number(match[2]);
							return (
								<>
									<div>Transaction Name: {txnName}</div>
									<div>
										Transaction Id:{' '}
										<Button
											style={{ padding: 0, height: 'auto' }}
											type="link"
											onClick={() =>
												onViewTransaction?.(txnId, record.description)
											}
										>
											{txnId}
										</Button>
									</div>
									{record.description && (
										<div>Remarks: {record.description}</div>
									)}
								</>
							);
						}
					}
					if (record.expenseId) {
						const ref = record.expenseReferenceNumber;
						const hasRemarks = record.remarks && record.remarks !== EMPTY_CELL;
						return (
							<span>
								<Button
									style={{ padding: 0, height: 'auto' }}
									type="link"
									onClick={() => onViewExpense?.(record.expenseId as number)}
								>
									{ref || 'View'}
								</Button>
								{ref && hasRemarks && ` - ${record.remarks}`}
							</span>
						);
					}
					if (record.purchaseId) {
						const ref = record.purchaseReferenceNumber;
						const hasRemarks = record.remarks && record.remarks !== EMPTY_CELL;
						return (
							<span>
								<Button
									style={{ padding: 0, height: 'auto' }}
									type="link"
									onClick={() => onViewPurchase?.(record.purchaseId as number)}
								>
									{ref || 'View'}
								</Button>
								{ref && hasRemarks && ` - ${record.remarks}`}
							</span>
						);
					}
					if (
						record.entryType === 'automated' &&
						record.remarks &&
						record.remarks !== EMPTY_CELL
					) {
						return (
							<Button
								style={{ padding: 0, height: 'auto' }}
								type="link"
								onClick={() => onViewInvoice?.(record)}
							>
								{record.remarks}
							</Button>
						);
					}
					return record.remarks;
				},
			},
		];

		baseColumns.splice(2, 0, {
			title: 'Branch Machine',
			dataIndex: 'branchMachine',
			key: 'branchMachine',
			render: (value: string) => value || EMPTY_CELL,
		});

		if (isHeadOffice) {
			baseColumns.splice(2, 0, {
				title: 'Branch',
				dataIndex: 'branch',
				key: 'branch',
			});
		}

		return baseColumns;
	}, [
		isHeadOffice,
		onOpenJournalEntry,
		onViewExpense,
		onViewInvoice,
		onViewPurchase,
		onViewTransaction,
	]);

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
					<Col className="BooksOfAccounts_timeRangeFilter" lg={4}>
						<Label label="Entry Type" spacing />
						<Select
							className="w-100"
							placeholder="Select entry type"
							value={params.entryType || undefined}
							allowClear
							onChange={(value) => {
								setQueryParams({ entryType: value }, { shouldResetPage: true });
							}}
						>
							<Select.Option value="manual">Manual</Select.Option>
							<Select.Option value="transaction">Transaction</Select.Option>
							<Select.Option value="automated">Automated</Select.Option>
						</Select>
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
				{!isHeadOffice && (
					<>
						<Button
							icon={<PlusOutlined />}
							type="primary"
							onClick={onAddTransactionEntry}
						>
							Select Transaction
						</Button>
						<Button
							icon={<PlusOutlined />}
							type="primary"
							onClick={onCreateJournalEntry}
						>
							Create Journal Entry
						</Button>
					</>
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
