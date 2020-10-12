import { useState } from 'react';
import { useSelector } from 'react-redux';
import { actions, selectors, types } from '../../../ducks/order-slips';
import { request } from '../../../global/types';
import { useActionDispatch } from '../../../hooks/useActionDispatch';
import { modifiedCallback } from '../../../utils/function';

const CREATE_SUCCESS_MESSAGE = 'Order slip was created successfully';
const CREATE_ERROR_MESSAGE = 'An error occurred while creating the order slip';

const EDIT_SUCCESS_MESSAGE = 'Order slip was edited successfully';
const EDIT_ERROR_MESSAGE = 'An error occurred while editing the order slip';

const REMOVE_SUCCESS_MESSAGE = 'Order slip was removed successfully';
const REMOVE_ERROR_MESSAGE = 'An error occurred while removing the order slip';

export const useOrderSlips = () => {
	const [status, setStatus] = useState<any>(request.NONE);
	const [errors, setErrors] = useState<any>([]);
	const [recentRequest, setRecentRequest] = useState<any>();

	const orderSlips = useSelector(selectors.selectOrderSlips());
	const getOrderSlips = useActionDispatch(actions.getOrderSlips);
	const getOrderSlipsExtended = useActionDispatch(actions.getOrderSlipsExtended);
	const createOrderSlip = useActionDispatch(actions.createOrderSlip);
	const editOrderSlip = useActionDispatch(actions.editOrderSlip);
	const removeOrderSlip = useActionDispatch(actions.removeOrderSlip);

	const reset = () => {
		resetError();
		resetStatus();
	};

	const resetError = () => setErrors([]);

	const resetStatus = () => setStatus(request.NONE);

	const getOrderSlipRequest = (requisitionSlipId) => {
		setRecentRequest(types.GET_ORDER_SLIPS);
		getOrderSlips({ requisition_slip_id: requisitionSlipId, callback });
	};

	const getOrderSlipsExtendedRequest = (requisitionSlipId) => {
		setRecentRequest(types.GET_ORDER_SLIPS_EXTENDED);
		getOrderSlipsExtended({ requisition_slip_id: requisitionSlipId, callback });
	};

	const createOrderSlipRequest = (orderSlip) => {
		setRecentRequest(types.CREATE_ORDER_SLIP);
		createOrderSlip({
			...orderSlip,
			callback: modifiedCallback(callback, CREATE_SUCCESS_MESSAGE, CREATE_ERROR_MESSAGE),
		});
	};

	const editOrderSlipRequest = (orderSlip) => {
		setRecentRequest(types.EDIT_ORDER_SLIP);
		editOrderSlip({
			...orderSlip,
			callback: modifiedCallback(callback, EDIT_SUCCESS_MESSAGE, EDIT_ERROR_MESSAGE),
		});
	};

	const removeOrderSlipRequest = (id) => {
		setRecentRequest(types.REMOVE_ORDER_SLIP);
		removeOrderSlip({
			id,
			callback: modifiedCallback(callback, REMOVE_SUCCESS_MESSAGE, REMOVE_ERROR_MESSAGE),
		});
	};

	const callback = ({ status, errors = [] }) => {
		setStatus(status);
		setErrors(errors);
	};

	return {
		orderSlips,
		getOrderSlip: getOrderSlipRequest,
		getOrderSlipsExtended: getOrderSlipsExtendedRequest,
		createOrderSlip: createOrderSlipRequest,
		editOrderSlip: editOrderSlipRequest,
		removeOrderSlip: removeOrderSlipRequest,
		status,
		errors,
		recentRequest,
		reset,
		resetStatus,
		resetError,
	};
};
