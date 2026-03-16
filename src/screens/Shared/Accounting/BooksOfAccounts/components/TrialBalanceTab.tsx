import { Button, Select, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { TimeRangeFilter } from 'components';
import { Label } from 'components/elements';
import { MAX_PAGE_SIZE, timeRangeTypes } from 'global';
import {
	useBranches,
	useMultipleTrialBalanceDetails,
	useQueryParams,
	useTrialBalance,
	useTrialBalanceDetails,
} from 'hooks';
import React, { useEffect, useMemo, useState } from 'react';
import { formatInPeso } from 'utils';
import { TrialBalanceModal } from '../../modals/TrialBalanceModal';

interface TrialBalanceSummaryRow {
	branch_id: number;
	reference_number: string;
	snapshot_date: string;
	branch_name: string;
	balance_amount: number | string;
}

interface TrialBalanceDetailApiRow {
	account_code?: string;
	account_name: string;
	debit_amount: number | string;
	credit_amount: number | string;
}

interface TrialBalanceDetailApi {
	reference_number: string;
	snapshot_date: string;
	branch_id: number;
	branch_name: string;
	store_name: string;
	store_address: string;
	store_tin: string;
	entries: TrialBalanceDetailApiRow[];
}

interface TrialBalanceListEntry {
	id: number;
	referenceNumber: string;
	snapshotDateKey: string;
	date: string;
	branchName: string;
	balanceAmount: string;
}

interface Props {
	isHeadOffice: boolean;
	localBranchId: number;
}

export const TrialBalanceTab = ({ isHeadOffice, localBranchId }: Props) => {
	const { params, setQueryParams } = useQueryParams();
	const { data: { branches = [] } = { branches: [] } } = useBranches({
		params: {
			pageSize: MAX_PAGE_SIZE,
		},
	});

	useEffect(() => {
		if (isHeadOffice && !params.trialBalanceBranchId) {
			setQueryParams(
				{ trialBalanceBranchId: 'all' },
				{ shouldResetPage: false },
			);
		}
	}, [isHeadOffice, params.trialBalanceBranchId, setQueryParams]);

	const selectedTimeRange =
		(params?.trialBalanceTimeRange as string) || timeRangeTypes.DAILY;
	const selectedBranchId = useMemo(() => {
		if (!isHeadOffice) {
			return localBranchId || undefined;
		}

		if (params.trialBalanceBranchId === 'all') {
			return undefined;
		}

		if (params.trialBalanceBranchId) {
			return Number(params.trialBalanceBranchId);
		}

		return undefined;
	}, [isHeadOffice, localBranchId, params.trialBalanceBranchId]);

	const isAllBranches = isHeadOffice && params.trialBalanceBranchId === 'all';
	const mainBranch = useMemo(
		() => branches.find((branch: any) => branch.is_main),
		[branches],
	);

	const [currentPage, setCurrentPage] = useState(1);
	const [currentPageSize, setCurrentPageSize] = useState(10);
	const [isDetailOpen, setIsDetailOpen] = useState(false);
	const [selectedReferenceNumber, setSelectedReferenceNumber] = useState('');
	const [selectedAllDateKey, setSelectedAllDateKey] = useState('');

	useEffect(() => {
		setCurrentPage(1);
	}, [selectedBranchId, selectedTimeRange]);

	const {
		data: { trialBalanceEntries: summaryRows = [], total } = {
			trialBalanceEntries: [],
			total: 0,
		},
		isFetching,
	} = useTrialBalance({
		params: {
			branchId: selectedBranchId,
			timeRange: selectedTimeRange,
			page: isAllBranches ? 1 : currentPage,
			pageSize: isAllBranches ? MAX_PAGE_SIZE : currentPageSize,
		},
	});

	const { data: detailDataRaw = null } = useTrialBalanceDetails({
		params: {
			referenceNumber: selectedReferenceNumber,
		},
		options: {
			enabled: isDetailOpen && !!selectedReferenceNumber,
		},
	});

	const detailData = detailDataRaw as TrialBalanceDetailApi | null;
	const allBranchReferenceNumbers = useMemo(() => {
		if (!isAllBranches || !selectedAllDateKey) {
			return [];
		}

		return (summaryRows || [])
			.filter(
				(row: TrialBalanceSummaryRow) =>
					row.snapshot_date === selectedAllDateKey,
			)
			.map((row: TrialBalanceSummaryRow) => row.reference_number);
	}, [isAllBranches, selectedAllDateKey, summaryRows]);

	const { data: allBranchDetailData = [] } = useMultipleTrialBalanceDetails({
		params: {
			referenceNumbers: allBranchReferenceNumbers,
		},
		options: {
			enabled:
				isDetailOpen && isAllBranches && allBranchReferenceNumbers.length > 0,
		},
	});

	const formatBalancePeso = (value: number | string | undefined | null) =>
		formatInPeso(value, '₱ ');

	const formatEntryPeso = (value: number | string | undefined | null) => {
		const parsedValue = Number(value || 0);

		if (parsedValue === 0) {
			return '';
		}

		return formatInPeso(parsedValue, '₱ ');
	};

	const formatShortDate = (value: string) => {
		const parsed = new Date(value);
		if (Number.isNaN(parsed.getTime())) {
			return value || '-';
		}

		return new Intl.DateTimeFormat('en-US', {
			month: 'numeric',
			day: 'numeric',
			year: '2-digit',
		}).format(parsed);
	};

	const formatLongDate = (value: Date) =>
		new Intl.DateTimeFormat('en-US', {
			month: 'long',
			day: 'numeric',
			year: 'numeric',
		}).format(value);

	const capitalizeMonth = (value: string) => {
		const [month, ...rest] = value.split(' ');

		if (!month) {
			return value;
		}

		return [month.toUpperCase(), ...rest].join(' ');
	};

	const parseDate = (value: string) => {
		const parsed = new Date(value);
		if (Number.isNaN(parsed.getTime())) {
			return null;
		}

		return parsed;
	};

	const resolveDisplayedEndDate = (value: string) => {
		const parsedEndDate = parseDate(value);
		if (!parsedEndDate) {
			return null;
		}

		const today = new Date();
		const isCurrentMonthSelection =
			parsedEndDate.getFullYear() === today.getFullYear() &&
			parsedEndDate.getMonth() === today.getMonth();

		if (isCurrentMonthSelection && parsedEndDate > today) {
			return today;
		}

		return parsedEndDate;
	};

	const asOfDateLabel = useMemo(() => {
		const today = new Date();

		if (!selectedTimeRange || selectedTimeRange === timeRangeTypes.DAILY) {
			return `As of ${formatLongDate(today)}`;
		}

		if (selectedTimeRange.includes(',')) {
			const [, endDate] = selectedTimeRange.split(',');
			const parsedEndDate = resolveDisplayedEndDate((endDate || '').trim());

			return `As of ${formatLongDate(parsedEndDate || today)}`;
		}

		const parsedSelectedDate = parseDate(selectedTimeRange);
		return `As of ${formatLongDate(parsedSelectedDate || today)}`;
	}, [selectedTimeRange]);

	const tableData: TrialBalanceListEntry[] = useMemo(() => {
		if (isAllBranches) {
			const grouped = new Map<string, { date: string; totalBalance: number }>();
			(summaryRows || []).forEach((row: TrialBalanceSummaryRow) => {
				const key = row.snapshot_date;
				const amount = Number(row.balance_amount || 0);
				const existing = grouped.get(key);
				if (existing) {
					existing.totalBalance += amount;
				} else {
					grouped.set(key, {
						date: formatShortDate(row.snapshot_date),
						totalBalance: amount,
					});
				}
			});

			return Array.from(grouped.entries()).map(([key, group], index) => {
				const mainBranchRow = (summaryRows || []).find(
					(row: TrialBalanceSummaryRow) =>
						row.snapshot_date === key && row.branch_id === mainBranch?.id,
				);

				return {
					id: index + 1,
					referenceNumber: mainBranchRow?.reference_number || `tb-all-${key}`,
					snapshotDateKey: key,
					date: group.date,
					branchName: 'All',
					balanceAmount: formatBalancePeso(group.totalBalance),
				};
			});
		}

		return (summaryRows || []).map(
			(row: TrialBalanceSummaryRow, index: number) => ({
				id: index + 1,
				referenceNumber: row.reference_number,
				snapshotDateKey: row.snapshot_date,
				date: formatShortDate(row.snapshot_date),
				branchName: row.branch_name,
				balanceAmount: formatBalancePeso(row.balance_amount),
			}),
		);
	}, [summaryRows, isAllBranches, mainBranch]);

	const columns = useMemo(() => {
		const tableColumns: ColumnsType<TrialBalanceListEntry> = [];

		tableColumns.push({
			title: 'Reference Number',
			dataIndex: 'referenceNumber',
			key: 'referenceNumber',
			render: (value: string, record: TrialBalanceListEntry) => (
				<Button
					type="link"
					onClick={() => {
						if (isAllBranches) {
							setSelectedAllDateKey(record.snapshotDateKey);
						} else {
							setSelectedReferenceNumber(value);
						}
						setIsDetailOpen(true);
					}}
				>
					{value}
				</Button>
			),
		});

		tableColumns.push({ title: 'Date', dataIndex: 'date', key: 'date' });

		if (isHeadOffice && !isAllBranches) {
			tableColumns.push({
				title: 'Branch',
				dataIndex: 'branchName',
				key: 'branchName',
			});
		}

		tableColumns.push({
			title: 'Balances',
			dataIndex: 'balanceAmount',
			key: 'balanceAmount',
			align: 'right',
		});

		return tableColumns;
	}, [isHeadOffice, isAllBranches]);

	const modalEntry = useMemo(() => {
		if (!detailData) {
			return null;
		}

		return {
			referenceNumber: detailData.reference_number,
			snapshotDate: capitalizeMonth(
				formatLongDate(parseDate(detailData.snapshot_date) || new Date()),
			),
			storeName: detailData.store_name || '',
			storeAddress: detailData.store_address || '',
			branchName: detailData.branch_name || '',
			storeTin: detailData.store_tin || '',
			entries: (detailData.entries || []).map(
				(detail: TrialBalanceDetailApiRow, index: number) => ({
					id: index + 1,
					accountCode: detail.account_code || '',
					accountName: detail.account_name,
					debitAmount: formatEntryPeso(detail.debit_amount),
					creditAmount: formatEntryPeso(detail.credit_amount),
				}),
			),
		};
	}, [detailData]);

	const allBranchesModalEntry = useMemo(() => {
		if (!isAllBranches || !selectedAllDateKey) {
			return null;
		}

		const rowsForDate = (summaryRows || []).filter(
			(row: TrialBalanceSummaryRow) => row.snapshot_date === selectedAllDateKey,
		);

		if (rowsForDate.length === 0) {
			return null;
		}

		const headerReferenceNumber =
			rowsForDate.find(
				(row: TrialBalanceSummaryRow) => row.branch_id === mainBranch?.id,
			)?.reference_number || `tb-all-${selectedAllDateKey}`;

		const aggregatedEntriesMap = new Map<
			string,
			{
				accountCode: string;
				accountName: string;
				debitAmount: number;
				creditAmount: number;
			}
		>();

		(allBranchDetailData as TrialBalanceDetailApi[]).forEach(
			(detail: TrialBalanceDetailApi) => {
				(detail.entries || []).forEach((entry: TrialBalanceDetailApiRow) => {
					const accountName = entry.account_name || '-';
					const existing = aggregatedEntriesMap.get(accountName);
					const debitAmount = Number(entry.debit_amount || 0);
					const creditAmount = Number(entry.credit_amount || 0);

					if (existing) {
						existing.debitAmount += debitAmount;
						existing.creditAmount += creditAmount;
						return;
					}

					aggregatedEntriesMap.set(accountName, {
						accountCode: entry.account_code || '',
						accountName,
						debitAmount,
						creditAmount,
					});
				});
			},
		);

		return {
			referenceNumber: headerReferenceNumber,
			snapshotDate: capitalizeMonth(
				formatLongDate(parseDate(selectedAllDateKey) || new Date()),
			),
			storeName: mainBranch?.store_name || '',
			storeAddress: mainBranch?.store_address || '',
			branchName: mainBranch?.name || 'All Branches',
			storeTin: mainBranch?.tin || '',
			entries: Array.from(aggregatedEntriesMap.values()).map(
				(entry, index: number) => ({
					id: index + 1,
					accountCode: entry.accountCode,
					accountName: entry.accountName,
					debitAmount: formatEntryPeso(entry.debitAmount),
					creditAmount: formatEntryPeso(entry.creditAmount),
				}),
			),
		};
	}, [
		allBranchDetailData,
		isAllBranches,
		mainBranch,
		selectedAllDateKey,
		summaryRows,
	]);

	return (
		<>
			<div className="BooksOfAccounts_ledgerHeader">
				<div className="BooksOfAccounts_ledgerControls">
					<div className="BooksOfAccounts_ledgerTimeRange">
						<TimeRangeFilter
							dateRangeLabel="Select Date"
							queryName="trialBalanceTimeRange"
							useSingleDateForDateRange
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
									if (params.trialBalanceBranchId === 'all') {
										return 'all';
									}

									if (params.trialBalanceBranchId) {
										return Number(params.trialBalanceBranchId);
									}

									return 'all';
								})()}
								showSearch
								onChange={(value) => {
									setQueryParams(
										{
											trialBalanceBranchId: value || 'all',
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
				columns={columns}
				dataSource={tableData}
				loading={isFetching}
				pagination={
					isAllBranches
						? false
						: {
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
						  }
				}
				rowKey="id"
				bordered
			/>

			<TrialBalanceModal
				entry={isAllBranches ? allBranchesModalEntry : modalEntry}
				open={isDetailOpen}
				onClose={() => {
					setIsDetailOpen(false);
					setSelectedReferenceNumber('');
					setSelectedAllDateKey('');
				}}
			/>
		</>
	);
};
