import { DEFAULT_PAGE_SIZE } from 'global';
import { wrapServiceWithCatch } from 'hooks/helper';
import { Query } from 'hooks/inteface';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { JournalEntriesService } from 'services';
import { getLocalApiUrl } from 'utils';

const DEFAULT_PAGE = 1;

const useJournalEntries = ({ params }: Query) =>
	useQuery<any>(
		[
			'useJournalEntries',
			params?.search,
			params?.branchId,
			params?.timeRange,
			params?.page,
			params?.pageSize,
		],
		() =>
			wrapServiceWithCatch(
				JournalEntriesService.list(
					{
						search: params?.search,
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
				journalEntries: query.data.results,
				total: query.data.count,
			}),
		},
	);

export const useJournalEntryCreate = () => {
	const queryClient = useQueryClient();

	return useMutation<any, any, any>(
		({ branchId, debitAccount, creditAccount, amount, remarks }: any) =>
			JournalEntriesService.create(
				{
					branch_id: branchId,
					debit_account: debitAccount,
					credit_account: creditAccount,
					amount,
					remarks,
				},
				getLocalApiUrl(),
			),
		{
			onSuccess: () => {
				queryClient.invalidateQueries('useJournalEntries');
				queryClient.invalidateQueries('useTrialBalance');
				queryClient.invalidateQueries('useTrialBalanceDetails');
				queryClient.invalidateQueries('useStatementOfFinancialPerformance');
				queryClient.invalidateQueries('useGeneralLedger');
				queryClient.invalidateQueries('useGeneralLedgerDetails');
			},
		},
	);
};

export default useJournalEntries;
