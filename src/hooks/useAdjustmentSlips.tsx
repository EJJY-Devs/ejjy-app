import { useQuery, useMutation, useQueryClient } from 'react-query';
import { wrapServiceWithCatch } from 'hooks/helper';
import { Query } from 'hooks/inteface';
import { getLocalApiUrl } from 'utils';
import { AdjustmentSlipsService } from 'services';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;

const useAdjustmentSlips = ({ params }: Query) =>
	useQuery<any>(
		[
			'useAdjustmentSlips',
			params?.branchId,
			params?.page,
			params?.pageSize,
			params?.encodedById,
			params?.timeRange,
		],
		() =>
			wrapServiceWithCatch(
				AdjustmentSlipsService.list(
					{
						branch_id: params?.branchId,
						page: params?.page || DEFAULT_PAGE,
						page_size: params?.page_size || DEFAULT_PAGE_SIZE,
						encoded_by_id: params?.encodedById,
						time_range: params?.timeRange,
					},
					getLocalApiUrl(),
				),
			),
		{
			initialData: { data: { results: [], count: 0 } },
			select: (query) => ({
				adjustmentSlips: query.data.results,
				total: query.data.count,
			}),
		},
	);

export const useAdjustmentSlipCreate = () => {
	const queryClient = useQueryClient();

	return useMutation<any, any, any>(
		({
			products,
			encodedById,
			branchId,
		}: {
			products: {
				product_id: number;
				adjusted_value: string;
				remarks: string;
				error_remarks: string;
			}[];
			encodedById: number;
			branchId: number;
		}) =>
			AdjustmentSlipsService.create(
				{
					products,
					encoded_by_id: encodedById,
					branch_id: branchId,
				},
				getLocalApiUrl(),
			),
		{
			onSuccess: () => {
				queryClient.invalidateQueries('useAdjustmentSlips');
			},
		},
	);
};

export default useAdjustmentSlips;
