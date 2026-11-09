import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from 'global';
import { wrapServiceWithCatch } from 'hooks/helper';
import { Query } from 'hooks/inteface';
import { useQuery } from 'react-query';
import { BranchMachinesService } from 'services';
import { getLocalApiUrl, getReportsApiUrl, isStandAlone } from 'utils';

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
					getReportsApiUrl(),
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
		async () => {
			try {
				return await wrapServiceWithCatch(
					BranchMachinesService.retrieve(id, getReportsApiUrl()),
				);
			} catch (error) {
				// The Branch Machines tab lists machines from the local API, so the
				// machine may not exist in the reports (Google) API. Fall back to local.
				const localApiUrl = getLocalApiUrl();
				if (!localApiUrl || localApiUrl === getReportsApiUrl()) {
					throw error;
				}

				return wrapServiceWithCatch(
					isStandAlone()
						? BranchMachinesService.retrieve(id, localApiUrl)
						: BranchMachinesService.retrieveOffline(id, localApiUrl),
				);
			}
		},
		{
			select: (query) => query.data,
			...options,
		},
	);

export default useBranchMachines;
