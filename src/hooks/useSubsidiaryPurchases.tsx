import { DEFAULT_PAGE_SIZE } from 'global';
import { wrapServiceWithCatch } from 'hooks/helper';
import { Query } from 'hooks/inteface';
import { useQuery } from 'react-query';
import { SubsidiaryPurchasesService } from 'services';
import { getLocalApiUrl } from 'utils';

const DEFAULT_PAGE = 1;

const useSubsidiaryPurchases = ({ params }: Query) =>
	useQuery<any>(
		[
			'useSubsidiaryPurchases',
			params?.branchId,
			params?.timeRange,
			params?.page,
			params?.pageSize,
		],
		() =>
			wrapServiceWithCatch(
				SubsidiaryPurchasesService.list(
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
				subsidiaryPurchases: query.data.results,
				total: query.data.count,
			}),
		},
	);

export default useSubsidiaryPurchases;
