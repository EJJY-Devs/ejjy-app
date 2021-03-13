/* eslint-disable react-hooks/exhaustive-deps */
import { message } from 'antd';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { actions, selectors, types } from '../ducks/branches-days';
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

export const useBranchesDays = ({ pageSize = MAX_PAGE_SIZE } = {}) => {
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

	// SELECTORS
	const branchDay = useSelector(selectors.selectBranchDay());

	// ACTIONS
	const listBranchDaysAction = useActionDispatch(actions.listBranchDays);
	const getBranchDay = useActionDispatch(actions.getBranchDay);
	const createBranchDay = useActionDispatch(actions.createBranchDay);
	const editBranchDay = useActionDispatch(actions.editBranchDay);

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
	const listBranchDays = (data) => {
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

			executeRequest({ ...data, pageSize }, callback, listBranchDaysAction, types.LIST_BRANCH_DAYS);
		}
	};

	const getBranchDayRequest = (branchId) => {
		setRecentRequest(types.GET_BRANCH_DAY);
		getBranchDay({
			branch_id: branchId,
			callback,
		});
	};

	const createBranchDayRequest = (branchId, startedById) => {
		setRecentRequest(types.CREATE_BRANCH_DAY);
		createBranchDay({
			branch_id: branchId,
			started_by_id: startedById,
			callback,
		});
	};

	const editBranchDayRequest = (branchId, branchDayId, endedById) => {
		setRecentRequest(types.EDIT_BRANCH_DAY);
		editBranchDay({
			id: branchDayId,
			branch_id: branchId,
			ended_by_id: endedById,
			callback,
		});
	};

	const callback = ({ status, errors = [], warnings = [] }) => {
		setStatus(status);
		setErrors(errors);
		setWarnings(warnings);
	};

	return {
		branchDay,
		branchDays: currentPageData,
		pageCount,
		currentPage,
		addItemInPagination,
		updateItemInPagination,
		removeItemInPagination,

		listBranchDays,
		getBranchDay: getBranchDayRequest,
		createBranchDay: createBranchDayRequest,
		editBranchDay: editBranchDayRequest,
		status,
		errors,
		warnings,
		recentRequest,
		reset,
		resetStatus,
		resetError,
	};
};
