import { FileTextOutlined } from '@ant-design/icons';
import { Button, Card, Col, Modal, Row, Select, Tag } from 'antd';
import { Content, TimeRangeFilter } from 'components';
import { Box, Label } from 'components/elements';
import {
	ALL_OPTION_KEY,
	DATE_FORMAT,
	MAX_PAGE_SIZE,
	appTypes,
	timeRangeTypes,
} from 'global';
import {
	useBranches,
	useNotesToFinancialStatements,
	useQueryParams,
	useStatementOfChangesInEquity,
	useStatementOfFinancialPerformance,
	useStatementOfFinancialPosition,
} from 'hooks';
import moment from 'moment';
import React, { useMemo, useState } from 'react';
import { formatInPeso, getLocalBranchId } from 'utils';
import { StatementOfFinancialPerformanceModal } from 'screens/Shared/Accounting/modals/StatementOfFinancialPerformanceModal';
import { StatementOfFinancialPositionModal } from 'screens/Shared/Accounting/modals/StatementOfFinancialPositionModal';
import { StatementOfChangesInEquityModal } from 'screens/Shared/Accounting/modals/StatementOfChangesInEquityModal';
import { NotesToFinancialStatementsModal } from 'screens/Shared/Accounting/modals/NotesToFinancialStatementsModal';
import { getAppType } from 'utils/localStorage';
import './style.scss';

const STATEMENT_ITEMS = [
	'Statement of Financial Performance',
	'Statement of Financial Position',
	'Statement of Changes in Equity',
	'Statement of Cash Flows',
	'Notes to Financial Statements',
];

export const FinancialStatements = () => {
	const isHeadOffice = getAppType() === appTypes.HEAD_OFFICE;
	const localBranchId = Number(getLocalBranchId());
	const [activeStatement, setActiveStatement] = useState<string | null>(null);
	const isFinancialPerformanceOpen =
		activeStatement === 'Statement of Financial Performance';
	const isFinancialPositionOpen =
		activeStatement === 'Statement of Financial Position';
	const isChangesInEquityOpen =
		activeStatement === 'Statement of Changes in Equity';
	const isNotesToFinancialStatementsOpen =
		activeStatement === 'Notes to Financial Statements';
	const { params, setQueryParams } = useQueryParams({
		onParamsCheck: (currentParams) => {
			const newParams: Record<string, string> = {};

			if (!currentParams.financialStatementsTimeRange) {
				newParams.financialStatementsTimeRange = timeRangeTypes.DAILY;
			}

			if (isHeadOffice && !currentParams.financialStatementsBranchId) {
				newParams.financialStatementsBranchId = ALL_OPTION_KEY;
			}

			return newParams;
		},
	});

	const { data: { branches = [] } = { branches: [] } } = useBranches({
		params: {
			pageSize: MAX_PAGE_SIZE,
		},
	});
	const selectedBranchValue = useMemo(() => {
		if (!isHeadOffice) {
			return localBranchId || undefined;
		}

		if (!params.financialStatementsBranchId) {
			return ALL_OPTION_KEY;
		}

		if (params.financialStatementsBranchId === ALL_OPTION_KEY) {
			return ALL_OPTION_KEY;
		}

		return Number(params.financialStatementsBranchId);
	}, [isHeadOffice, localBranchId, params.financialStatementsBranchId]);

	const selectedBranchLabel = useMemo(() => {
		if (isHeadOffice && selectedBranchValue === ALL_OPTION_KEY) {
			return (
				branches.find((branch: any) => branch.is_main)?.name || 'Main Branch'
			);
		}

		return (
			branches.find(({ id }: any) => id === selectedBranchValue)?.name ||
			(isHeadOffice
				? branches.find((branch: any) => branch.is_main)?.name || 'Main Branch'
				: 'Branch')
		);
	}, [branches, isHeadOffice, selectedBranchValue]);

	const selectedBranchId = useMemo(() => {
		if (!isHeadOffice) {
			return localBranchId || undefined;
		}

		if (selectedBranchValue === ALL_OPTION_KEY) {
			return undefined;
		}

		return Number(selectedBranchValue);
	}, [isHeadOffice, localBranchId, selectedBranchValue]);

	const selectedTimeRangeLabel = useMemo(() => {
		const value = String(
			params.financialStatementsTimeRange || timeRangeTypes.DAILY,
		);

		if (value === timeRangeTypes.DAILY) {
			return moment().format(DATE_FORMAT);
		}

		const timeRangeValues = value.split(',').map((item) => item.trim());

		if (timeRangeValues.length === 2) {
			return `${timeRangeValues[0]}-${timeRangeValues[1]}`;
		}

		return moment(value, DATE_FORMAT, true).isValid()
			? moment(value, DATE_FORMAT).format(DATE_FORMAT)
			: value;
	}, [params.financialStatementsTimeRange]);

	const financialStatementAsOfLabel = useMemo(() => {
		const formatLongDate = (dateValue: moment.Moment) => {
			const formatted = dateValue.format('MMMM D, YYYY');
			const [month, ...rest] = formatted.split(' ');

			return [month?.toUpperCase() || '', ...rest].join(' ');
		};

		const value = String(
			params.financialStatementsTimeRange || timeRangeTypes.DAILY,
		);

		if (value === timeRangeTypes.DAILY) {
			return formatLongDate(moment());
		}

		const timeRangeValues = value.split(',').map((item) => item.trim());
		if (timeRangeValues.length === 2) {
			const endDate = moment(timeRangeValues[1], DATE_FORMAT, true);
			return endDate.isValid()
				? formatLongDate(endDate)
				: selectedTimeRangeLabel;
		}

		const singleDate = moment(value, DATE_FORMAT, true);
		return singleDate.isValid()
			? formatLongDate(singleDate)
			: selectedTimeRangeLabel;
	}, [params.financialStatementsTimeRange, selectedTimeRangeLabel]);

	const mainBranch = useMemo(
		() => branches.find((branch: any) => branch.is_main),
		[branches],
	);
	const headerBranch = useMemo(() => {
		if (isHeadOffice) {
			if (selectedBranchId) {
				return branches.find(({ id }: any) => id === selectedBranchId) || null;
			}

			return mainBranch || null;
		}

		return branches.find(({ id }: any) => id === localBranchId) || null;
	}, [branches, isHeadOffice, localBranchId, mainBranch, selectedBranchId]);

	const {
		data: financialPerformanceData = null,
		isFetching: isFetchingFinancialPerformance,
	} = useStatementOfFinancialPerformance({
		params: {
			branchId: selectedBranchId,
			timeRange: params.financialStatementsTimeRange,
		},
		options: {
			enabled: isFinancialPerformanceOpen,
		},
	});

	const {
		data: financialPositionData = null,
		isFetching: isFetchingFinancialPosition,
	} = useStatementOfFinancialPosition({
		params: {
			branchId: selectedBranchId,
			timeRange: params.financialStatementsTimeRange,
		},
		options: {
			enabled: isFinancialPositionOpen,
		},
	});

	const {
		data: changesInEquityData = null,
		isFetching: isFetchingChangesInEquity,
	} = useStatementOfChangesInEquity({
		params: {
			branchId: selectedBranchId,
			timeRange: params.financialStatementsTimeRange,
		},
		options: {
			enabled: isChangesInEquityOpen,
		},
	});

	const {
		data: notesData = null,
		isFetching: isFetchingNotes,
	} = useNotesToFinancialStatements({
		params: {
			branchId: selectedBranchId,
			timeRange: params.financialStatementsTimeRange,
		},
		options: {
			enabled: isNotesToFinancialStatementsOpen,
		},
	});

	const performanceModalEntry = useMemo(() => {
		const formatAmount = (value: number | string) => formatInPeso(value, '₱ ');
		const rows: Array<{
			id: number;
			code?: string;
			label: string;
			amount: string;
			isSection?: boolean;
			isTotal?: boolean;
			isSpacer?: boolean;
			amountBottomBold?: boolean;
			topBorderVisible?: boolean;
			indentLevel?: number;
		}> = [];

		const pushRow = (row: {
			code?: string;
			label: string;
			amount: string;
			isSection?: boolean;
			isTotal?: boolean;
			isSpacer?: boolean;
			amountBottomBold?: boolean;
			topBorderVisible?: boolean;
			indentLevel?: number;
		}) => {
			rows.push({
				id: rows.length + 1,
				...row,
			});
		};

		pushRow({
			code: '4000',
			label: 'Sales - Merchandise',
			amount: formatAmount(financialPerformanceData?.sales),
		});
		pushRow({
			code: '4010',
			label: 'Less: Sales Returns & Allowances',
			amount: formatAmount(
				financialPerformanceData?.sales_returns_and_allowances,
			),
		});
		pushRow({
			code: '4020',
			label: 'Less: Sales Discounts',
			amount: formatAmount(financialPerformanceData?.sales_discounts),
			amountBottomBold: true,
		});
		pushRow({
			label: 'Net Sales',
			amount: formatAmount(financialPerformanceData?.net_sales),
			isTotal: true,
		});
		pushRow({
			code: '4100',
			label: 'Service Income',
			amount: formatAmount(financialPerformanceData?.service_income),
		});
		pushRow({
			code: '4200',
			label: 'Other Income',
			amount: formatAmount(financialPerformanceData?.other_income),
			amountBottomBold: true,
		});
		pushRow({
			label: 'Total Revenue',
			amount: formatAmount(financialPerformanceData?.total_revenue),
		});
		pushRow({
			code: '5000',
			label: 'Less: Cost of Goods Sold',
			amount: formatAmount(financialPerformanceData?.cost_of_goods_sold),
			amountBottomBold: true,
		});
		pushRow({
			label: 'Gross Profit',
			amount: formatAmount(financialPerformanceData?.gross_profit),
		});
		pushRow({
			code: '',
			label: '',
			amount: '',
			isSpacer: true,
		});

		const expenses = financialPerformanceData?.expenses || [];
		pushRow({
			label: 'Expenses',
			amount: '',
			isSection: true,
			topBorderVisible: true,
		});
		expenses.forEach((entry: any) => {
			pushRow({
				code: entry.account_code,
				label: entry.account_name,
				amount: formatAmount(entry.amount),
				amountBottomBold: entry.account_code === '7100',
			});
		});

		pushRow({
			label: 'Total Expenses',
			amount: formatAmount(financialPerformanceData?.total_expenses),
			amountBottomBold: true,
		});
		pushRow({
			label: 'Income Before Tax',
			amount: formatAmount(financialPerformanceData?.income_before_tax),
		});
		pushRow({
			code: '6900',
			label: 'Income Tax Expense',
			amount: formatAmount(financialPerformanceData?.income_tax_expense),
			amountBottomBold: true,
		});
		pushRow({
			label: 'Net Income',
			amount: formatAmount(financialPerformanceData?.net_income),
			isTotal: true,
			amountBottomBold: true,
		});

		return {
			snapshotDate: financialStatementAsOfLabel,
			storeName:
				financialPerformanceData?.store_name ||
				mainBranch?.store_name ||
				headerBranch?.store_name ||
				'',
			storeAddress:
				financialPerformanceData?.store_address ||
				mainBranch?.store_address ||
				headerBranch?.store_address ||
				'',
			branchName:
				financialPerformanceData?.branch_name ||
				selectedBranchLabel ||
				mainBranch?.name ||
				headerBranch?.name ||
				'',
			storeTin:
				financialPerformanceData?.store_tin ||
				mainBranch?.tin ||
				headerBranch?.tin ||
				'',
			entries: rows,
		};
	}, [
		financialStatementAsOfLabel,
		financialPerformanceData,
		headerBranch,
		mainBranch,
		selectedBranchLabel,
	]);
	const positionModalEntry = useMemo(() => {
		const formatAmount = (value: number | string) => formatInPeso(value, '₱ ');

		const pushRow = (
			rows: Array<any>,
			row: {
				code?: string;
				label: string;
				amount: string;
				isSection?: boolean;
				isTotal?: boolean;
				isGrandTotal?: boolean;
				isSpacer?: boolean;
				amountBottomBold?: boolean;
			},
		) => {
			rows.push({ id: rows.length + 1, ...row });
		};

		const buildAccountRows = (
			rows: Array<any>,
			accounts: Array<any>,
			isLastBeforeTotal = false,
		) => {
			(accounts || []).forEach((acct: any, idx: number) => {
				pushRow(rows, {
					code: acct.account_code,
					label: acct.account_name,
					amount: formatAmount(acct.amount),
					amountBottomBold: isLastBeforeTotal && idx === accounts.length - 1,
				});
			});
		};

		// --- Assets side ---
		const assetsRows: Array<any> = [];

		pushRow(assetsRows, {
			label: 'ASSETS',
			amount: '',
			isSection: true,
		});
		pushRow(assetsRows, {
			label: 'Current Assets',
			amount: '',
			isSection: true,
		});
		buildAccountRows(assetsRows, financialPositionData?.current_assets, true);
		pushRow(assetsRows, {
			label: 'Total Current Assets',
			amount: formatAmount(financialPositionData?.total_current_assets),
			isTotal: true,
		});
		pushRow(assetsRows, { label: '', amount: '', isSpacer: true });
		pushRow(assetsRows, {
			label: 'Non-Current Assets',
			amount: '',
			isSection: true,
		});
		buildAccountRows(
			assetsRows,
			financialPositionData?.non_current_assets,
			true,
		);
		pushRow(assetsRows, {
			label: 'Total Non-Current Assets',
			amount: formatAmount(financialPositionData?.total_non_current_assets),
			isTotal: true,
			amountBottomBold: true,
		});
		pushRow(assetsRows, {
			label: 'TOTAL ASSETS',
			amount: formatAmount(financialPositionData?.total_assets),
			isGrandTotal: true,
			amountBottomBold: true,
		});

		// --- Liabilities & Equity side ---
		const liabilitiesEquityRows: Array<any> = [];

		pushRow(liabilitiesEquityRows, {
			label: 'LIABILITIES AND EQUITY',
			amount: '',
			isSection: true,
		});
		pushRow(liabilitiesEquityRows, {
			label: 'Current Liabilities',
			amount: '',
			isSection: true,
		});
		buildAccountRows(
			liabilitiesEquityRows,
			financialPositionData?.current_liabilities,
			true,
		);
		pushRow(liabilitiesEquityRows, {
			label: 'Total Current Liabilities',
			amount: formatAmount(financialPositionData?.total_current_liabilities),
			isTotal: true,
		});
		pushRow(liabilitiesEquityRows, { label: '', amount: '', isSpacer: true });
		pushRow(liabilitiesEquityRows, {
			label: 'Non-Current Liabilities',
			amount: '',
			isSection: true,
		});
		buildAccountRows(
			liabilitiesEquityRows,
			financialPositionData?.non_current_liabilities,
			true,
		);
		pushRow(liabilitiesEquityRows, {
			label: 'Total Non-Current Liabilities',
			amount: formatAmount(
				financialPositionData?.total_non_current_liabilities,
			),
			isTotal: true,
			amountBottomBold: true,
		});
		pushRow(liabilitiesEquityRows, {
			label: 'TOTAL LIABILITIES',
			amount: formatAmount(financialPositionData?.total_liabilities),
			isTotal: true,
		});
		pushRow(liabilitiesEquityRows, { label: '', amount: '', isSpacer: true });
		pushRow(liabilitiesEquityRows, {
			label: 'Equity',
			amount: '',
			isSection: true,
		});
		buildAccountRows(
			liabilitiesEquityRows,
			financialPositionData?.equity,
			false,
		);
		pushRow(liabilitiesEquityRows, {
			label:
				Number(financialPositionData?.current_year_net_income ?? 0) < 0
					? 'Net Income (Loss)'
					: 'Net Income',
			amount: formatAmount(financialPositionData?.current_year_net_income),
			amountBottomBold: true,
		});
		pushRow(liabilitiesEquityRows, {
			label: 'Total Equity',
			amount: formatAmount(financialPositionData?.total_equity),
			isTotal: true,
			amountBottomBold: true,
		});
		pushRow(liabilitiesEquityRows, {
			label: 'TOTAL LIABILITIES AND EQUITY',
			amount: formatAmount(financialPositionData?.total_liabilities_and_equity),
			isGrandTotal: true,
			amountBottomBold: true,
		});

		return {
			snapshotDate: financialStatementAsOfLabel,
			storeName:
				financialPositionData?.store_name ||
				mainBranch?.store_name ||
				headerBranch?.store_name ||
				'',
			storeAddress:
				financialPositionData?.store_address ||
				mainBranch?.store_address ||
				headerBranch?.store_address ||
				'',
			branchName:
				financialPositionData?.branch_name ||
				selectedBranchLabel ||
				mainBranch?.name ||
				headerBranch?.name ||
				'',
			storeTin:
				financialPositionData?.store_tin ||
				mainBranch?.tin ||
				headerBranch?.tin ||
				'',
			assetsRows,
			liabilitiesEquityRows,
		};
	}, [
		financialStatementAsOfLabel,
		financialPositionData,
		headerBranch,
		mainBranch,
		selectedBranchLabel,
	]);

	const notesModalEntry = useMemo(() => {
		const formatAmount = (value: number | string) => formatInPeso(value, '₱ ');
		const rows: Array<{
			id: number;
			code?: string;
			label: string;
			amount: string;
			isNoteHeader?: boolean;
			isDescription?: boolean;
			isColumnHeader?: boolean;
			isTotal?: boolean;
			isSpacer?: boolean;
			isNetIncome?: boolean;
			amountBottomBold?: boolean;
		}> = [];

		const pushRow = (row: Omit<typeof rows[number], 'id'>) => {
			rows.push({ id: rows.length + 1, ...row });
		};

		const notes = notesData?.notes || [];

		notes.forEach((note: any) => {
			pushRow({
				label: `Note ${note.note_number} \u2013 ${note.note_title}`,
				amount: '',
				isNoteHeader: true,
			});

			if (note.description) {
				pushRow({
					label: note.description,
					amount: '',
					isDescription: true,
				});
			}

			const accounts = note.accounts || [];

			if (accounts.length > 0) {
				// Column header row for notes with tables
				const isEquityNote = note.note_number === 8;
				const isPPENote = note.note_number === 6;
				let columnLabel = 'Account';
				if (isEquityNote) {
					columnLabel = 'Component';
				} else if (isPPENote) {
					columnLabel = 'Asset';
				}
				pushRow({
					code: '',
					label: columnLabel,
					amount: 'Amount',
					isColumnHeader: true,
				});

				accounts.forEach((acct: any, idx: number) => {
					pushRow({
						code: acct.account_code,
						label: acct.account_name,
						amount: formatAmount(acct.amount),
						amountBottomBold:
							idx === accounts.length - 1 && note.note_number !== 8,
					});
				});

				if (
					note.note_number === 8 &&
					note.current_year_net_income !== undefined &&
					note.current_year_net_income !== null
				) {
					pushRow({
						code: '',
						label:
							Number(note.current_year_net_income ?? 0) < 0
								? 'Net Income (Loss)'
								: 'Net Income',
						amount: formatAmount(note.current_year_net_income),
						isNetIncome: true,
						amountBottomBold: true,
					});
				}

				if (note.total !== null && note.total !== undefined) {
					let totalLabel = 'Total';
					if (note.note_number === 6) {
						totalLabel = `Net ${note.note_title}`;
					} else if (note.note_number === 8) {
						totalLabel = 'Total Equity';
					}
					pushRow({
						label: totalLabel,
						amount: formatAmount(note.total),
						isTotal: true,
						amountBottomBold: true,
					});
				}
			}

			pushRow({ label: '', amount: '', isSpacer: true });
		});

		return {
			snapshotDate: financialStatementAsOfLabel,
			storeName:
				notesData?.store_name ||
				mainBranch?.store_name ||
				headerBranch?.store_name ||
				'',
			storeAddress:
				notesData?.store_address ||
				mainBranch?.store_address ||
				headerBranch?.store_address ||
				'',
			branchName:
				notesData?.branch_name ||
				selectedBranchLabel ||
				mainBranch?.name ||
				headerBranch?.name ||
				'',
			storeTin:
				notesData?.store_tin || mainBranch?.tin || headerBranch?.tin || '',
			rows,
		};
	}, [
		financialStatementAsOfLabel,
		notesData,
		headerBranch,
		mainBranch,
		selectedBranchLabel,
	]);

	const changesInEquityModalEntry = useMemo(() => {
		const formatAmount = (value: number | string) => formatInPeso(value, '₱ ');
		const rows: Array<{
			id: number;
			particulars: string;
			ownersCapital: string;
			retainedEarnings: string;
			totalEquity: string;
			isHeader?: boolean;
			isTotal?: boolean;
			amountBottomBold?: boolean;
			isNegative?: boolean;
		}> = [];

		const pushRow = (row: Omit<typeof rows[number], 'id'>) => {
			rows.push({ id: rows.length + 1, ...row });
		};

		pushRow({
			particulars: 'Beginning Balance',
			ownersCapital: formatAmount(
				changesInEquityData?.beginning_owners_capital,
			),
			retainedEarnings: formatAmount(
				changesInEquityData?.beginning_retained_earnings,
			),
			totalEquity: formatAmount(changesInEquityData?.beginning_total_equity),
		});
		pushRow({
			particulars:
				Number(changesInEquityData?.net_income ?? 0) < 0
					? 'Net Income (Loss)'
					: 'Net Income',
			ownersCapital: '',
			retainedEarnings: formatAmount(changesInEquityData?.net_income),
			totalEquity: formatAmount(changesInEquityData?.net_income),
		});
		pushRow({
			particulars: 'Less: Owner Drawings',
			ownersCapital: formatAmount(
				changesInEquityData?.owner_drawings
					? Math.abs(changesInEquityData.owner_drawings)
					: 0,
			),
			retainedEarnings: '',
			totalEquity: formatAmount(
				changesInEquityData?.owner_drawings
					? Math.abs(changesInEquityData.owner_drawings)
					: 0,
			),
		});
		pushRow({
			particulars: 'Ending Balance',
			ownersCapital: formatAmount(changesInEquityData?.ending_owners_capital),
			retainedEarnings: formatAmount(
				changesInEquityData?.ending_retained_earnings,
			),
			totalEquity: formatAmount(changesInEquityData?.ending_total_equity),
			isTotal: true,
			amountBottomBold: true,
		});

		return {
			snapshotDate: financialStatementAsOfLabel,
			storeName:
				changesInEquityData?.store_name ||
				mainBranch?.store_name ||
				headerBranch?.store_name ||
				'',
			storeAddress:
				changesInEquityData?.store_address ||
				mainBranch?.store_address ||
				headerBranch?.store_address ||
				'',
			branchName:
				changesInEquityData?.branch_name ||
				selectedBranchLabel ||
				mainBranch?.name ||
				headerBranch?.name ||
				'',
			storeTin:
				changesInEquityData?.store_tin ||
				mainBranch?.tin ||
				headerBranch?.tin ||
				'',
			rows,
		};
	}, [
		financialStatementAsOfLabel,
		changesInEquityData,
		headerBranch,
		mainBranch,
		selectedBranchLabel,
	]);

	return (
		<Content title="Financial Statements">
			<Box padding>
				<div className="FinancialStatements">
					<div className="FinancialStatements_header">
						<Row className="FinancialStatements_filters" gutter={[16, 16]}>
							<Col className="FinancialStatements_timeRange">
								<TimeRangeFilter
									dateRangeLabel="Select Date"
									queryName="financialStatementsTimeRange"
									useSingleDateForDateRange
								/>
							</Col>
							{isHeadOffice && (
								<Col className="FinancialStatements_branchFilter">
									<Label label="Branch" spacing />
									<Select
										className="w-100"
										optionFilterProp="children"
										placeholder="Select Branch"
										value={selectedBranchValue}
										showSearch
										onChange={(value) => {
											setQueryParams(
												{
													financialStatementsBranchId: value,
												},
												{ shouldResetPage: false },
											);
										}}
									>
										<Select.Option value={ALL_OPTION_KEY}>All</Select.Option>
										{branches.map(({ id, name }: any) => (
											<Select.Option key={id} value={id}>
												{name}
											</Select.Option>
										))}
									</Select>
								</Col>
							)}
						</Row>
					</div>

					<div className="FinancialStatements_grid">
						{STATEMENT_ITEMS.map((statementTitle, index) => (
							<Card
								key={statementTitle}
								bodyStyle={{ padding: 16 }}
								className="FinancialStatements_card"
								hoverable
								onClick={() => setActiveStatement(statementTitle)}
							>
								<div className="FinancialStatements_cardInner">
									<div className="FinancialStatements_iconWrap bg-light rounded">
										<FileTextOutlined className="FinancialStatements_icon" />
										<Tag className="FinancialStatements_cardTag" color="green">
											FS {index + 1}
										</Tag>
									</div>
									<div className="FinancialStatements_text">
										<div className="FinancialStatements_title">
											{statementTitle}
										</div>
										<div className="FinancialStatements_subtitle">
											As of {selectedTimeRangeLabel}
										</div>
										<div className="FinancialStatements_subtitle">
											{selectedBranchLabel}
										</div>
									</div>
								</div>
							</Card>
						))}
					</div>
				</div>
			</Box>

			{isFinancialPerformanceOpen && (
				<StatementOfFinancialPerformanceModal
					entry={performanceModalEntry}
					isLoading={isFetchingFinancialPerformance}
					open={isFinancialPerformanceOpen}
					onClose={() => setActiveStatement(null)}
				/>
			)}

			{isFinancialPositionOpen && (
				<StatementOfFinancialPositionModal
					entry={positionModalEntry}
					isLoading={isFetchingFinancialPosition}
					open={isFinancialPositionOpen}
					onClose={() => setActiveStatement(null)}
				/>
			)}

			{isChangesInEquityOpen && (
				<StatementOfChangesInEquityModal
					entry={changesInEquityModalEntry}
					isLoading={isFetchingChangesInEquity}
					open={isChangesInEquityOpen}
					onClose={() => setActiveStatement(null)}
				/>
			)}

			{isNotesToFinancialStatementsOpen && (
				<NotesToFinancialStatementsModal
					entry={notesModalEntry}
					isLoading={isFetchingNotes}
					open={isNotesToFinancialStatementsOpen}
					onClose={() => setActiveStatement(null)}
				/>
			)}

			{activeStatement &&
				!isFinancialPerformanceOpen &&
				!isFinancialPositionOpen &&
				!isChangesInEquityOpen &&
				!isNotesToFinancialStatementsOpen && (
					<Modal
						className="Modal__hasFooter"
						footer={
							<Button onClick={() => setActiveStatement(null)}>Close</Button>
						}
						open={!!activeStatement}
						title={activeStatement || 'Financial Statement'}
						onCancel={() => setActiveStatement(null)}
					>
						<div className="FinancialStatements_modalBody">
							<div className="FinancialStatements_modalTags">
								<Tag color="blue">{selectedBranchLabel}</Tag>
								<Tag color="green">{selectedTimeRangeLabel}</Tag>
							</div>
							<p className="mb-0">
								This statement entry point is ready. The report content or print
								layout for {activeStatement} can be connected here next.
							</p>
						</div>
					</Modal>
				)}
		</Content>
	);
};
