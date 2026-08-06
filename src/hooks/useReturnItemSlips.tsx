import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, IS_APP_LIVE } from 'global';
import { wrapServiceWithCatch } from 'hooks/helper';
import { Query } from 'hooks/inteface';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { ReturnItemSlipsService } from 'services';
import { getLocalApiUrl, getOnlineApiUrl } from 'utils';

// TODO: Once the syncing of RIS, implement the correct base url.
const useReturnItemSlips = ({ params }: Query) =>
	useQuery<any>(
		[
			'useReturnItemSlips',
			params?.page,
			params?.pageSize,
			params?.receiverId,
			params?.senderBranchId,
		],
		() =>
			wrapServiceWithCatch(
				ReturnItemSlipsService.list(
					{
						page: params?.page || DEFAULT_PAGE,
						page_size: params?.pageSize || DEFAULT_PAGE_SIZE,
						receiver_id: params?.receiverId,
						sender_branch_id: params?.senderBranchId,
					},
					getOnlineApiUrl(),
				),
			),
		{
			initialData: { data: { results: [], count: 0 } },
			select: (query) => ({
				returnItemSlips: query.data.results,
				total: query.data.count,
			}),
		},
	);

export const useReturnItemSlipRetrieve = ({ id, options }: Query) =>
	useQuery<any>(
		['useReturnItemSlipRetrieve', id],
		() =>
			wrapServiceWithCatch(
				ReturnItemSlipsService.retrieve(id, getOnlineApiUrl()),
			),
		{
			select: (query) => query.data,
			...options,
		},
	);

export const useReturnItemSlipCreate = () => {
	const queryClient = useQueryClient();

	return useMutation<any, any, any>(
		({ products, senderId }: any) =>
			ReturnItemSlipsService.create(
				{
					is_online: IS_APP_LIVE,
					products,
					sender_id: senderId,
				},
				getOnlineApiUrl(),
			),
		{
			onSuccess: () => {
				queryClient.invalidateQueries('useReturnItemSlips');
			},
		},
	);
};

export const useReturnItemSlipReceive = () => {
	const queryClient = useQueryClient();

	return useMutation<any, any, any>(
		({ id, products }: any) =>
			ReturnItemSlipsService.receive(
				id,
				{
					is_online: IS_APP_LIVE,
					products,
				},
				getLocalApiUrl(),
			),
		{
			onSuccess: () => {
				queryClient.invalidateQueries('useReturnItemSlips');
			},
		},
	);
};

export default useReturnItemSlips;
