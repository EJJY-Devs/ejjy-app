import { DEFAULT_PAGE_SIZE } from 'global';
import { wrapServiceWithCatch } from 'hooks/helper';
import { Query } from 'hooks/inteface';
import { useQuery } from 'react-query';
import { TrialBalanceService } from 'services';
import { getLocalApiUrl } from 'utils';

const DEFAULT_PAGE = 1;

const useTrialBalance = ({ params, options }: Query) =>
	useQuery<any>(
		[
			'useTrialBalance',
			params?.branchId,
			params?.timeRange,
			params?.page,
			params?.pageSize,
		],
		() =>
			wrapServiceWithCatch(
				TrialBalanceService.list(
					{
						branch_id: params?.branchId,
						time_range: params?.timeRange,
						page: params?.page || DEFAULT_PAGE,
						page_size: params?.pageSize || DEFAULT_PAGE_SIZE,
					},
					getLocalApiUrl(),
				),
			),
		{
			initialData: { data: { results: [], count: 0 } },
			select: (query) => ({
				trialBalanceEntries: query.data.results,
				total: query.data.count,
			}),
			...(options || {}),
		},
	);

export const useTrialBalanceDetails = ({ params, options }: Query) =>
	useQuery<any>(
		['useTrialBalanceDetails', params?.referenceNumber],
		() =>
			wrapServiceWithCatch(
				TrialBalanceService.detail(
					{
						reference_number: params?.referenceNumber,
					},
					getLocalApiUrl(),
				),
			),
		{
			enabled: !!params?.referenceNumber,
			initialData: { data: null },
			select: (query) => query.data,
			...(options || {}),
		},
	);

export default useTrialBalance;
