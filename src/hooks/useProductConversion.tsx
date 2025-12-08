import { useMutation, useQueryClient } from 'react-query';
import { ProductConversionsService } from 'services';
import { getLocalApiUrl } from 'utils';

export const useProductConversion = () => {
	const queryClient = useQueryClient();

	return useMutation(
		(data: {
			stock_out_branch_product_id: number;
			stock_out_qty: number;
			stock_in_branch_product_id: number;
			stock_in_qty: number;
			authorizer_id: number;
		}) => ProductConversionsService.create(data, getLocalApiUrl()),
		{
			onSuccess: () => {
				// Invalidate relevant queries to refresh data
				queryClient.invalidateQueries('useBranchProductBalances');
				queryClient.invalidateQueries('useBranchProducts');
				queryClient.invalidateQueries('useBranchProductBalanceTypeUpdateLogs');
			},
		},
	);
};
