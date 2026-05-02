import { wrapServiceWithCatch } from 'hooks/helper';
import { Query } from 'hooks/inteface';
import { useQuery, useQueryClient } from 'react-query';
import { DataService, ProductSyncStatusService } from 'services';
import {
	APP_PRODUCTS_IDS,
	APP_BRANCH_PRODUCT_IDS,
	APP_BRANCH_PRODUCT_BALANCE_UPDATE_LOGS_IDS,
	appTypes,
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
} from 'global';

import { getLocalApiUrl, isStandAlone, getAppType } from 'utils';
import axios from 'axios';

const REFETCH_INTERVAL_MS = 30_000;

export const useInitializeData = ({ params, options }: Query) => {
	const queryClient = useQueryClient();
	return useQuery<any>(
		[
			'useInitializeData',
			params?.branchId,
			params?.branchIds,
			params?.isHeadOffice,
			params?.productIds,
			params?.branchProductIds,
			params?.branchProductBalanceUpdateLogsIds,
			params?.notMainHeadOffice,
			params?.transactionIds,
		],
		async () => {
			const baseURL = getLocalApiUrl();
			let service = null;

			if (params?.branchId) {
				// For BACK_OFFICE: if there are specific IDs to sync, include them; otherwise do bulk init
				service = wrapServiceWithCatch(
					DataService.initialize(
						{
							branch_id: params.branchId,
							is_head_office: params.isHeadOffice,
							...(params.productIds && { product_ids: params.productIds }),
							...(params.branchProductIds && {
								branch_product_ids: params.branchProductIds,
							}),
							...(params.branchProductBalanceUpdateLogsIds && {
								branch_product_balance_update_logs_ids:
									params.branchProductBalanceUpdateLogsIds,
							}),
						},
						baseURL,
					),
				);
			} else if (params?.branchIds) {
				try {
					// eslint-disable-next-line no-restricted-syntax
					for (const branchId of params.branchIds) {
						// eslint-disable-next-line no-await-in-loop
						await DataService.initialize(
							{
								branch_id: branchId,
								is_head_office: params.isHeadOffice,
							},
							baseURL,
						);
					}
				} catch (e) {
					console.error('Initialize Data', e);
				}
			} else if (
				params.productIds ||
				params.branchProductIds ||
				params.branchProductBalanceUpdateLogsIds
			) {
				// Only for HEAD_OFFICE incremental sync without branchId
				await DataService.initialize(
					{
						product_ids: params.productIds,
						branch_product_ids: params.branchProductIds,
						branch_product_balance_update_logs_ids:
							params.branchProductBalanceUpdateLogsIds,
						is_head_office: params.isHeadOffice,
						not_main_head_office: params.notMainHeadOffice,
					},
					baseURL,
				);
			}

			return service;
		},
		{
			refetchIntervalInBackground: true,
			notifyOnChangeProps: ['isLoading', 'isSuccess'],
			onSuccess: () => {
				// Read from localStorage at write-time to avoid stale closure races
				// with useInitializeIds.onSuccess adding IDs concurrently.
				const updateRemainingIds = (
					key: string,
					paramIdsString: string | undefined,
				) => {
					if (!paramIdsString) return;
					const current = localStorage.getItem(key) || '';
					const currentSet = new Set(current.split(',').filter(Boolean));
					paramIdsString
						.split(',')
						.filter(Boolean)
						.forEach((id) => currentSet.delete(id));
					localStorage.setItem(key, Array.from(currentSet).join(','));
				};

				updateRemainingIds(APP_PRODUCTS_IDS, params?.productIds);
				updateRemainingIds(APP_BRANCH_PRODUCT_IDS, params?.branchProductIds);
				updateRemainingIds(
					APP_BRANCH_PRODUCT_BALANCE_UPDATE_LOGS_IDS,
					params?.branchProductBalanceUpdateLogsIds,
				);

				queryClient.invalidateQueries('useProducts');
				queryClient.invalidateQueries('useBranchProducts');
				queryClient.invalidateQueries('useLatestProductDatetime');
				queryClient.invalidateQueries('useLatestBranchProductDatetime');
			},
			...options,
		},
	);
};

export const useInitializeIds = ({ params, options }: Query) =>
	useQuery<any>(
		[
			'useInitializeIds',
			params?.branchId,
			params?.isHeadOffice,
			params?.notMainHeadOffice,
		],
		async () => {
			const baseURL = getLocalApiUrl();

			let response;

			if (params?.branchId) {
				response = await DataService.initializeIds(
					{
						branch_id: params?.branchId,
					},
					baseURL,
				);
			} else if (params?.isHeadOffice) {
				response = await DataService.initializeIds(
					{
						is_head_office: params?.isHeadOffice,
						not_main_head_office: params?.notMainHeadOffice,
					},
					baseURL,
				);
			}

			return response;
		},
		{
			refetchInterval: getAppType() === appTypes.HEAD_OFFICE ? 30_000 : 10_000,
			refetchIntervalInBackground: true,
			notifyOnChangeProps: ['isLoading', 'isSuccess'],
			onSuccess: (data) => {
				const updateStoredIds = (key: string, newIds: any[]) => {
					if (!newIds) return;

					// Fetch current IDs as a string
					const currentStoredIdsString = localStorage.getItem(key);
					const currentStoredIds = currentStoredIdsString
						? currentStoredIdsString.split(',').map((id) => id.trim())
						: [];

					// Combine and deduplicate using a Set
					const combinedIds = new Set([
						...currentStoredIds,
						...newIds.map((id: any) => String(id).trim()), // Ensure all IDs are strings
					]);

					// Convert the Set back into a comma-separated string and store in localStorage
					localStorage.setItem(key, Array.from(combinedIds).join(','));
				};

				// Handle product_ids
				if (data?.data?.product_ids) {
					updateStoredIds(APP_PRODUCTS_IDS, data.data.product_ids);
				}

				// Handle branch_product_ids
				if (data?.data?.branch_product_ids) {
					updateStoredIds(APP_BRANCH_PRODUCT_IDS, data.data.branch_product_ids);
				}

				// Handle branch_product_balance_update_logs_ids
				if (data?.data?.branch_product_balance_update_logs_ids) {
					updateStoredIds(
						APP_BRANCH_PRODUCT_BALANCE_UPDATE_LOGS_IDS,
						data.data.branch_product_balance_update_logs_ids,
					);
				}
			},
			...options,
		},
	);

export const useUploadData = ({ params }: Query) =>
	useQuery(
		['useUploadData', params?.isBackOffice],
		() =>
			wrapServiceWithCatch(
				DataService.upload(
					{ is_back_office: params?.isBackOffice },
					getLocalApiUrl(),
				),
			),
		{
			enabled: !isStandAlone(),
			refetchInterval: REFETCH_INTERVAL_MS,
			refetchIntervalInBackground: true,
			notifyOnChangeProps: [],
		},
	);

export const useTriggerProductSync = ({ params, options }: Query) =>
	useQuery(
		['useTriggerProductSync', params?.branchId],
		async () => {
			const localApiUrl = getLocalApiUrl();
			if (!localApiUrl || !params?.branchId) {
				return null;
			}

			try {
				const response = await axios.post(
					`${localApiUrl}/product-sync-trigger/trigger/`,
					{ branch_id: params.branchId },
				);
				return response.data;
			} catch (error) {
				console.error('Failed to trigger product sync:', error);
				throw error;
			}
		},
		{
			enabled:
				getAppType() === appTypes.BACK_OFFICE &&
				!!params?.branchId &&
				!!getLocalApiUrl() &&
				!isStandAlone(),
			refetchInterval: 60_000,
			refetchIntervalInBackground: true,
			refetchOnWindowFocus: false,
			notifyOnChangeProps: [],
			retry: false,
			...options,
		},
	);

export const useProductSyncStatus = ({ params, options }: Query) =>
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
			enabled: getAppType() === appTypes.HEAD_OFFICE && !!getLocalApiUrl(),
			...options,
		},
	);
