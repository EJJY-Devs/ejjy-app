import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from 'global';
import { wrapServiceWithCatch } from 'hooks/helper';
import { Query } from 'hooks/inteface';
import { useMutation, useQuery } from 'react-query';
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
			params?.ordering,
			params?.page,
			params?.pageSize,
		],
		() => {
			// Ensure branchId is properly formatted - either 'all', a valid number, or undefined
			let branchId = params?.branchId;
			const isAllBranches = branchId === 'all';

			if (branchId !== undefined && branchId !== null && branchId !== '') {
				// If it's 'all', keep it as string
				if (branchId === 'all') {
					branchId = 'all';
				} else {
					// Otherwise convert to number, but only if it's valid
					const numValue = Number(branchId);
					branchId = !Number.isNaN(numValue) ? numValue : undefined;
				}
			} else {
				branchId = undefined;
			}

			const requestParams = {
				search: params?.search,
				branch_id: branchId,
				branch_product_id: params?.branchProductId,
				product_id: params?.productId,
				product_category: params?.productCategory,
				ordering: params?.ordering,
				page: params?.page || DEFAULT_PAGE,
				page_size: params?.pageSize || DEFAULT_PAGE_SIZE,
			};

			// Use aggregated endpoint when fetching all branches
			const serviceCall = isAllBranches
				? BranchProductBalancesService.aggregated(
						requestParams,
						getLocalApiUrl(),
				  )
				: BranchProductBalancesService.list(requestParams, getLocalApiUrl());

			return wrapServiceWithCatch(serviceCall);
		},
		{
			initialData: { data: { results: [], count: 0 } },
			select: (query) => ({
				branchProductBalances: query.data.results,
				total: query.data.count,
			}),
			...options,
		},
	);

export const useBranchProductBalanceCreate = () =>
	useMutation<any, any, any>((data) =>
		BranchProductBalancesService.create(data, getLocalApiUrl()),
	);
