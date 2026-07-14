import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from 'global';
import { getLocalApiUrl } from 'utils';
import { Query } from 'hooks/inteface';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { ExpenseVoucherService } from 'services';

const useExpenseVouchers = ({ params, options }: Query) =>
	useQuery<any>(
		[
			'useExpenseVouchers',
			params?.page,
			params?.pageSize,
			params?.search,
			params?.branchId,
			params?.timeRange,
			params?.journalEntryStatus,
			params?.supplierAccountId,
		],
		async () => {
			const baseURL = getLocalApiUrl();

			const response = await ExpenseVoucherService.list(
				{
					page: params?.page || DEFAULT_PAGE,
					page_size: params?.pageSize || DEFAULT_PAGE_SIZE,
					search: params?.search,
					branch_id: params?.branchId,
					time_range: params?.timeRange,
					journal_entry_status: params?.journalEntryStatus ?? 'without',
					supplier_account_id: params?.supplierAccountId,
				},
				baseURL,
			);

			return response;
		},
		{
			initialData: { data: { results: [], count: 0 } },
			select: (query) => ({
				expenseVouchers: query.data.results,
				total: query.data.count,
			}),
			...options,
		},
	);

export const useExpenseVoucherCreate = () => {
	const queryClient = useQueryClient();

	return useMutation<any, any, any>(
		({
			payee,
			particulars,
			amount,
			remarks,
			authorizerId,
			branchId,
			supplierAccountId,
		}: any) =>
			ExpenseVoucherService.create(
				{
					payee,
					particulars,
					amount,
					remarks,
					authorizer_id: authorizerId,
					branch_id: branchId,
					supplier_account_id: supplierAccountId,
				},
				getLocalApiUrl(),
			),
		{
			onSuccess: () => {
				queryClient.invalidateQueries('useExpenseVouchers');
				queryClient.invalidateQueries('useAccounts');
			},
		},
	);
};

export const useExpenseVoucherUpdate = () => {
	const queryClient = useQueryClient();

	return useMutation<any, any, any>(
		({ id, journalEntryId }: { id: number; journalEntryId: number }) =>
			ExpenseVoucherService.update(
				id,
				{ journal_entry_id: journalEntryId },
				getLocalApiUrl(),
			),
		{
			onSuccess: () => {
				queryClient.invalidateQueries('useExpenseVouchers');
			},
		},
	);
};

export const useExpenseVoucherDelete = () => {
	const queryClient = useQueryClient();

	return useMutation<any, any, any>(
		(id: number) => ExpenseVoucherService.delete(id, getLocalApiUrl()),
		{
			onSuccess: () => {
				queryClient.invalidateQueries('useExpenseVouchers');
			},
		},
	);
};

export default useExpenseVouchers;
