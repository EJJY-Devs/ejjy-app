import { useMutation, useQuery, useQueryClient } from 'react-query';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, transactionStatuses } from 'global';
import { wrapServiceWithCatch, getBaseUrl } from 'hooks/helper';
import { TransactionsService } from 'services';
import { getReportsApiUrl } from 'utils';
import { Query } from './inteface';

const QUERY_KEY = 'useVoidedTransactions';

const useVoidedTransactions = ({ params, options }: Query) =>
	useQuery<any>(
		[
			QUERY_KEY,
			params?.branchId,
			params?.orNumber,
			params?.page,
			params?.pageSize,
		],
		() =>
			wrapServiceWithCatch(
				TransactionsService.list(
					{
						statuses: transactionStatuses.VOID_CANCELLED,
						branch_id: params?.branchId,
						or_number: params?.orNumber,
						page: params?.page || DEFAULT_PAGE,
						page_size: params?.pageSize || DEFAULT_PAGE_SIZE,
						has_void_adjustment_slip: false,
					},
					getReportsApiUrl(),
				),
			),
		{
			initialData: { data: { results: [], count: 0 } },
			select: (query) => ({
				voidedTransactions: query.data.results,
				total: query.data.count,
			}),
			...options,
		},
	);

export const useVoidedTransactionCreateAdjustmentSlip = () => {
	const queryClient = useQueryClient();

	return useMutation<any, any, any>(
		({
			transactionId,
			encodedById,
		}: {
			transactionId: number;
			encodedById: number;
		}) =>
			TransactionsService.createAdjustmentSlip(
				transactionId,
				{ encoded_by_id: encodedById },
				getBaseUrl(true),
			),
		{
			onSuccess: () => {
				queryClient.invalidateQueries(QUERY_KEY);
				queryClient.invalidateQueries('useVoidedTransactionsCount');
			},
		},
	);
};

export default useVoidedTransactions;
