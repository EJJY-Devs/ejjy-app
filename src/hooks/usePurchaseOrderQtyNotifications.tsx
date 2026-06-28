import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from 'global';
import { wrapServiceWithCatch } from 'hooks/helper';
import { Query } from 'hooks/inteface';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { PurchaseOrderQtyNotificationsService } from 'services';
import { getLocalApiUrl } from 'utils';

export const usePurchaseOrderQtyNotifications = ({ params, options }: Query) =>
	useQuery<any>(
		[
			'usePurchaseOrderQtyNotifications',
			params?.page,
			params?.pageSize,
			params?.branchId,
			params?.isResolved,
		],
		() =>
			wrapServiceWithCatch(
				PurchaseOrderQtyNotificationsService.list(
					{
						page: params?.page || DEFAULT_PAGE,
						page_size: params?.pageSize || DEFAULT_PAGE_SIZE,
						branch_id: params?.branchId,
						is_resolved: params?.isResolved,
					},
					getLocalApiUrl(),
				),
			),
		{
			initialData: { data: { results: [], count: 0 } },
			initialDataUpdatedAt: 0,
			select: (query) => ({
				notifications: query.data.results,
				total: query.data.count,
			}),
			staleTime: 30000,
			...options,
		},
	);

export const usePurchaseOrderQtyNotificationResolve = () => {
	const queryClient = useQueryClient();

	return useMutation<any, any, any>(
		(id: number) =>
			PurchaseOrderQtyNotificationsService.resolve(id, getLocalApiUrl()),
		{
			onSuccess: () => {
				queryClient.invalidateQueries('usePurchaseOrderQtyNotifications');
			},
		},
	);
};
