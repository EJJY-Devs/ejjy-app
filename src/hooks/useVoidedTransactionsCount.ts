import { MAX_PAGE_SIZE, transactionStatuses } from 'global';
import { wrapServiceWithCatch } from 'hooks/helper';
import { useQuery } from 'react-query';
import { TransactionsService } from 'services';
import { getReportsApiUrl } from 'utils';

const useVoidedTransactionsCount = (branchId?: number) =>
	useQuery<any>(
		['useVoidedTransactionsCount', branchId],
		() =>
			wrapServiceWithCatch(
				TransactionsService.list(
					{
						statuses: transactionStatuses.VOID_CANCELLED,
						branch_id: branchId,
						page: 1,
						page_size: MAX_PAGE_SIZE,
					},
					getReportsApiUrl(),
				),
			),
		{
			initialData: { data: { results: [], count: 0 } },
			select: (query) =>
				(query.data.results as any[]).filter(
					(t: any) => !t.void_adjustment_slip,
				).length,
			notifyOnChangeProps: ['data'],
		},
	);

export default useVoidedTransactionsCount;
