import { DEFAULT_PAGE_SIZE } from 'global';
import { wrapServiceWithCatch } from 'hooks/helper';
import { Query } from 'hooks/inteface';
import { useQuery } from 'react-query';
import { CashReceiptsService } from 'services';
import { getLocalApiUrl } from 'utils';

const DEFAULT_PAGE = 1;

const useCashReceipts = ({ params }: Query) =>
	useQuery<any>(
		[
			'useCashReceipts',
			params?.branchId,
			params?.branchMachineId,
			params?.timeRange,
			params?.page,
			params?.pageSize,
		],
		() =>
			wrapServiceWithCatch(
				CashReceiptsService.list(
					{
						branch_id: params?.branchId,
						branch_machine_id: params?.branchMachineId,
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
				cashReceipts: query.data.results,
				total: query.data.count,
			}),
		},
	);

export default useCashReceipts;
