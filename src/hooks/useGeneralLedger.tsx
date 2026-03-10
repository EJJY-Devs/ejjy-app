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

export const useGeneralLedgerDetails = ({ params, options }: Query) =>
	useQuery<any>(
		[
			'useGeneralLedgerDetails',
			params?.accountCode,
			params?.branchId,
			params?.timeRange,
			params?.asOfDate,
			params?.month,
			params?.page,
			params?.pageSize,
		],
		() =>
			wrapServiceWithCatch(
				GeneralLedgerService.detailList(
					{
						account_code: params?.accountCode,
						branch_id: params?.branchId,
						time_range: params?.timeRange,
						as_of_date: params?.asOfDate,
						month: params?.month,
						page: params?.page || DEFAULT_PAGE,
						page_size: params?.pageSize || DEFAULT_PAGE_SIZE,
					},
					getLocalApiUrl(),
				),
			),
		{
			enabled:
				params?.accountCode !== undefined && params?.accountCode !== null,
			initialData: { data: { results: [], count: 0 } },
			select: (query) => ({
				generalLedgerDetails: query.data.results,
				total: query.data.count,
			}),
			...(options || {}),
		},
	);

export default useGeneralLedger;
