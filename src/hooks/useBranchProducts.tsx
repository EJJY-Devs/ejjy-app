import {
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	request,
	serviceTypes,
	timeRangeTypes,
} from 'global';
import { getBaseUrl, wrapServiceWithCatch } from 'hooks/helper';
import { Query } from 'hooks/inteface';
import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { BranchProductsService } from 'services';
import {
	getLocalApiUrl,
	isStandAlone,
	modifiedCallback,
	modifiedExtraCallback,
	onCallback,
} from 'utils';
import { actions, types } from '../ducks/branch-products';
import {
	executePaginatedRequest,
	getDataForCurrentPage,
	updateInCachedData,
} from '../utils/pagination';
import { useActionDispatch } from './useActionDispatch';

const LIST_ERROR_MESSAGE = 'An error occurred while fetching products';

const EDIT_SUCCESS_MESSAGE = 'Branch product was edited successfully';
const EDIT_ERROR_MESSAGE = 'An error occurred while editing the branch product';

const EDIT_BALANCE_SUCCESS_MESSAGE =
	'Branch product balance was edited successfully';
const EDIT_BALANCE_ERROR_MESSAGE =
	'An error occurred while editing the branch product balance';

export const useBranchProducts = () => {
	// STATES
	const [status, setStatus] = useState<any>(request.NONE);
	const [errors, setErrors] = useState<any>([]);
	const [recentRequest, setRecentRequest] = useState<any>();
	const [warnings, setWarnings] = useState<any>([]);

	// PAGINATION
	const [allData, setAllData] = useState([]);
	const [pageCount, setPageCount] = useState(0);
	const [currentPage, setCurrentPage] = useState(1);
	const [currentPageData, setCurrentPageData] = useState([]);
	const [pageSize, setPageSize] = useState(10);

	// ACTIONS
	const getBranchProductsAction = useActionDispatch(actions.getBranchProducts);
	const getBranchProductAction = useActionDispatch(actions.getBranchProduct);
	const editBranchProductAction = useActionDispatch(actions.editBranchProduct);
	const editBranchProductBalanceAction = useActionDispatch(
		actions.editBranchProductBalance,
	);
	const editBranchProductPriceCostAction = useActionDispatch(
		actions.editBranchProductPriceCost,
	);

	// GENERAL METHODS
	const resetError = () => setErrors([]);

	const resetWarning = () => setWarnings([]);

	const resetStatus = () => setStatus(request.NONE);

	const reset = () => {
		resetError();
		resetStatus();
		resetWarning();
	};

	const resetPagination = () => {
		setAllData([]);
		setPageCount(0);
		setCurrentPage(1);
		setCurrentPageData([]);
	};

	const resetAll = () => {
		reset();
		resetPagination();
	};

	const executeRequest = (data, requestCallback, action, type) => {
		setRecentRequest(type);
		action({
			...data,
			callback: onCallback(
				callback,
				requestCallback?.onSuccess,
				requestCallback?.onError,
			),
		});
	};

	const callback = ({
		status: callbackStatus,
		errors: callbackErrors = [],
		warnings: callbackWarnings = [],
	}) => {
		setStatus(callbackStatus);
		setErrors(callbackErrors);
		setWarnings(callbackWarnings);
	};

	// PAGINATION METHODS
	useEffect(() => {
		setCurrentPageData(
			getDataForCurrentPage({
				data: allData,
				currentPage,
				pageSize,
			}),
		);
	}, [allData, currentPage, pageSize]);

	const updateItemInPagination = (item) => {
		setAllData((data) => updateInCachedData({ data, item }));
	};

	// REQUEST METHODS
	const getBranchProducts = (data, shouldReset = false) => {
		executePaginatedRequest(data, shouldReset, {
			requestAction: getBranchProductsAction,
			requestType: types.GET_BRANCH_PRODUCTS,
			errorMessage: LIST_ERROR_MESSAGE,
			allData,
			pageSize,
			executeRequest,
			setAllData,
			setPageCount,
			setCurrentPage,
			setPageSize,
		});
	};

	const getBranchProduct = (data, extraCallback = null) => {
		getBranchProductAction({
			...data,
			callback: modifiedExtraCallback(callback, extraCallback),
		});
	};

	const editBranchProduct = (branchProduct, extraCallback = null) => {
		setRecentRequest(types.EDIT_BRANCH_PRODUCT);
		editBranchProductAction({
			...branchProduct,
			callback: modifiedExtraCallback(
				modifiedCallback(callback, EDIT_SUCCESS_MESSAGE, EDIT_ERROR_MESSAGE),
				extraCallback,
			),
		});
	};

	const editBranchProductBalance = (data, extraCallback = null) => {
		setRecentRequest(types.EDIT_BRANCH_PRODUCT);
		editBranchProductBalanceAction({
			...data,
			callback: modifiedExtraCallback(
				modifiedCallback(
					callback,
					EDIT_BALANCE_SUCCESS_MESSAGE,
					EDIT_BALANCE_ERROR_MESSAGE,
				),
				extraCallback,
			),
		});
	};

	const editBranchProductPriceCost = (data, extraCallback = null) => {
		setRecentRequest(types.EDIT_BRANCH_PRODUCT);
		editBranchProductPriceCostAction({
			...data,
			callback: modifiedExtraCallback(callback, extraCallback),
		});
	};

	return {
		branchProducts: currentPageData,
		pageCount,
		currentPage,
		pageSize,
		updateItemInPagination,
		getBranchProducts,
		getBranchProduct,
		editBranchProduct,
		editBranchProductBalance,
		editBranchProductPriceCost,
		status,
		errors,
		warnings,
		recentRequest,
		reset,
		resetStatus,
		resetError,
		resetAll,
	};
};

const useBranchProductsNew = ({ params, options }: Query) =>
	useQuery<any>(
		[
			'useBranchProducts',
			params?.ids,
			params?.branchId,
			params?.hasBoBalance,
			params?.hasNegativeBalance,
			params?.identifier,
			params?.isSoldInBranch,
			params?.ordering,
			params?.page,
			params?.pageSize,
			params?.productCategory,
			params?.productIds,
			params?.productStatus,
			params?.search,
		],
		() => {
			return wrapServiceWithCatch(
				BranchProductsService.list(
					{
						branch_id: params?.branchId,
						has_bo_balance: params?.hasBoBalance,
						has_negative_balance: params?.hasNegativeBalance,
						identifier: params?.identifier,
						ids: params?.ids,
						is_sold_in_branch: params?.isSoldInBranch,
						ordering: params?.ordering,
						page_size: params?.pageSize || DEFAULT_PAGE_SIZE,
						page: params?.page || DEFAULT_PAGE,
						product_category: params?.productCategory,
						product_ids: params?.productIds,
						product_status: params?.productStatus,
						search: params?.search,
					},
					getLocalApiUrl(),
				),
			);
		},
		{
			initialData: { data: { results: [], count: 0 } },
			select: (query) => ({
				branchProducts: query.data.results,
				total: query.data.count,
			}),
			...options,
		},
	);

export const useBranchProductsOffline = ({ params, options }: Query) =>
	useQuery<any>(
		[
			'useBranchProductsOffline',
			params?.ids,
			params?.branchId,
			params?.hasBoBalance,
			params?.hasNegativeBalance,
			params?.identifier,
			params?.isSoldInBranch,
			params?.ordering,
			params?.page,
			params?.pageSize,
			params?.productCategory,
			params?.productIds,
			params?.productStatus,
			params?.search,
		],
		() =>
			wrapServiceWithCatch(
				BranchProductsService.listOffline(
					{
						branch_id: params?.branchId,
						has_bo_balance: params?.hasBoBalance,
						has_negative_balance: params?.hasNegativeBalance,
						identifier: params?.identifier,
						ids: params?.ids,
						is_sold_in_branch: params?.isSoldInBranch,
						ordering: params?.ordering,
						page_size: params?.pageSize || DEFAULT_PAGE_SIZE,
						page: params?.page || DEFAULT_PAGE,
						product_category: params?.productCategory,
						product_ids: params?.productIds,
						product_status: params?.productStatus,
						search: params?.search,
					},
					getLocalApiUrl(),
				),
			),
		options,
	);

export const useBranchProductsWithAnalytics = ({ params, options }: Query) =>
	useQuery<any>(
		[
			'useBranchProducts',
			params?.branchId,
			params?.hasBoBalance,
			params?.ids,
			params?.isSoldInBranch,
			params?.ordering,
			params?.page,
			params?.pageSize,
			params?.productCategory,
			params?.productIds,
			params?.productStatus,
			params?.timeRange,
		],
		() =>
			wrapServiceWithCatch(
				BranchProductsService.listWithAnalytics(
					{
						branch_id: params?.branchId,
						has_bo_balance: params?.hasBoBalance,
						is_sold_in_branch: params?.isSoldInBranch,
						ordering: params?.ordering,
						page_size: params?.pageSize || DEFAULT_PAGE_SIZE,
						page: params?.page || DEFAULT_PAGE,
						product_category: params?.productCategory,
						product_ids: params?.productIds,
						product_status: params?.productStatus,
						time_range: params?.timeRange || timeRangeTypes.DAILY,
						ids: params?.ids,
					},
					getLocalApiUrl(),
				),
			),
		{
			initialData: { data: { results: [], count: 0 } },
			select: (query) => ({
				branchProducts: query.data.results,
				total: query.data.count,
			}),
			...options,
		},
	);

export const useBranchProductRetrieve = ({ id, params, options }: Query = {}) =>
	useQuery<any>(
		['useBranchProductRetrieve', id, params?.branchId],
		() =>
			wrapServiceWithCatch(
				BranchProductsService.list(
					{ branch_id: params?.branchId, product_ids: id },
					getLocalApiUrl(),
				),
			),
		{
			initialData: { data: { results: [], count: 0 } },
			select: (query) => query.data.results?.[0],
			...options,
		},
	);

export const useBranchProductEdit = () => {
	const queryClient = useQueryClient();

	return useMutation<any, any, any>(
		({
			id,
			allowableSpoilage,
			assignedPersonnelId,
			costPerBulk,
			costPerPiece,
			creditPricePerBulk,
			creditPricePerPiece,
			currentBalance,
			isDailyChecked,
			isRandomlyChecked,
			isSoldInBranch,
			markdownPricePerBulk1,
			markdownPricePerBulk2,
			markdownPricePerPiece1,
			markdownPricePerPiece2,
			maxBalance,
			pricePerBulk,
			pricePerPiece,
			reorderPoint,
			wholeSalePrice,
			specialPrice,
		}: any) =>
			BranchProductsService.edit(
				id,
				{
					allowable_spoilage: allowableSpoilage,
					assigned_personnel_id: assignedPersonnelId,
					cost_per_bulk: costPerBulk,
					cost_per_piece: costPerPiece,
					credit_price_per_bulk: creditPricePerBulk,
					credit_price: creditPricePerPiece,
					current_balance: currentBalance,
					is_daily_checked: isDailyChecked,
					is_randomly_checked: isRandomlyChecked,
					is_sold_in_branch: isSoldInBranch,
					markdown_price_per_bulk1: markdownPricePerBulk1,
					markdown_price_per_bulk2: markdownPricePerBulk2,
					markdown_price_per_piece1: markdownPricePerPiece1,
					markdown_price_per_piece2: markdownPricePerPiece2,
					max_balance: maxBalance,
					price_per_bulk: pricePerBulk,
					price_per_piece: pricePerPiece,
					reorder_point: reorderPoint,
					wholesale_price: wholeSalePrice,
					special_price: specialPrice,
				},
				getLocalApiUrl(),
			),
		{
			onSuccess: () => {
				queryClient.invalidateQueries('useBranchProducts');
				queryClient.invalidateQueries('useBranchProductRetrieve');
			},
		},
	);
};

export const useBranchProductEditPriceCost = () => {
	const queryClient = useQueryClient();

	return useMutation<any, any, any>(
		({ actingUserId, productId, data, serverUrl }: any) =>
			BranchProductsService.editPriceCost(
				{
					acting_user_id: actingUserId,
					product_id: productId,
					data:
						data?.map((d) => ({
							branch_ids: d?.branchIds || undefined,
							cost_per_piece: d?.costPerPiece || undefined,
							cost_per_bulk: d?.costPerBulk || undefined,
							price_per_piece: d?.pricePerPiece || undefined,
							price_per_bulk: d?.pricePerBulk || undefined,
							markdown_price_per_piece1: d?.markdownPricePerPiece1 || undefined,
							markdown_price_per_bulk1: d?.markdownPricePerBulk1 || undefined,
							markdown_price_per_piece2: d?.markdownPricePerPiece2 || undefined,
							markdown_price_per_bulk2: d?.markdownPricePerBulk2 || undefined,
							credit_price: d?.creditPrice || undefined,
							credit_price_per_bulk: d?.creditPricePerBulk || undefined,
							government_credit_price_per_piece:
								d?.governmentCreditPricePerPiece || undefined,
							government_credit_price_per_bulk:
								d?.governmentCreditPricePerBulk || undefined,

							is_daily_checked: d?.isDailyChecked || undefined,
							is_randomly_checked: d?.isRandomlyChecked || undefined,
							is_sold_in_branch: d?.isSoldInBranch || undefined,
							reorder_point: d?.reorderPoint || undefined,
							max_balance: d?.maxBalance || undefined,
							special_price: d?.specialPrice || undefined,
							wholesale_price: d?.wholeSalePrice || undefined,
						})) || undefined,
				},
				serverUrl || getBaseUrl(),
			),
		{
			onSuccess: () => {
				queryClient.invalidateQueries('useBranchProducts');
				queryClient.invalidateQueries('useBranchProductRetrieve');
			},
		},
	);
};

export default useBranchProductsNew;
