import { SearchOutlined } from '@ant-design/icons';
import { Button, Input, Select, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { TimeRangeFilter } from 'components';
import { Label } from 'components/elements';
import { EMPTY_CELL, MAX_PAGE_SIZE, timeRangeTypes } from 'global';
import {
	useBranches,
	useGeneralLedger,
	useGeneralLedgerDetails,
	useJournalEntries,
	useQueryParams,
} from 'hooks';
import React, { useEffect, useMemo, useState } from 'react';
import { formatDateTime } from 'utils';
import { GeneralLedgerModal } from '../../modals/GeneralLedgerModal';

interface GeneralJournalEntry {
	id: number;
	datetime: string;
	branch?: string;
	referenceNumber: string;
	debitAccount: string;
	creditAccount: string;
	amount: string;
	remarks: string;
}

interface GeneralLedgerDetail {
	id: number;
	debitDate: string;
	debitAmount: string;
	debitRefNum: string;
	debitJournalEntryId?: number;
	creditDate: string;
	creditAmount: string;
	creditRefNum: string;
	creditJournalEntryId?: number;
}

interface GeneralLedgerEntry {
	id: number;
	accountCode: string;
	accountName: string;
	debitAmount: string;
	creditAmount: string;
	entries: GeneralLedgerDetail[];
}

interface GeneralLedgerSummaryRow {
	account_code: string;
	account_name: string;
	debit_amount: number | string;
	credit_amount: number | string;
	balance_side: string;
	balance_amount: number | string;
}

interface GeneralLedgerDetailRow {
	datetime: string;
	debit_amount: number | string;
	debit_reference_number: string;
	credit_amount: number | string;
	credit_reference_number: string;
	debit_journal_entry_id?: number | null;
	credit_journal_entry_id?: number | null;
}

interface SelectedLedgerMeta {
	accountCode: string;
	accountName: string;
	debitAmount: string;
	creditAmount: string;
}

interface Props {
	isHeadOffice: boolean;
	localBranchId: number;
	onOpenJournalEntry: (entry: GeneralJournalEntry) => void;
}

export const GeneralLedgerTab = ({
	isHeadOffice,
	localBranchId,
	onOpenJournalEntry,
}: Props) => {
	const { params, setQueryParams } = useQueryParams();
	const { data: { branches = [] } = { branches: [] } } = useBranches({
		params: {
			pageSize: MAX_PAGE_SIZE,
		},
	});

	useEffect(() => {
		if (isHeadOffice && !params.generalLedgerBranchId) {
			setQueryParams(
				{ generalLedgerBranchId: 'all' },
				{ shouldResetPage: false },
			);
		}
	}, [isHeadOffice, params.generalLedgerBranchId, setQueryParams]);

	const selectedTimeRange =
		(params?.generalLedgerTimeRange as string) || timeRangeTypes.DAILY;
	const selectedBranchId = useMemo(() => {
		if (!isHeadOffice) {
			return localBranchId || undefined;
		}

		if (params.generalLedgerBranchId === 'all') {
			return undefined;
		}

		if (params.generalLedgerBranchId) {
			return Number(params.generalLedgerBranchId);
		}

		return undefined;
	}, [isHeadOffice, localBranchId, params.generalLedgerBranchId]);

	const [currentPage, setCurrentPage] = useState(1);
	const [currentPageSize, setCurrentPageSize] = useState(10);
	const [searchText, setSearchText] = useState('');
	const [isLedgerViewOpen, setIsLedgerViewOpen] = useState(false);
	const [
		selectedLedgerMeta,
		setSelectedLedgerMeta,
	] = useState<SelectedLedgerMeta | null>(null);

	useEffect(() => {
		setCurrentPage(1);
	}, [searchText, selectedBranchId, selectedTimeRange]);

	const branchFilter = selectedBranchId;

	const {
		data: { generalLedgerEntries: summaryRows = [], total } = {
			generalLedgerEntries: [],
			total: 0,
		},
		isFetching,
	} = useGeneralLedger({
		params: {
			branchId: branchFilter,
			timeRange: selectedTimeRange,
			search: searchText || undefined,
			page: currentPage,
			pageSize: currentPageSize,
		},
	});

	const {
		data: { generalLedgerDetails: detailRows = [] } = {
			generalLedgerDetails: [],
		},
	} = useGeneralLedgerDetails({
		params: {
			accountCode: selectedLedgerMeta?.accountCode,
			branchId: branchFilter,
			timeRange: selectedTimeRange,
			page: 1,
			pageSize: MAX_PAGE_SIZE,
		},
		options: {
			enabled: isLedgerViewOpen && !!selectedLedgerMeta?.accountCode,
		},
	});

	const {
		data: { journalEntries: allJournalEntries = [] } = {},
	} = useJournalEntries({
		params: {
			page: 1,
			pageSize: MAX_PAGE_SIZE,
			...(branchFilter ? { branchId: branchFilter } : {}),
		},
	});

	const transformJournalEntry = (entry: any): GeneralJournalEntry => ({
		id: entry.id,
		datetime: formatDateTime(entry.datetime_created, false),
		branch: entry.branch_name,
		referenceNumber: entry.reference_number,
		debitAccount: entry.debit_account,
		creditAccount: entry.credit_account,
		amount: `₱ ${Number(entry.amount || 0).toFixed(2)}`,
		remarks: entry.remarks || EMPTY_CELL,
	});

	const allEntriesById = useMemo(() => {
		const mappedEntries = new Map<number, GeneralJournalEntry>();

		(allJournalEntries || []).forEach((entry: any) => {
			mappedEntries.set(entry.id, transformJournalEntry(entry));
		});

		return mappedEntries;
	}, [allJournalEntries]);

	const formatPeso = (value: number | string | undefined | null) =>
		`₱ ${Number(value || 0).toFixed(2)}`;

	const formatLongDate = (value: Date) =>
		new Intl.DateTimeFormat('en-US', {
			month: 'long',
			day: 'numeric',
			year: 'numeric',
		}).format(value);

	const parseDate = (value: string) => {
		const parsed = new Date(value);
		if (Number.isNaN(parsed.getTime())) {
			return null;
		}

		return parsed;
	};

	const asOfDateLabel = useMemo(() => {
		const today = new Date();

		if (!selectedTimeRange || selectedTimeRange === timeRangeTypes.DAILY) {
			return `As of ${formatLongDate(today)}`;
		}

		if (selectedTimeRange.includes(',')) {
			const [, endDate] = selectedTimeRange.split(',');
			const parsedEndDate = parseDate((endDate || '').trim());

			return `As of ${formatLongDate(parsedEndDate || today)}`;
		}

		const parsedSelectedDate = parseDate(selectedTimeRange);
		return `As of ${formatLongDate(parsedSelectedDate || today)}`;
	}, [selectedTimeRange]);

	const generalLedgerEntries = useMemo(
		() =>
			(summaryRows || []).map(
				(row: GeneralLedgerSummaryRow, index: number) => ({
					id: index + 1,
					accountCode: row.account_code,
					accountName: row.account_name,
					debitAmount: formatPeso(row.debit_amount),
					creditAmount: formatPeso(row.credit_amount),
					entries: [],
				}),
			),
		[summaryRows],
	);

	const selectedLedgerEntry = useMemo(() => {
		if (!selectedLedgerMeta) {
			return null;
		}

		const debitDetails = (detailRows || []).filter(
			(detail: GeneralLedgerDetailRow) => Number(detail.debit_amount || 0) > 0,
		);
		const creditDetails = (detailRows || []).filter(
			(detail: GeneralLedgerDetailRow) => Number(detail.credit_amount || 0) > 0,
		);

		const rowCount = Math.max(debitDetails.length, creditDetails.length);
		const mappedDetails = Array.from({ length: rowCount }, (_, index) => {
			const debitDetail = debitDetails[index];
			const creditDetail = creditDetails[index];

			return {
				id: index + 1,
				debitDate: debitDetail?.datetime || '',
				debitAmount: debitDetail ? formatPeso(debitDetail.debit_amount) : '',
				debitRefNum: debitDetail?.debit_reference_number || '',
				debitJournalEntryId: debitDetail?.debit_journal_entry_id || undefined,
				creditDate: creditDetail?.datetime || '',
				creditAmount: creditDetail
					? formatPeso(creditDetail.credit_amount)
					: '',
				creditRefNum: creditDetail?.credit_reference_number || '',
				creditJournalEntryId:
					creditDetail?.credit_journal_entry_id || undefined,
			};
		});

		return {
			id: 1,
			accountCode: selectedLedgerMeta.accountCode,
			accountName: selectedLedgerMeta.accountName,
			debitAmount: selectedLedgerMeta.debitAmount,
			creditAmount: selectedLedgerMeta.creditAmount,
			entries: mappedDetails,
		};
	}, [detailRows, selectedLedgerMeta]);

	const generalLedgerColumns = useMemo(() => {
		const tableColumns: ColumnsType<GeneralLedgerEntry> = [
			{
				title: 'Account Code',
				dataIndex: 'accountCode',
				key: 'accountCode',
				render: (value: string, record: GeneralLedgerEntry) => (
					<Button
						type="link"
						onClick={() => {
							setSelectedLedgerMeta({
								accountCode: record.accountCode,
								accountName: record.accountName,
								debitAmount: record.debitAmount,
								creditAmount: record.creditAmount,
							});
							setIsLedgerViewOpen(true);
						}}
					>
						{value}
					</Button>
				),
			},
			{ title: 'Account Name', dataIndex: 'accountName', key: 'accountName' },
			{ title: 'Debit Amount', dataIndex: 'debitAmount', key: 'debitAmount' },
			{
				title: 'Credit Amount',
				dataIndex: 'creditAmount',
				key: 'creditAmount',
			},
		];

		return tableColumns;
	}, []);

	const generalLedgerDetailColumns = useMemo(() => {
		const tableColumns: ColumnsType<GeneralLedgerDetail> = [
			{ title: 'Datetime', dataIndex: 'debitDate', key: 'debitDate' },
			{ title: 'Debit Amount', dataIndex: 'debitAmount', key: 'debitAmount' },
			{
				title: 'Reference Number',
				dataIndex: 'debitRefNum',
				key: 'debitRefNum',
				render: (value: string, record: GeneralLedgerDetail) => {
					if (!record.debitJournalEntryId || !value) return value;

					return (
						<Button
							type="link"
							onClick={() => {
								const matchedEntry = allEntriesById.get(
									record.debitJournalEntryId as number,
								);

								if (matchedEntry) {
									onOpenJournalEntry(matchedEntry);
								}
							}}
						>
							{value}
						</Button>
					);
				},
			},
			{
				title: '',
				key: 'separator',
				render: () => '',
				width: 24,
			},
			{ title: 'Datetime', dataIndex: 'creditDate', key: 'creditDate' },
			{
				title: 'Credit Amount',
				dataIndex: 'creditAmount',
				key: 'creditAmount',
			},
			{
				title: 'Reference Number',
				dataIndex: 'creditRefNum',
				key: 'creditRefNum',
				render: (value: string, record: GeneralLedgerDetail) => {
					if (!record.creditJournalEntryId || !value) return value;

					return (
						<Button
							type="link"
							onClick={() => {
								const matchedEntry = allEntriesById.get(
									record.creditJournalEntryId as number,
								);

								if (matchedEntry) {
									onOpenJournalEntry(matchedEntry);
								}
							}}
						>
							{value}
						</Button>
					);
				},
			},
		];

		return tableColumns;
	}, [allEntriesById, onOpenJournalEntry]);

	const ledgerBalanceSummary = useMemo(() => {
		const parseAmount = (value: string) =>
			Number(String(value || '').replace(/[^0-9.-]+/g, '')) || 0;

		const totals = (selectedLedgerEntry?.entries || []).reduce(
			(accumulator, current) => ({
				debit: accumulator.debit + parseAmount(current.debitAmount),
				credit: accumulator.credit + parseAmount(current.creditAmount),
			}),
			{ debit: 0, credit: 0 },
		);

		const isDebitLarger = totals.debit >= totals.credit;
		const balanceType = isDebitLarger ? 'Debit' : 'Credit';
		const balanceValue = Math.abs(totals.debit - totals.credit);

		return {
			label: balanceType,
			value: `₱ ${balanceValue.toFixed(2)}`,
		};
	}, [selectedLedgerEntry]);

	return (
		<>
			<div className="BooksOfAccounts_ledgerHeader">
				<div className="BooksOfAccounts_ledgerControls">
					<div className="BooksOfAccounts_ledgerTimeRange">
						<TimeRangeFilter
							dateRangeLabel="Select Date"
							queryName="generalLedgerTimeRange"
							useSingleDateForDateRange
						/>
					</div>
					<div className="BooksOfAccounts_ledgerSearch">
						<Input
							className="BooksOfAccounts_ledgerSearchInput"
							placeholder="Search account"
							prefix={<SearchOutlined />}
							value={searchText}
							allowClear
							onChange={(event) => {
								setSearchText(event.target.value);
							}}
						/>
					</div>
					{isHeadOffice && (
						<div className="BooksOfAccounts_ledgerBranchFilter">
							<Label label="Branch" spacing />
							<Select
								className="w-100"
								optionFilterProp="children"
								placeholder="Select Branch"
								value={(() => {
									if (params.generalLedgerBranchId === 'all') {
										return 'all';
									}

									if (params.generalLedgerBranchId) {
										return Number(params.generalLedgerBranchId);
									}

									return 'all';
								})()}
								showSearch
								onChange={(value) => {
									setQueryParams(
										{
											generalLedgerBranchId: value || 'all',
										},
										{ shouldResetPage: false },
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
						</div>
					)}
				</div>
				<div className="BooksOfAccounts_ledgerAsOf">{asOfDateLabel}</div>
			</div>
			<Table
				className="BooksOfAccounts_table"
				columns={generalLedgerColumns}
				dataSource={generalLedgerEntries}
				loading={isFetching}
				pagination={{
					current: currentPage,
					pageSize: currentPageSize,
					total,
					hideOnSinglePage: true,
					position: ['bottomCenter'],
					showSizeChanger: true,
					onChange: (page, pageSize) => {
						setCurrentPage(page);
						setCurrentPageSize(pageSize);
					},
				}}
				rowKey="id"
				bordered
			/>

			<GeneralLedgerModal
				columns={generalLedgerDetailColumns}
				entry={selectedLedgerEntry}
				open={isLedgerViewOpen}
				summary={ledgerBalanceSummary}
				onClose={() => {
					setIsLedgerViewOpen(false);
					setSelectedLedgerMeta(null);
				}}
			/>
		</>
	);
};
