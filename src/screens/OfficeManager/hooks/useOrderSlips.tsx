import { useState } from 'react';
import { useSelector } from 'react-redux';
import { actions, selectors, types } from '../../../ducks/order-slips';
import { request } from '../../../global/types';
import { useActionDispatch } from '../../../hooks/useActionDispatch';
import { modifiedCallback } from '../../../utils/function';

const SET_OUT_OF_STOCK_SUCCESS_MESSAGE = 'Product/s set to out of stocks successfully';
const SET_OUT_OF_STOCK_ERROR_MESSAGE =
	'An error occurred while setting the product/s as out of stock';

const CREATE_SUCCESS_MESSAGE = 'Order slip created successfully';
const CREATE_ERROR_MESSAGE = 'An error occurred while creating the order slip';

const EDIT_SUCCESS_MESSAGE = 'Order slip edited successfully';
const EDIT_ERROR_MESSAGE = 'An error occurred while editing the order slip';

const REMOVE_SUCCESS_MESSAGE = 'Order slip removed successfully';
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
	const setOutOfStock = useActionDispatch(actions.setOutOfStock);

	const reset = () => {
		resetError();
		resetStatus();
	};

	const resetError = () => setErrors([]);

	const resetStatus = () => setStatus(request.NONE);

	const getOrderSlipRequest = (purchaseRequestId) => {
		setRecentRequest(types.GET_ORDER_SLIPS);
		getOrderSlips({ purchase_request_id: purchaseRequestId, callback });
	};

	const getOrderSlipsExtendedRequest = (purchaseRequestId) => {
		setRecentRequest(types.GET_ORDER_SLIPS_EXTENDED);
		getOrderSlipsExtended({ purchase_request_id: purchaseRequestId, callback });
	};

	const createOrderSlipRequest = (orderSlip) => {
		setRecentRequest(types.CREATE_ORDER_SLIP);
		createOrderSlip({
			...orderSlip,
			callback: modifiedCallback(callback, CREATE_SUCCESS_MESSAGE, CREATE_ERROR_MESSAGE),
		});
	};

	const setOutOfStockRequest = (orderSlip) => {
		setRecentRequest(types.SET_OUT_OF_STOCK);
		setOutOfStock({
			...orderSlip,
			callback: modifiedCallback(
				callback,
				SET_OUT_OF_STOCK_SUCCESS_MESSAGE,
				SET_OUT_OF_STOCK_ERROR_MESSAGE,
			),
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
		setOutOfStock: setOutOfStockRequest,
		status,
		errors,
		recentRequest,
		reset,
		resetStatus,
		resetError,
	};
};
