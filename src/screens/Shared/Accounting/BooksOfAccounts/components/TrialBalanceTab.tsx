import { Button, Select, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { TimeRangeFilter } from 'components';
import { Label } from 'components/elements';
import { EMPTY_CELL, MAX_PAGE_SIZE, timeRangeTypes } from 'global';
import {
	useBranches,
	useQueryParams,
	useTrialBalance,
	useTrialBalanceDetails,
} from 'hooks';
import React, { useEffect, useMemo, useState } from 'react';
import { TrialBalanceModal } from '../../modals/TrialBalanceModal';

interface TrialBalanceSummaryRow {
	branch_id: number;
	reference_number: string;
	snapshot_date: string;
	branch_name: string;
	balance_amount: number | string;
}

interface TrialBalanceDetailApiRow {
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

	const [currentPage, setCurrentPage] = useState(1);
	const [currentPageSize, setCurrentPageSize] = useState(10);
	const [isDetailOpen, setIsDetailOpen] = useState(false);
	const [selectedReferenceNumber, setSelectedReferenceNumber] = useState('');

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
			page: currentPage,
			pageSize: currentPageSize,
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

	const formatPeso = (value: number | string | undefined | null) => {
		const parsedValue = Number(value || 0);

		if (parsedValue === 0) {
			return EMPTY_CELL;
		}

		return `₱ ${parsedValue.toFixed(2)}`;
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

	const tableData: TrialBalanceListEntry[] = useMemo(
		() =>
			(summaryRows || []).map((row: TrialBalanceSummaryRow, index: number) => ({
				id: index + 1,
				referenceNumber: row.reference_number,
				date: formatShortDate(row.snapshot_date),
				branchName: row.branch_name,
				balanceAmount: formatPeso(row.balance_amount),
			})),
		[summaryRows],
	);

	const columns = useMemo(() => {
		const tableColumns: ColumnsType<TrialBalanceListEntry> = [
			{
				title: 'Reference Number',
				dataIndex: 'referenceNumber',
				key: 'referenceNumber',
				render: (value: string) => (
					<Button
						type="link"
						onClick={() => {
							setSelectedReferenceNumber(value);
							setIsDetailOpen(true);
						}}
					>
						{value}
					</Button>
				),
			},
			{ title: 'Date', dataIndex: 'date', key: 'date' },
		];

		if (isHeadOffice) {
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
		});

		return tableColumns;
	}, [isHeadOffice]);

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
			storeTin: detailData.store_tin || '',
			entries: (detailData.entries || []).map(
				(detail: TrialBalanceDetailApiRow, index: number) => ({
					id: index + 1,
					accountName: detail.account_name,
					debitAmount: formatPeso(detail.debit_amount),
					creditAmount: formatPeso(detail.credit_amount),
				}),
			),
		};
	}, [detailData]);

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

			<TrialBalanceModal
				entry={modalEntry}
				open={isDetailOpen}
				onClose={() => {
					setIsDetailOpen(false);
					setSelectedReferenceNumber('');
				}}
			/>
		</>
	);
};
