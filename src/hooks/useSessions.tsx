/* eslint-disable react-hooks/exhaustive-deps */
import { message } from 'antd';
import { useEffect, useState } from 'react';
import { actions, types } from '../ducks/sessions';
import { MAX_PAGE_SIZE } from '../global/constants';
import { request } from '../global/types';
import { onCallback } from '../utils/function';
import {
	addInCachedData,
	generateNewCachedData,
	getDataForCurrentPage,
	indexHasCachedData,
	removeInCachedData,
	updateInCachedData,
} from '../utils/pagination';
import { useActionDispatch } from './useActionDispatch';

const LIST_ERROR_MESSAGE = 'An error occurred while fetching transactions.';

export const useSessions = ({ pageSize = MAX_PAGE_SIZE } = {}) => {
	// STATES
	const [status, setStatus] = useState<any>(request.NONE);
	const [errors, setErrors] = useState<any>([]);
	const [warnings, setWarnings] = useState<any>([]);
	const [recentRequest, setRecentRequest] = useState<any>();

	// PAGINATION
	const [allData, setAllData] = useState([]);
	const [pageCount, setPageCount] = useState(0);
	const [currentPage, setCurrentPage] = useState(1);
	const [currentPageData, setCurrentPageData] = useState([]);

	// ACTIONS
	const listSessionsAction = useActionDispatch(actions.listSessions);

	// GENERAL METHODS
	const resetError = () => setErrors([]);

	const resetStatus = () => setStatus(request.NONE);

	const reset = () => {
		resetError();
		resetStatus();
	};

	const requestCallback = ({
		status: requestStatus,
		errors: requestErrors = [],
		warnings: requestWarnings = [],
	}) => {
		setStatus(requestStatus);
		setErrors(requestErrors);
		setWarnings(requestWarnings);
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
	const listSessions = (data) => {
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

			executeRequest({ ...data, pageSize }, callback, listSessionsAction, types.LIST_SESSIONS);
		}
	};

	return {
		sessions: currentPageData,
		pageCount,
		currentPage,
		addItemInPagination,
		updateItemInPagination,
		removeItemInPagination,

		listSessions,
		status,
		errors,
		warnings,
		recentRequest,
		reset,
		resetStatus,
		resetError,
	};
};
