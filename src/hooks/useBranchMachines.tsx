import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from 'global';
import { wrapServiceWithCatch } from 'hooks/helper';
import { Query } from 'hooks/inteface';
import { useQuery } from 'react-query';
import { BranchMachinesService } from 'services';
import { getLocalApiUrl } from 'utils';

const useBranchMachines = ({ params, options }: Query = {}) =>
	useQuery<any>(
		[
			'useBranchMachines',
			params?.branchId,
			params?.page,
			params?.pageSize,
			params?.salesTimeRange,
		],
		() => {
			return wrapServiceWithCatch(
				BranchMachinesService.list(
					{
						branch_id: params?.branchId,
						page: params?.page || DEFAULT_PAGE,
						page_size: params?.pageSize || DEFAULT_PAGE_SIZE,
						sales_time_range: params?.salesTimeRange,
					},
					getLocalApiUrl(),
				),
			);
		},
		{
			initialData: { data: { results: [], count: 0 } },
			select: (query) => ({
				branchMachines: query.data.results,
				total: query.data.count,
			}),
			...options,
		},
	);

export const useBranchMachineRetrieve = ({ id, options }: Query) =>
	useQuery<any>(
		['useBranchMachineRetrieve', id],
		() =>
			wrapServiceWithCatch(
				BranchMachinesService.retrieve(id, getLocalApiUrl()),
			),
		{
			select: (query) => query.data,
			...options,
		},
	);

export default useBranchMachines;
