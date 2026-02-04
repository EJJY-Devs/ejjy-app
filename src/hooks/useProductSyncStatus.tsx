import { appTypes, DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from 'global';
import { wrapServiceWithCatch } from 'hooks/helper';
import { Query } from 'hooks/inteface';
import { useQuery } from 'react-query';
import { ProductSyncStatusService } from 'services';
import { getAppType, getLocalApiUrl, isStandAlone } from 'utils';

const useProductSyncStatus = ({ params, options }: Query) =>
	useQuery<any>(
		[
			'useProductSyncStatus',
			params?.page,
			params?.pageSize,
			params?.branch_id,
			params?.product_id,
			params?.out_of_sync_only,
		],
		() =>
			wrapServiceWithCatch(
				ProductSyncStatusService.list(
					{
						page: params?.page || DEFAULT_PAGE,
						page_size: params?.pageSize || DEFAULT_PAGE_SIZE,
						branch_id: params?.branch_id,
						product_id: params?.product_id,
						out_of_sync_only: params?.out_of_sync_only,
					},
					getLocalApiUrl(),
				),
			),
		{
			initialData: { data: { results: [], count: 0 } },
			select: (query) => ({
				productSyncStatuses: query.data.results,
				total: query.data.count,
			}),
			enabled:
				getAppType() === appTypes.HEAD_OFFICE &&
				!!getLocalApiUrl() &&
				!isStandAlone(),
			...options,
		},
	);

export default useProductSyncStatus;
