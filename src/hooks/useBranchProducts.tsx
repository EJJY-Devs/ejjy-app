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
	const getBranchProductsByBranchAction = useActionDispatch(actions.getBranchProductsByBranch);
	const editBranchProduct = useActionDispatch(actions.editBranchProduct);

	// GENERAL METHODS
	const resetError = () => setErrors([]);

	const resetStatus = () => setStatus(request.NONE);

	const reset = () => {
		resetError();
		resetStatus();
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
	const getBranchProductsByBranch = (data) => {
		const { page } = data;
		setCurrentPage(page);

		if (
			!indexHasCachedData({
				existingData: allData,
				index: (page - 1) * pageSize,
			})
		) {
			const callback = {
				onSuccess: ({ data: { results: toBeAddedData, count } }) => {
					setAllData(
						generateNewCachedData({
							existingData: allData,
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

		getBranchProductsByBranch,
		editBranchProduct: editBranchProductRequest,
		status,
		errors,
		warnings,
		recentRequest,
		reset,
		resetStatus,
		resetError,
	};
};
