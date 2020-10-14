/* eslint-disable react-hooks/exhaustive-deps */
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { actions, selectors, types } from '../ducks/requisition-slips';
import { request } from '../global/types';
import { modifiedCallback, modifiedExtraCallback } from '../utils/function';
import { useActionDispatch } from './useActionDispatch';

const CREATE_SUCCESS_MESSAGE = 'Requisition slip was created successfully';
const CREATE_ERROR_MESSAGE = 'An error occurred while creating the requisition slip';

const EDIT_SUCCESS_MESSAGE = 'Requisition slip was edited successfully';
const EDIT_ERROR_MESSAGE = 'An error occurred while updating the requisition slip';

const SET_OUT_OF_STOCK_SUCCESS_MESSAGE = 'Products were set to out of stocks successfully';
const SET_OUT_OF_STOCK_ERROR_MESSAGE =
	'An error occurred while setting the products as out of stock';

export const useRequisitionSlips = () => {
	const [status, setStatus] = useState<any>(request.NONE);
	const [errors, setErrors] = useState<any>([]);
	const [recentRequest, setRecentRequest] = useState<any>();

	const requisitionSlips = useSelector(selectors.selectRequisitionSlips());
	const requisitionSlipsByBranch = useSelector(selectors.selectRequisitionSlipsByBranch());
	const getRequisitionSlips = useActionDispatch(actions.getRequisitionSlips);
	const getRequisitionSlipsExtended = useActionDispatch(actions.getRequisitionSlipsExtended);
	const getRequisitionSlipsById = useActionDispatch(actions.getRequisitionSlipById);
	const getRequisitionSlipsByIdAndBranch = useActionDispatch(
		actions.getRequisitionSlipByIdAndBranch,
	);
	const createRequisitionSlip = useActionDispatch(actions.createRequisitionSlip);
	const editRequisitionSlip = useActionDispatch(actions.editRequisitionSlip);
	const removeRequisitionSlipByBranch = useActionDispatch(actions.removeRequisitionSlipByBranch);
	const setOutOfStock = useActionDispatch(actions.setOutOfStock);

	const reset = () => {
		resetError();
		resetStatus();
	};

	const resetError = () => setErrors([]);

	const resetStatus = () => setStatus(request.NONE);

	const getRequisitionSlipsRequest = (branchId = null) => {
		setRecentRequest(types.GET_REQUISITION_SLIPS);
		getRequisitionSlips({ id: branchId, callback });
	};

	const getRequisitionSlipsExtendedRequest = (branchId = null) => {
		setRecentRequest(types.GET_REQUISITION_SLIPS_EXTENDED);
		getRequisitionSlipsExtended({ id: branchId, callback });
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
		requisitionSlips,
		getRequisitionSlips: getRequisitionSlipsRequest,
		getRequisitionSlipsExtended: getRequisitionSlipsExtendedRequest,
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
