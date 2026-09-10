import { DEFAULT_PAGE_SIZE } from 'global';
import { wrapServiceWithCatch } from 'hooks/helper';
import { Query } from 'hooks/inteface';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { CashDisbursementsService } from 'services';
import { getLocalApiUrl } from 'utils';

const DEFAULT_PAGE = 1;

const useCashDisbursements = ({ params }: Query) =>
	useQuery<any>(
		[
			'useCashDisbursements',
			params?.branchId,
			params?.timeRange,
			params?.page,
			params?.pageSize,
		],
		() =>
			wrapServiceWithCatch(
				CashDisbursementsService.list(
					{
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
				cashDisbursements: query.data.results,
				total: query.data.count,
			}),
		},
	);

export const useCashDisbursementDetailUpsert = () => {
	const queryClient = useQueryClient();

	return useMutation<any, any, any>(
		({
			sourceType,
			sourceId,
			ewtPercentage,
			otherDeductionsAmount,
			otherDeductionsRemarks,
		}: {
			sourceType: 'expense' | 'purchase';
			sourceId: number;
			ewtPercentage: number;
			otherDeductionsAmount: number;
			otherDeductionsRemarks?: string;
		}) =>
			CashDisbursementsService.upsertDetail(
				{
					source_type: sourceType,
					source_id: sourceId,
					ewt_percentage: ewtPercentage,
					other_deductions_amount: otherDeductionsAmount,
					other_deductions_remarks: otherDeductionsRemarks,
				},
				getLocalApiUrl(),
			),
		{
			onSuccess: () => {
				queryClient.invalidateQueries('useCashDisbursements');
			},
		},
	);
};

export default useCashDisbursements;
