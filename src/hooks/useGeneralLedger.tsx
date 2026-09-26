import { DEFAULT_PAGE_SIZE } from 'global';
import { wrapServiceWithCatch } from 'hooks/helper';
import { Query } from 'hooks/inteface';
import { useQuery } from 'react-query';
import { GeneralLedgerService } from 'services';
import { getLocalApiUrl } from 'utils';

const DEFAULT_PAGE = 1;

const useGeneralLedger = ({ params, options }: Query) =>
	useQuery<any>(
		[
			'useGeneralLedger',
			params?.branchId,
			params?.timeRange,
			params?.asOfDate,
			params?.month,
			params?.search,
			params?.page,
			params?.pageSize,
		],
		() =>
			wrapServiceWithCatch(
				GeneralLedgerService.list(
					{
						branch_id: params?.branchId,
						time_range: params?.timeRange,
						as_of_date: params?.asOfDate,
						month: params?.month,
						search: params?.search,
						page: params?.page || DEFAULT_PAGE,
						page_size: params?.pageSize || DEFAULT_PAGE_SIZE,
					},
					getLocalApiUrl(),
				),
			),
		{
			initialData: { data: { results: [], count: 0 } },
			refetchOnMount: 'always',
			select: (query) => ({
				generalLedgerEntries: query.data.results,
				total: query.data.count,
			}),
			...(options || {}),
		},
	);

// Matches the API's max_page_size.
const DETAILS_PAGE_SIZE = 4000;

// T-Accounts pair debit and credit lines client-side, so every line of the
// period is needed: keep fetching pages until the API reports no next page.
// The balances are the same on every page, so they are taken from the first.
const fetchAllGeneralLedgerDetails = async (params) => {
	const fetchPage = (page: number) =>
		GeneralLedgerService.detailList(
			{
				account_code: params?.accountCode,
				branch_id: params?.branchId,
				time_range: params?.timeRange,
				as_of_date: params?.asOfDate,
				month: params?.month,
				page,
				page_size: DETAILS_PAGE_SIZE,
			},
			getLocalApiUrl(),
		);

	const firstResponse = await fetchPage(DEFAULT_PAGE);
	const results = [...firstResponse.data.results];
	let { next } = firstResponse.data;
	let page = DEFAULT_PAGE;

	while (next) {
		page += 1;
		// eslint-disable-next-line no-await-in-loop
		const response = await fetchPage(page);
		results.push(...response.data.results);
		next = response.data.next;
	}

	return { ...firstResponse, data: { ...firstResponse.data, results } };
};

export const useGeneralLedgerDetails = ({ params, options }: Query) =>
	useQuery<any>(
		[
			'useGeneralLedgerDetails',
			params?.accountCode,
			params?.branchId,
			params?.timeRange,
			params?.asOfDate,
			params?.month,
		],
		() => wrapServiceWithCatch(fetchAllGeneralLedgerDetails(params)),
		{
			enabled:
				params?.accountCode !== undefined && params?.accountCode !== null,
			initialData: { data: { results: [], count: 0 } },
			select: (query) => ({
				generalLedgerDetails: query.data.results,
				total: query.data.count,
				startDate: query.data.start_date,
				endDate: query.data.end_date,
				beginningBalance: query.data.beginning_balance,
				endingBalance: query.data.ending_balance,
				totalDebit: query.data.total_debit,
				totalCredit: query.data.total_credit,
			}),
			...(options || {}),
		},
	);

export default useGeneralLedger;
