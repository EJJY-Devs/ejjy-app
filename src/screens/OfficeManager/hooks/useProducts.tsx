/* eslint-disable react-hooks/exhaustive-deps */
import { message } from 'antd';
import { useEffect, useState } from 'react';
import { actions, types } from '../../../ducks/OfficeManager/products';
import { MAX_PAGE_SIZE } from '../../../global/constants';
import { request } from '../../../global/types';
import { useActionDispatch } from '../../../hooks/useActionDispatch';
import { modifiedCallback, modifiedExtraCallback, onCallback } from '../../../utils/function';
import {
	addInCachedData,
	generateNewCachedData,
	getDataForCurrentPage,
	indexHasCachedData,
	removeInCachedData,
	updateInCachedData,
} from '../../../utils/pagination';

const LIST_ERROR_MESSAGE = 'An error occurred while fetching products';

const CREATE_SUCCESS_MESSAGE = 'Product was created successfully';
const CREATE_ERROR_MESSAGE = 'An error occurred while creating the product';

const EDIT_SUCCESS_MESSAGE = 'Product was edited successfully';
const EDIT_ERROR_MESSAGE = 'An error occurred while editing the product';

const REMOVE_SUCCESS_MESSAGE = 'Product was removed successfully';
const REMOVE_ERROR_MESSAGE = 'An error occurred while removing the product';

export const useProducts = ({ pageSize = MAX_PAGE_SIZE } = {}) => {
	// STATES
	const [status, setStatus] = useState<any>(request.NONE);
	const [errors, setErrors] = useState<any>([]);
	const [recentRequest, setRecentRequest] = useState<any>();

	// PAGINATION
	const [allData, setAllData] = useState([]);
	const [pageCount, setPageCount] = useState(0);
	const [currentPage, setCurrentPage] = useState(1);
	const [currentPageData, setCurrentPageData] = useState([]);

	// ACTIONS
	const getProductsAction = useActionDispatch(actions.getProducts);
	const createProduct = useActionDispatch(actions.createProduct);
	const editProduct = useActionDispatch(actions.editProduct);
	const removeProduct = useActionDispatch(actions.removeProduct);

	// GENERAL METHODS
	const resetError = () => setErrors([]);

	const resetStatus = () => setStatus(request.NONE);

	const reset = () => {
		resetError();
		resetStatus();
	};

	const resetPagination = () => {
		setAllData([]);
		setPageCount(0);
		setCurrentPage(1);
		setCurrentPageData([]);
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

	const addItemInPagination = (item) => {
		setAllData((data) => addInCachedData({ data, item }));
	};

	const updateItemInPagination = (item) => {
		setAllData((data) => updateInCachedData({ data, item }));
	};

	const removeItemInPagination = (item) => {
		setAllData((data) => removeInCachedData({ data, item }));
	};

	// REQUEST METHODS
	const getProducts = (data, shouldReset = false) => {
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

			executeRequest({ ...data, pageSize }, callback, getProductsAction, types.CREATE_PRODUCT);
		}
	};

	const createProductRequest = (product, extraCallback = null) => {
		setRecentRequest(types.CREATE_PRODUCT);
		const clonedProduct = {
			...product,
			allowable_spoilage: (product.allowable_spoilage || 0) / 100,
		};

		createProduct({
			...clonedProduct,
			callback: modifiedExtraCallback(
				modifiedCallback(callback, CREATE_SUCCESS_MESSAGE, CREATE_ERROR_MESSAGE),
				extraCallback,
			),
		});
	};

	const editProductRequest = (product, extraCallback = null) => {
		setRecentRequest(types.EDIT_PRODUCT);
		const clonedProduct = {
			...product,
			allowable_spoilage: (product.allowable_spoilage || 0) / 100,
		};

		editProduct({
			...clonedProduct,
			callback: modifiedExtraCallback(
				modifiedCallback(callback, EDIT_SUCCESS_MESSAGE, EDIT_ERROR_MESSAGE),
				extraCallback,
			),
		});
	};

	const removeProductRequest = (id, extraCallback = null) => {
		setRecentRequest(types.REMOVE_PRODUCT);
		removeProduct({
			id,
			callback: modifiedExtraCallback(
				modifiedCallback(callback, REMOVE_SUCCESS_MESSAGE, REMOVE_ERROR_MESSAGE),
				extraCallback,
			),
		});
	};

	const callback = ({ status, errors = [] }) => {
		setStatus(status);
		setErrors(errors);
	};

	return {
		products: currentPageData,
		pageCount,
		currentPage,
		addItemInPagination,
		updateItemInPagination,
		removeItemInPagination,

		getProducts,
		createProduct: createProductRequest,
		editProduct: editProductRequest,
		removeProduct: removeProductRequest,
		status,
		errors,
		recentRequest,
		reset,
		resetStatus,
		resetError,
	};
};
