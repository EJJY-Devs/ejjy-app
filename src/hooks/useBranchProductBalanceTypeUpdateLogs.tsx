import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from 'global';
import { wrapServiceWithCatch } from 'hooks/helper';
import { Query } from 'hooks/inteface';
import { useQuery } from 'react-query';
import { BranchProductBalanceTypeUpdateLogsService } from 'services';
import { getLocalApiUrl } from 'utils';

export const useBranchProductBalanceTypeUpdateLogs = ({
	params,
	options,
}: Query) =>
	useQuery<any>(
		[
			'useBranchProductBalanceTypeUpdateLogs',
			params?.branchId,
			params?.branchProductId,
			params?.timeRange,
			params?.page,
			params?.pageSize,
		],
		() =>
			wrapServiceWithCatch(
				BranchProductBalanceTypeUpdateLogsService.list(
					{
						branch_id: params?.branchId,
						branch_product_id: params?.branchProductId,
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
				logs: query.data.results,
				total: query.data.count,
			}),
			...options,
		},
	);
