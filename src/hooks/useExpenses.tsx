import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from 'global';
import { getLocalApiUrl } from 'utils';
import { Query } from 'hooks/inteface';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { ExpensesService } from 'services';

const useExpenses = ({ params }: Query) =>
	useQuery<any>(
		[
			'useExpenses',
			params?.page,
			params?.pageSize,
			params?.search,
			params?.branchId,
			params?.timeRange,
			params?.journalEntryStatus,
		],
		async () => {
			const baseURL = getLocalApiUrl();

			const response = await ExpensesService.list(
				{
					page: params?.page || DEFAULT_PAGE,
					page_size: params?.pageSize || DEFAULT_PAGE_SIZE,
					search: params?.search,
					branch_id: params?.branchId,
					time_range: params?.timeRange,
					journal_entry_status: params?.journalEntryStatus ?? 'without',
				},
				baseURL,
			);

			return response;
		},
		{
			initialData: { data: { results: [], count: 0 } },
			select: (query) => ({
				expenses: query.data.results,
				total: query.data.count,
			}),
		},
	);

export const useExpenseCreate = () => {
	const queryClient = useQueryClient();

	return useMutation<any, any, any>(
		({ payee, particulars, amount, receivedBy, authorizerId, branchId }: any) =>
			ExpensesService.create(
				{
					payee,
					particulars,
					amount,
					received_by: receivedBy,
					authorizer_id: authorizerId,
					branch_id: branchId,
				},
				getLocalApiUrl(),
			),
		{
			onSuccess: () => {
				queryClient.invalidateQueries('useExpenses');
			},
		},
	);
};

export const useExpenseUpdate = () => {
	const queryClient = useQueryClient();

	return useMutation<any, any, any>(
		({ id, journalEntryId }: { id: number; journalEntryId: number }) =>
			ExpensesService.update(
				id,
				{ journal_entry_id: journalEntryId },
				getLocalApiUrl(),
			),
		{
			onSuccess: () => {
				queryClient.invalidateQueries('useExpenses');
			},
		},
	);
};

export const useExpenseDelete = () => {
	const queryClient = useQueryClient();

	return useMutation<any, any, any>(
		(id: number) => ExpensesService.delete(id, getLocalApiUrl()),
		{
			onSuccess: () => {
				queryClient.invalidateQueries('useExpenses');
			},
		},
	);
};

export default useExpenses;
