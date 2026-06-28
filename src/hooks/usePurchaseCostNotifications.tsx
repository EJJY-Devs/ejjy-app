import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from 'global';
import { wrapServiceWithCatch } from 'hooks/helper';
import { Query } from 'hooks/inteface';
import { useMutation, useQuery } from 'react-query';
import { PurchaseCostNotificationsService } from 'services';
import { getLocalApiUrl } from 'utils';

export const usePurchaseCostNotifications = ({ params, options }: Query) =>
	useQuery<any>(
		[
			'usePurchaseCostNotifications',
			params?.page,
			params?.pageSize,
			params?.branchId,
			params?.isResolved,
		],
		() =>
			wrapServiceWithCatch(
				PurchaseCostNotificationsService.list(
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

export const usePurchaseCostNotificationResolve = () =>
	useMutation<any, any, any>((id: number) =>
		PurchaseCostNotificationsService.resolve(id, getLocalApiUrl()),
	);
