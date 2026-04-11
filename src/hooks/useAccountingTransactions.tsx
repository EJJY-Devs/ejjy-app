import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from 'global';
import { getBaseUrl, wrapServiceWithCatch } from 'hooks/helper';
import { Query } from 'hooks/inteface';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { AccountingTransactionsService } from 'services';
import { getLocalApiUrl } from 'utils';

const useAccountingTransactions = ({ params }: Query) =>
	useQuery<any>(
		[
			'useAccountingTransactions',
			params?.page,
			params?.pageSize,
			params?.search,
		],
		async () => {
			const baseURL = getLocalApiUrl();

			return wrapServiceWithCatch(
				AccountingTransactionsService.list(
					{
						page: params?.page || DEFAULT_PAGE,
						page_size: params?.pageSize || DEFAULT_PAGE_SIZE,
						search: params?.search,
					},
					baseURL,
				),
			);
		},
		{
			initialData: { data: { results: [], count: 0 } },
			select: (query) => ({
				accountingTransactions: query.data.results,
				total: query.data.count,
			}),
		},
	);

export const useAccountingTransactionCreate = () => {
	const queryClient = useQueryClient();

	return useMutation<any, any, any>(
		({ name, information, entries }: any) =>
			AccountingTransactionsService.create(
				{
					name,
					information,
					entries: entries.map((e: any) => ({
						debit_account: e.debitAccount || '',
						credit_account: e.creditAccount || '',
					})),
				},
				getBaseUrl(),
			),
		{
			onSuccess: () => {
				queryClient.invalidateQueries('useAccountingTransactions');
			},
		},
	);
};

export const useAccountingTransactionDelete = () => {
	const queryClient = useQueryClient();

	return useMutation<any, any, any>(
		(id: number) => AccountingTransactionsService.delete(id, getBaseUrl()),
		{
			onSuccess: () => {
				queryClient.invalidateQueries('useAccountingTransactions');
			},
		},
	);
};

export default useAccountingTransactions;
