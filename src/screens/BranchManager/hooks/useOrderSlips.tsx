/* eslint-disable react-hooks/exhaustive-deps */
import { message } from 'antd';
import { useEffect, useState } from 'react';
import { actions, types } from '../../../ducks/order-slips';
import { MAX_PAGE_SIZE } from '../../../global/constants';
import { request } from '../../../global/types';
import { useActionDispatch } from '../../../hooks/useActionDispatch';
import { onCallback } from '../../../utils/function';
import {
	addInCachedData,
	generateNewCachedData,
	getDataForCurrentPage,
	indexHasCachedData,
	removeInCachedData,
	updateInCachedData,
} from '../../../utils/pagination';

const LIST_ERROR_MESSAGE = 'An error occurred while fetching order slips';

export const useOrderSlips = ({ pageSize = MAX_PAGE_SIZE } = {}) => {
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
	const getOrderSlipsExtendedAction = useActionDispatch(actions.getOrderSlipsExtended);

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

	const getOrderSlipsExtended = (data, shouldReset = false) => {
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
				getOrderSlipsExtendedAction,
				types.GET_ORDER_SLIPS_EXTENDED,
			);
		}
	};

	return {
		orderSlips: currentPageData,
		pageCount,
		currentPage,
		addItemInPagination,
		updateItemInPagination,
		removeItemInPagination,
		resetPagination,

		getOrderSlipsExtended,
		status,
		errors,
		recentRequest,
		reset,
		resetStatus,
		resetError,
	};
};
