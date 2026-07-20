import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from 'global';
import { getLocalApiUrl } from 'utils';
import { Query } from 'hooks/inteface';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { DisbursementVoucherService } from 'services';

const useDisbursementVouchers = ({ params, options }: Query) =>
	useQuery<any>(
		[
			'useDisbursementVouchers',
			params?.page,
			params?.pageSize,
			params?.search,
			params?.branchId,
			params?.timeRange,
			params?.supplierAccountId,
		],
		async () => {
			const baseURL = getLocalApiUrl();

			const response = await DisbursementVoucherService.list(
				{
					page: params?.page || DEFAULT_PAGE,
					page_size: params?.pageSize || DEFAULT_PAGE_SIZE,
					search: params?.search,
					branch_id: params?.branchId,
					time_range: params?.timeRange,
					supplier_account_id: params?.supplierAccountId,
				},
				baseURL,
			);

			return response;
		},
		{
			initialData: { data: { results: [], count: 0 } },
			select: (query) => ({
				disbursementVouchers: query.data.results,
				total: query.data.count,
			}),
			...options,
		},
	);

export const useDisbursementVoucherCreate = () => {
	const queryClient = useQueryClient();

	return useMutation<any, any, any>(
		({
			payee,
			particulars,
			amount,
			paymentMethod,
			remarks,
			authorizerId,
			branchId,
			supplierAccountId,
			purchaseId,
		}: any) =>
			DisbursementVoucherService.create(
				{
					payee,
					particulars,
					amount,
					payment_method: paymentMethod,
					remarks,
					authorizer_id: authorizerId,
					branch_id: branchId,
					supplier_account_id: supplierAccountId,
					purchase_id: purchaseId,
				},
				getLocalApiUrl(),
			),
		{
			onSuccess: () => {
				queryClient.invalidateQueries('useDisbursementVouchers');
				queryClient.invalidateQueries('useAccounts');
			},
		},
	);
};

export const useDisbursementVoucherDelete = () => {
	const queryClient = useQueryClient();

	return useMutation<any, any, any>(
		(id: number) => DisbursementVoucherService.delete(id, getLocalApiUrl()),
		{
			onSuccess: () => {
				queryClient.invalidateQueries('useDisbursementVouchers');
				queryClient.invalidateQueries('useAccounts');
			},
		},
	);
};

export default useDisbursementVouchers;
