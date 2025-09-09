import { wrapServiceWithCatch } from 'hooks/helper';
import { Query } from 'hooks/inteface';
import { useQuery } from 'react-query';
import { DataService } from 'services';
import {
	APP_PRODUCTS_IDS,
	APP_BRANCH_PRODUCT_IDS,
	APP_BRANCH_PRODUCT_BALANCE_UPDATE_LOGS_IDS,
} from 'global';

import {
	getLocalApiUrl,
	isStandAlone,
	getProductIds,
	getBranchProductIds,
	getBranchProductBalanceUpdateLogsIds,
} from 'utils';

const REFETCH_INTERVAL_MS = 30_000;

export const useInitializeData = ({ params, options }: Query) =>
	useQuery<any>(
		[
			'useInitializeData',
			params?.branchId,
			params?.branchIds,
			params?.isHeadOffice,
			params?.productIds,
			params?.branchProductIds,
			params?.branchProductBalanceUpdateLogsIds,
			params?.notMainHeadOffice,
		],
		async () => {
			const baseURL = getLocalApiUrl();
			let service = null;

			if (params?.branchId) {
				service = wrapServiceWithCatch(
					DataService.initialize(
						{
							branch_id: params.branchId,
							product_ids: params.productIds,
							branch_product_ids: params.branchProductIds,
							branch_product_balance_update_logs_ids:
								params.branchProductBalanceUpdateLogsIds,
							is_head_office: params.isHeadOffice,
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
								not_main_head_office: params.notMainHeadOffice || false,
							},
							baseURL,
						);
					}
				} catch (e) {
					console.error('Initialize Data', e);
				}
			}
			if (
				params?.isHeadOffice &&
				((params.productIds?.length ?? 0) > 0 ||
					(params.branchProductIds?.length ?? 0) > 0 ||
					(params.branchProductBalanceUpdateLogsIds?.length ?? 0) > 0)
			) {
				await DataService.initialize(
					{
						product_ids: params.productIds,
						branch_product_ids: params.branchProductIds,
						branch_product_balance_update_logs_ids:
							params.branchProductBalanceUpdateLogsIds,
						is_head_office: params.isHeadOffice,
					},
					baseURL,
				);
			}

			return service;
		},
		{
			refetchInterval: params?.isHeadOffice ? 60_000 : 10_000,
			refetchIntervalInBackground: true,
			notifyOnChangeProps: ['isLoading', 'isSuccess'],
			onSuccess: () => {
				const updateRemainingIds = (
					key: string,
					initializedIdsString: string | null,
					paramIds: string[] | undefined,
				) => {
					if (!initializedIdsString) return;

					// Convert the comma-separated string to an array
					const initializedIds = initializedIdsString.split(',');

					if (initializedIds.length > 0) {
						// Filter out the IDs that are already initialized (from the params)
						const remainingIds = initializedIds.filter(
							(id) => !paramIds?.includes(id), // Remove matching IDs from local storage
						);

						// Update localStorage: set an empty string if no remaining IDs, otherwise store as a string
						localStorage.setItem(
							key,
							remainingIds.length === 0 ? '' : remainingIds.join(','),
						);
					}
				};

				// Update product IDs
				const initializedProductIdsString = getProductIds(); // Fetch product IDs from local storage
				updateRemainingIds(
					APP_PRODUCTS_IDS,
					initializedProductIdsString,
					params?.productIds,
				);

				// Update branch product IDs
				const initializedBranchProductIdsString = getBranchProductIds(); // Fetch branch product IDs from local storage
				updateRemainingIds(
					APP_BRANCH_PRODUCT_IDS,
					initializedBranchProductIdsString,
					params?.branchProductIds,
				);

				const initializedBranchProductBalanceUpdateLogsIdsString = getBranchProductBalanceUpdateLogsIds(); // Fetch branch product update logs IDs from local storage
				updateRemainingIds(
					APP_BRANCH_PRODUCT_BALANCE_UPDATE_LOGS_IDS,
					initializedBranchProductBalanceUpdateLogsIdsString,
					params?.branchProductBalanceUpdateLogsIds,
				);
			},
			...options,
		},
	);

export const useInitializeIds = ({ params, options }: Query) =>
	useQuery<any>(
		['useInitializeIds', params?.branchId, params?.isHeadOffice],
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
					},
					baseURL,
				);
			}

			return response;
		},
		{
			refetchInterval: REFETCH_INTERVAL_MS,
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
