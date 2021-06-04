/* eslint-disable react-hooks/exhaustive-deps */
import { message } from 'antd';
import { useEffect, useState } from 'react';
import { actions, types } from '../ducks/branch-products';
import { MAX_PAGE_SIZE } from '../global/constants';
import { request } from '../global/types';
import { modifiedCallback, modifiedExtraCallback, onCallback } from '../utils/function';
import {
	generateNewCachedData,
	getDataForCurrentPage,
	indexHasCachedData,
	updateInCachedData,
} from '../utils/pagination';
import { useActionDispatch } from './useActionDispatch';

const LIST_ERROR_MESSAGE = 'An error occurred while fetching products';

const EDIT_SUCCESS_MESSAGE = 'Branch product was edited successfully';
const EDIT_ERROR_MESSAGE = 'An error occurred while editing the branch product';

const EDIT_BALANCE_SUCCESS_MESSAGE = 'Branch product balance was edited successfully';
const EDIT_BALANCE_ERROR_MESSAGE = 'An error occurred while editing the branch product balance';

export const useBranchProducts = ({ pageSize = MAX_PAGE_SIZE } = {}) => {
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

	// ACTIONS

	const getBranchProductsAction = useActionDispatch(actions.getBranchProducts);
	const getBranchProductsByBranchAction = useActionDispatch(actions.getBranchProductsByBranch);
	const editBranchProduct = useActionDispatch(actions.editBranchProduct);
	const editBranchProductBalance = useActionDispatch(actions.editBranchProductBalance);

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

	const requestCallback = ({ status: requestStatus, errors: requestErrors = [] }) => {
		setStatus(requestStatus);
		setErrors(requestErrors);
	};

	const executeRequest = (data, callback, action, type) => {
		setRecentRequest(type);
		action({
			...data,
			callback: onCallback(requestCallback, callback?.onSuccess, callback?.onError),
		});
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
	}, [allData, currentPage]);

	const updateItemInPagination = (item) => {
		setAllData((data) => updateInCachedData({ data, item }));
	};

	// REQUEST METHODS
	const getBranchProducts = (data, shouldReset = false) => {
		if (shouldReset) {
			resetPagination();
		}

		const { page } = data;
		setCurrentPage(page);

		if (
			!indexHasCachedData({
				existingData: allData,
				index: (page - 1) * pageSize,
			}) ||
			shouldReset
		) {
			const callback = {
				onSuccess: ({ data: { results: toBeAddedData, count } }) => {
					setAllData((currentAllData) =>
						generateNewCachedData({
							existingData: currentAllData,
							toBeAddedData,
							index: (page - 1) * pageSize,
						}),
					);

					setPageCount(count);
				},
				onError: () => message.error(LIST_ERROR_MESSAGE),
			};

			executeRequest(
				{ ...data, pageSize },
				callback,
				getBranchProductsAction,
				types.GET_BRANCH_PRODUCTS,
			);
		}
	};
	const getBranchProductsByBranch = (data, shouldReset = false) => {
		if (shouldReset) {
			resetPagination();
		}

		const { page } = data;
		setCurrentPage(page);

		if (
			!indexHasCachedData({
				existingData: allData,
				index: (page - 1) * pageSize,
			}) ||
			shouldReset
		) {
			const callback = {
				onSuccess: ({ data: { results: toBeAddedData, count } }) => {
					setAllData((currentAllData) =>
						generateNewCachedData({
							existingData: currentAllData,
							toBeAddedData,
							index: (page - 1) * pageSize,
						}),
					);

					setPageCount(count);
				},
				onError: () => message.error(LIST_ERROR_MESSAGE),
			};

			executeRequest(
				{ ...data, pageSize },
				callback,
				getBranchProductsByBranchAction,
				types.GET_BRANCH_PRODUCTS_BY_BRANCH,
			);
		}
	};

	const editBranchProductRequest = (branchProduct, extraCallback = null) => {
		setRecentRequest(types.EDIT_BRANCH_PRODUCT);
		editBranchProduct({
			...branchProduct,
			allowable_spoilage: (branchProduct.allowable_spoilage || 0) / 100,
			callback: modifiedExtraCallback(
				modifiedCallback(callback, EDIT_SUCCESS_MESSAGE, EDIT_ERROR_MESSAGE),
				extraCallback,
			),
		});
	};

	const editBranchProductBalanceRequest = (data, extraCallback = null) => {
		setRecentRequest(types.EDIT_BRANCH_PRODUCT);
		editBranchProductBalance({
			...data,
			callback: modifiedExtraCallback(
				modifiedCallback(callback, EDIT_BALANCE_SUCCESS_MESSAGE, EDIT_BALANCE_ERROR_MESSAGE),
				extraCallback,
			),
		});
	};

	const callback = ({ status, errors = [], warnings = [] }) => {
		setStatus(status);
		setErrors(errors);
		setWarnings(warnings);
	};
	
	return {
		branchProducts: currentPageData,
		pageCount,
		currentPage,
		updateItemInPagination,

		getBranchProducts,
		getBranchProductsByBranch,
		editBranchProduct: editBranchProductRequest,
		editBranchProductBalance: editBranchProductBalanceRequest,
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
