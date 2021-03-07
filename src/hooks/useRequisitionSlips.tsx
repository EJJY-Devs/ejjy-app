/* eslint-disable react-hooks/exhaustive-deps */
import { message } from 'antd';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { actions, selectors, types } from '../ducks/requisition-slips';
import { MAX_PAGE_SIZE } from '../global/constants';
import { request } from '../global/types';
import { modifiedCallback, modifiedExtraCallback, onCallback } from '../utils/function';
import {
	addInCachedData,
	generateNewCachedData,
	getDataForCurrentPage,
	indexHasCachedData,
	removeInCachedData,
	updateInCachedData,
} from '../utils/pagination';
import { useActionDispatch } from './useActionDispatch';

const LIST_ERROR_MESSAGE = 'An error occurred while fetching requisition slips';

const CREATE_SUCCESS_MESSAGE = 'Requisition slip was created successfully';
const CREATE_ERROR_MESSAGE = 'An error occurred while creating the requisition slip';

const EDIT_SUCCESS_MESSAGE = 'Requisition slip was edited successfully';
const EDIT_ERROR_MESSAGE = 'An error occurred while updating the requisition slip';

const SET_OUT_OF_STOCK_SUCCESS_MESSAGE = 'Products were set to out of stocks successfully';
const SET_OUT_OF_STOCK_ERROR_MESSAGE =
	'An error occurred while setting the products as out of stock';

export const useRequisitionSlips = ({ pageSize = MAX_PAGE_SIZE } = {}) => {
	// STATES
	const [status, setStatus] = useState<any>(request.NONE);
	const [errors, setErrors] = useState<any>([]);
	const [recentRequest, setRecentRequest] = useState<any>();

	// PAGINATION
	const [allData, setAllData] = useState([]);
	const [pageCount, setPageCount] = useState(0);
	const [currentPage, setCurrentPage] = useState(1);
	const [currentPageData, setCurrentPageData] = useState([]);

	// SELECTORS
	const requisitionSlip = useSelector(selectors.selectRequisitionSlip());
	const requisitionSlipsByBranch = useSelector(selectors.selectRequisitionSlipsByBranch());
	const requisitionSlipForOutOfStock = useSelector(selectors.selectRequisitionSlipForOutOfStock());

	// ACTIONS
	const getRequisitionSlipsAction = useActionDispatch(actions.getRequisitionSlips);
	const getRequisitionSlipsExtendedAction = useActionDispatch(actions.getRequisitionSlipsExtended);

	const getRequisitionSlipsById = useActionDispatch(actions.getRequisitionSlipById);
	const getRequisitionSlipsByIdAndBranch = useActionDispatch(
		actions.getRequisitionSlipByIdAndBranch,
	);
	const createRequisitionSlip = useActionDispatch(actions.createRequisitionSlip);
	const editRequisitionSlip = useActionDispatch(actions.editRequisitionSlip);
	const removeRequisitionSlipByBranch = useActionDispatch(actions.removeRequisitionSlipByBranch);
	const setOutOfStock = useActionDispatch(actions.setOutOfStock);

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
	const getRequisitionSlips = (data, shouldReset = false) => {
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
				getRequisitionSlipsAction,
				types.GET_REQUISITION_SLIPS,
			);
		}
	};

	const getRequisitionSlipsExtended = (data, shouldReset = false) => {
		if (shouldReset) {
			resetPagination();
		}

		const { page } = data;

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
				getRequisitionSlipsExtendedAction,
				types.GET_REQUISITION_SLIPS_EXTENDED,
			);
		}
	};

	const getRequisitionSlipsByIdRequest = (id, extraCallback = null) => {
		setRecentRequest(types.GET_REQUISITION_SLIP_BY_ID);
		getRequisitionSlipsById({ id, callback: modifiedExtraCallback(callback, extraCallback) });
	};

	const getRequisitionSlipsByIdAndBranchRequest = (id, branchId, extraCallback = null) => {
		setRecentRequest(types.GET_REQUISITION_SLIP_BY_ID_AND_BRANCH);
		if (!requisitionSlipsByBranch?.[branchId]) {
			getRequisitionSlipsByIdAndBranch({
				id,
				branchId,
				callback: modifiedExtraCallback(callback, extraCallback),
			});
		} else {
			callback({ status: request.REQUESTING });
			callback({ status: request.SUCCESS });
		}
	};

	const createRequisitionSlipRequest = (requisitionSlip) => {
		setRecentRequest(types.CREATE_REQUISITION_SLIP);
		createRequisitionSlip({
			...requisitionSlip,
			callback: modifiedCallback(callback, CREATE_SUCCESS_MESSAGE, CREATE_ERROR_MESSAGE),
		});
	};

	const editRequisitionSlipRequest = (id, status) => {
		setRecentRequest(types.EDIT_REQUISITION_SLIP);
		editRequisitionSlip({
			id,
			action: status,
			callback: modifiedCallback(callback, EDIT_SUCCESS_MESSAGE, EDIT_ERROR_MESSAGE),
		});
	};

	const setOutOfStockRequest = (data) => {
		setRecentRequest(types.SET_OUT_OF_STOCK);
		setOutOfStock({
			...data,
			callback: modifiedCallback(
				callback,
				SET_OUT_OF_STOCK_SUCCESS_MESSAGE,
				SET_OUT_OF_STOCK_ERROR_MESSAGE,
			),
		});
	};

	const callback = ({ status, errors = [] }) => {
		setStatus(status);
		setErrors(errors);
	};

	return {
		requisitionSlip,
		requisitionSlipsByBranch,
		requisitionSlipForOutOfStock,

		requisitionSlips: currentPageData,
		pageCount,
		currentPage,
		addItemInPagination,
		updateItemInPagination,
		removeItemInPagination,
		resetPagination,

		getRequisitionSlips,
		getRequisitionSlipsExtended,
		getRequisitionSlipsById: getRequisitionSlipsByIdRequest,
		getRequisitionSlipsByIdAndBranch: getRequisitionSlipsByIdAndBranchRequest,
		createRequisitionSlip: createRequisitionSlipRequest,
		editRequisitionSlip: editRequisitionSlipRequest,
		setOutOfStock: setOutOfStockRequest,
		removeRequisitionSlipByBranch,
		status,
		errors,
		recentRequest,
		reset,
		resetStatus,
		resetError,
	};
};
