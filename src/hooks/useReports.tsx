import dayjs from 'dayjs';
import {
	createSalesInvoiceTxt,
	createXReadTxt,
	createZReadTxt,
} from 'ejjy-global';
import { DEFAULT_PAGE, MAX_PAGE_SIZE } from 'global';
import { wrapServiceWithCatch } from 'hooks/helper';
import { useMutation, useQuery } from 'react-query';
import {
	ReportsService,
	TransactionsService,
	XReadReportsService,
	ZReadReportsService,
} from 'services';
import { getLocalApiUrl, getLocalBranchId } from 'utils';

export const useBulkExport = () =>
	useMutation<any, any, any>(async ({ siteSettings, timeRange, user }: any) => {
		const localApiUrl = getLocalApiUrl();

		const params = {
			page_size: MAX_PAGE_SIZE,
			page: DEFAULT_PAGE,
			time_range: timeRange,
		};

		const [transactions, xreadReports, zreadReports] = await Promise.all<any>([
			TransactionsService.list(params, localApiUrl),
			XReadReportsService.list(
				{
					...params,
					is_with_daily_sales_data: false,
				},
				localApiUrl,
			),
			ZReadReportsService.list(params, localApiUrl),
		]);

		const requests = [];
		if (transactions.data.results.length > 0) {
			requests.push(
				ReportsService.bulkExportReports(
					{
						data: transactions.data.results.map((transaction) => ({
							folder_name: `invoices/${
								transaction?.teller?.employee_id || 'NO_CASHIER'
							}`,
							file_name: `Sales_Invoice_${transaction.invoice.or_number}.txt`,
							contents: createSalesInvoiceTxt(
								transaction,
								siteSettings,
								true,
								true,
							),
						})),
					},
					localApiUrl,
				),
			);
		}

		if (xreadReports.data.results.length > 0) {
			requests.push(
				ReportsService.bulkExportReports(
					{
						data: xreadReports.data.results.map((report) => ({
							folder_name: 'reports/xread',
							file_name: `XReadReport_${dayjs(
								report.generation_datetime,
							).format('MMDDYY')}_${report.id}.txt`,
							contents: createXReadTxt(report, siteSettings, user, true),
						})),
					},
					localApiUrl,
				),
			);
		}

		if (zreadReports.data.results.length > 0) {
			requests.push(
				ReportsService.bulkExportReports(
					{
						data: zreadReports.data.results.map((report) => ({
							folder_name: 'reports/zread',
							file_name: `ZReadReport_${dayjs(
								report.generation_datetime,
							).format('MMDDYY')}_${report.id}.txt`,
							contents: createZReadTxt(report, siteSettings, user, true),
						})),
					},
					localApiUrl,
				),
			);
		}

		return Promise.all(requests);
	});

export const useGenerateReports = () => {
	const REFETCH_INTERVAL_MS = 30_000;
	const branchId = getLocalBranchId();

	return useQuery(
		['useGenerateReports', branchId],
		() =>
			wrapServiceWithCatch(
				ReportsService.generate(
					{
						branch_id: branchId ? Number(branchId) : undefined,
					},
					getLocalApiUrl(),
				),
			),
		{
			refetchInterval: REFETCH_INTERVAL_MS,
			refetchIntervalInBackground: true,
			notifyOnChangeProps: [],
		},
	);
};
