import { Col, Row, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { RequestErrors, TableHeader, TimeRangeFilter } from 'components';
import { PdfButtons } from 'components/Printing';
import {
	BirReportsService,
	MAX_PAGE_SIZE,
	NO_TRANSACTION_REMARK,
	printBirReport,
	useBirReports,
	usePdf,
} from 'ejjy-global';
import {
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	EMPTY_CELL,
	pageSizeOptions,
	refetchOptions,
	timeRangeTypes,
} from 'global';
import { useQueryParams, useSiteSettings } from 'hooks';
import React, { useEffect, useRef, useState } from 'react';
import { useUserStore } from 'stores';
import {
	convertIntoArray,
	formatDate,
	formatInPeso,
	getLocalApiUrl,
} from 'utils';
import { birAnnexTransactionsTabs as tabs } from 'ejjy-global/dist/components/BirAnnexTransactions/data';

type Props = {
	branchMachineId: number;
};

const columns: ColumnsType = [
	{ title: 'Date', dataIndex: 'date', fixed: 'left' },
	{ title: 'Beginning SI/OR No.', dataIndex: 'beginningOrNumber' },
	{ title: 'Ending SI/OR No.', dataIndex: 'endingOrNumber' },
	{
		title: 'Grand Accum. Sales Ending Balance',
		dataIndex: 'grandAccumulatedSalesEndingBalance',
	},
	{
		title: 'Grand Accum. Sales Beg. Balance',
		dataIndex: 'grandAccumulatedSalesBeginningBalance',
	},
	{
		title: 'Sales Issued w/ Manual SI/OR (per RR 16-2018)',
		dataIndex: 'salesIssueWithManual',
	},
	{ title: 'Gross Sales of the Day', dataIndex: 'grossSalesForTheDay' },
	{ title: 'VATable Sales', dataIndex: 'vatableSales' },
	{ title: 'VAT Amount', dataIndex: 'vatAmount' },
	{ title: 'VAT-Exempt Sales', dataIndex: 'vatExemptSales' },
	{ title: 'Zero Rated Sales', dataIndex: 'zeroRatedSales' },
	{
		title: 'Deductions',
		children: [
			{
				title: 'Discount',
				children: [
					{ title: 'SC', dataIndex: 'scDiscount' },
					{ title: 'PWD', dataIndex: 'pwdDiscount' },
					{ title: 'NAAC', dataIndex: 'naacDiscount' },
					{ title: 'Solo Parent', dataIndex: 'spDiscount' },
					{ title: 'Others', dataIndex: 'othersDiscount' },
				],
			},
			{ title: 'Returns', dataIndex: 'returns' },
			{ title: 'Void', dataIndex: 'void' },
			{ title: 'Total Deductions', dataIndex: 'totalDeductions' },
		],
	},
	{
		title: 'Adjustment on VAT',
		children: [
			{
				title: 'Discount',
				children: [
					{ title: 'SC', dataIndex: 'vatScDiscount' },
					{ title: 'PWD', dataIndex: 'vatPwdDiscount' },
					{ title: 'Others', dataIndex: 'vatOthersDiscount' },
				],
			},
			{ title: 'VAT on Returns', dataIndex: 'vatOnReturns' },
			{ title: 'Others', dataIndex: 'vatOthers' },
			{ title: 'Total VAT Adjustment', dataIndex: 'totalVatAdjusted' },
		],
	},
	{ title: 'VAT Payable', dataIndex: 'vatPayable' },
	{
		title: 'Net Sales',
		dataIndex: 'netSales',
	},
	{ title: 'Sales Overrun/Overflow', dataIndex: 'salesOverrunOrOverflow' },
	{ title: 'Total Income', dataIndex: 'totalIncome' },
	{ title: 'Reset Counter', dataIndex: 'resetCounter' },
	{ title: 'Z-Counter', dataIndex: 'zCounter' },
	{ title: 'Remarks', dataIndex: 'remarks' },
];

export const AnnexBirSalesSummaryTab = ({ branchMachineId }: Props) => {
	// STATES
	const [dataSource, setDataSource] = useState([]);
	const containerRef = useRef<HTMLDivElement | null>(null);

	// CUSTOM HOOKS
	const user = useUserStore((state) => state.user);
	const { params, setQueryParams } = useQueryParams();
	const {
		data: siteSettings,
		isFetching: isFetchingSiteSettings,
		error: siteSettingsError,
	} = useSiteSettings();
	const {
		data: birReportsData,
		isFetching: isFetchingBirReports,
		isFetched: isBirReportsFetched,
		error: birReportsError,
	} = useBirReports({
		params: {
			branchMachineId,
			timeRange: timeRangeTypes.DAILY,
			...params,
		},
		options: refetchOptions,
		serviceOptions: { baseURL: getLocalApiUrl() },
	});
	const { htmlPdf, isLoadingPdf, previewPdf, downloadPdf } = usePdf({
		title: 'AnnexE1.pdf',
		container: {
			containerRef,
			widthAdd: 30,
			heightAdd: 30,
		},
		jsPdfSettings: {
			unit: 'px',
			putOnlyUsedFonts: true,
		},
		print: async () => {
			const response = await BirReportsService.list(
				{
					branch_machine_id: branchMachineId,
					page_size: MAX_PAGE_SIZE,
					page: DEFAULT_PAGE,
					time_range: params?.timeRange as string,
				},
				getLocalApiUrl(),
			);

			const birReports = response.results;

			return printBirReport(birReports, siteSettings, user);
		},
	});

	// METHODS
	useEffect(() => {
		if (birReportsData?.list) {
			const data = birReportsData.list.map((report) => {
				const hasNoTransaction = Number(report.gross_sales_for_the_day) === 0;

				return {
					key: report.id,
					date: formatDate(report.date),
					beginningOrNumber: hasNoTransaction
						? EMPTY_CELL
						: report?.beginning_or?.or_number,
					endingOrNumber: hasNoTransaction
						? EMPTY_CELL
						: report?.ending_or?.or_number,

					grandAccumulatedSalesEndingBalance: hasNoTransaction
						? EMPTY_CELL
						: formatInPeso(report.grand_accumulated_sales_ending_balance),
					grandAccumulatedSalesBeginningBalance: hasNoTransaction
						? EMPTY_CELL
						: formatInPeso(report.grand_accumulated_sales_beginning_balance),
					salesIssueWithManual: hasNoTransaction
						? EMPTY_CELL
						: formatInPeso(report.sales_issue_with_manual),
					grossSalesForTheDay: hasNoTransaction
						? EMPTY_CELL
						: formatInPeso(report.gross_sales_for_the_day),

					vatableSales: hasNoTransaction
						? EMPTY_CELL
						: formatInPeso(report.vatable_sales),
					vatAmount: hasNoTransaction
						? EMPTY_CELL
						: formatInPeso(report.vat_amount),
					vatExemptSales: hasNoTransaction
						? EMPTY_CELL
						: formatInPeso(report.vat_exempt_sales),
					zeroRatedSales: hasNoTransaction
						? EMPTY_CELL
						: formatInPeso(report.zero_rated_sales),

					scDiscount: hasNoTransaction
						? EMPTY_CELL
						: formatInPeso(report.sc_discount),
					pwdDiscount: hasNoTransaction
						? EMPTY_CELL
						: formatInPeso(report.pwd_discount),
					naacDiscount: hasNoTransaction
						? EMPTY_CELL
						: formatInPeso(report.naac_discount),
					spDiscount: hasNoTransaction
						? EMPTY_CELL
						: formatInPeso(report.sp_discount),
					othersDiscount: hasNoTransaction
						? EMPTY_CELL
						: formatInPeso(report.others_discount),
					returns: hasNoTransaction ? EMPTY_CELL : formatInPeso(report.returns),
					void: hasNoTransaction ? EMPTY_CELL : formatInPeso(report.void),
					totalDeductions: hasNoTransaction
						? EMPTY_CELL
						: formatInPeso(report.total_deductions),

					vatScDiscount: hasNoTransaction
						? EMPTY_CELL
						: formatInPeso(report.vat_sc_discount),
					vatPwdDiscount: hasNoTransaction
						? EMPTY_CELL
						: formatInPeso(report.vat_pwd_discount),
					vatOthersDiscount: hasNoTransaction
						? EMPTY_CELL
						: formatInPeso(report.vat_others_discount),
					vatOnReturns: hasNoTransaction
						? EMPTY_CELL
						: formatInPeso(report.vat_returns),
					vatOthers: hasNoTransaction
						? EMPTY_CELL
						: formatInPeso(report.vat_others),
					totalVatAdjusted: hasNoTransaction
						? EMPTY_CELL
						: formatInPeso(report.total_vat_adjusted),

					vatPayable: hasNoTransaction
						? EMPTY_CELL
						: formatInPeso(report.vat_payable),
					netSales: hasNoTransaction
						? EMPTY_CELL
						: formatInPeso(report.net_sales),
					salesOverrunOrOverflow: hasNoTransaction
						? EMPTY_CELL
						: formatInPeso(report.sales_overrun_or_overflow),
					totalIncome: hasNoTransaction
						? EMPTY_CELL
						: formatInPeso(report.total_income),
					resetCounter: hasNoTransaction ? EMPTY_CELL : report.reset_counter,
					zCounter: hasNoTransaction ? EMPTY_CELL : report.z_counter || '',
					remarks: hasNoTransaction ? NO_TRANSACTION_REMARK : report.remarks,
				};
			});

			setDataSource(data);
		}
	}, [birReportsData?.list]);

	return (
		<>
			<TableHeader
				buttons={
					<PdfButtons
						key="pdf"
						downloadPdf={downloadPdf}
						isDisabled={isLoadingPdf}
						isLoading={isLoadingPdf}
						previewPdf={previewPdf}
					/>
				}
				title={tabs.BIR_SALES_SUMMARY_REPORT}
				wrapperClassName="pt-2 px-0"
			/>

			<Filter
				isLoading={
					(isFetchingBirReports && !isBirReportsFetched) ||
					isFetchingSiteSettings ||
					isLoadingPdf
				}
			/>

			<RequestErrors
				errors={[
					...convertIntoArray(siteSettingsError),
					...convertIntoArray(birReportsError),
				]}
			/>

			<Table
				columns={columns}
				dataSource={dataSource}
				loading={
					(isFetchingBirReports && !isBirReportsFetched) ||
					isFetchingSiteSettings ||
					isLoadingPdf
				}
				pagination={{
					current: Number(params.page) || DEFAULT_PAGE,
					total: birReportsData?.total,
					pageSize: Number(params.pageSize) || DEFAULT_PAGE_SIZE,
					onChange: (page, newPageSize) => {
						setQueryParams(
							{
								page,
								pageSize: newPageSize,
							},
							{ shouldResetPage: true },
						);
					},
					disabled: !dataSource,
					position: ['bottomCenter'],
					pageSizeOptions,
				}}
				scroll={{ x: 5000 }}
				size="middle"
				bordered
			/>

			<div
				ref={containerRef}
				// eslint-disable-next-line react/no-danger
				dangerouslySetInnerHTML={{ __html: htmlPdf }}
				style={{
					width: 'fit-content',
					position: 'absolute',
					visibility: 'hidden',
				}}
			/>
		</>
	);
};

interface FilterProps {
	isLoading: boolean;
}

const Filter = ({ isLoading }: FilterProps) => (
	<Row className="mb-4" gutter={[16, 16]}>
		<Col lg={12} span={24}>
			<TimeRangeFilter disabled={isLoading} />
		</Col>
	</Row>
);
