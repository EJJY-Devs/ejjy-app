import { useState } from 'react';
import { useSelector } from 'react-redux';
import { actions, selectors, types } from '../../../ducks/BranchManager/delivery-receipts';
import { request } from '../../../global/types';
import { useActionDispatch } from '../../../hooks/useActionDispatch';
import { modifiedCallback } from '../../../utils/function';

const RECEIVE_SUCCESS_MESSAGE = 'Delivery receipt was received successfully';
const RECEIVE_ERROR_MESSAGE = 'An error occurred while receiving the delivery receipt';

export const useDeliveryReceipt = () => {
	const [status, setStatus] = useState<any>(request.NONE);
	const [errors, setErrors] = useState<any>([]);
	const [recentRequest, setRecentRequest] = useState<any>();

	const deliveryReceipt = useSelector(selectors.selectDeliveryReceipt());
	const getDeliveryReceiptById = useActionDispatch(actions.getDeliveryReceiptById);
	const receiveDeliveryReceipt = useActionDispatch(actions.receiveDeliveryReceipt);

	const reset = () => {
		resetError();
		resetStatus();
	};

	const resetError = () => setErrors([]);

	const resetStatus = () => setStatus(request.NONE);

	const getDeliveryReceiptByIdRequest = (id) => {
		setRecentRequest(types.GET_DELIVERY_RECEIPT_BY_ID);
		getDeliveryReceiptById({ id, callback });
	};

	const receiveDeliveryReceiptRequest = (data) => {
		setRecentRequest(types.RECEIVE_DELIVERY_RECEIPT);
		receiveDeliveryReceipt({
			...data,
			callback: modifiedCallback(callback, RECEIVE_SUCCESS_MESSAGE, RECEIVE_ERROR_MESSAGE),
		});
	};

	const callback = ({ status, errors = [] }) => {
		setStatus(status);
		setErrors(errors);
	};

	return {
		deliveryReceipt,
		getDeliveryReceiptById: getDeliveryReceiptByIdRequest,
		receiveDeliveryReceipt: receiveDeliveryReceiptRequest,
		status,
		errors,
		recentRequest,
		reset,
		resetStatus,
		resetError,
	};
};
