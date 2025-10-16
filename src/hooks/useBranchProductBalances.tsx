import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from 'global';
import { wrapServiceWithCatch } from 'hooks/helper';
import { Query } from 'hooks/inteface';
import { useQuery } from 'react-query';
import { BranchProductBalancesService } from 'services';
import { getLocalApiUrl } from 'utils';

export const useBranchProductBalances = ({ params, options }: Query) =>
	useQuery<any>(
		[
			'useBranchProductBalances',
			params?.search,
			params?.branchId,
			params?.branchProductId,
			params?.productId,
			params?.productCategory,
			params?.page,
			params?.pageSize,
		],
		() =>
			wrapServiceWithCatch(
				BranchProductBalancesService.list(
					{
						search: params?.search,
						branch_id: params?.branchId,
						branch_product_id: params?.branchProductId,
						product_id: params?.productId,
						product_category: params?.productCategory,
						page: params?.page || DEFAULT_PAGE,
						page_size: params?.pageSize || DEFAULT_PAGE_SIZE,
					},
					getLocalApiUrl(),
				),
			),
		{
			initialData: { data: { results: [], count: 0 } },
			select: (query) => ({
				branchProductBalances: query.data.results,
				total: query.data.count,
			}),
			...options,
		},
	);
