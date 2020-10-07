import { useState } from 'react';
import { useSelector } from 'react-redux';
import { actions, selectors, types } from '../../../ducks/OfficeManager/delivery-receipts';
import { request } from '../../../global/types';
import { useActionDispatch } from '../../../hooks/useActionDispatch';
import { modifiedCallback, modifiedExtraCallback } from '../../../utils/function';

const CREATE_SUCCESS_MESSAGE = 'Delivery receipt created successfully';
const CREATE_ERROR_MESSAGE = 'An error occurred while creating the delivery receipt';

export const useDeliveryReceipt = () => {
	const [status, setStatus] = useState<any>(request.NONE);
	const [errors, setErrors] = useState<any>([]);
	const [recentRequest, setRecentRequest] = useState<any>();

	const deliveryReceipt = useSelector(selectors.selectDeliveryReceipt());
	const getDeliveryReceiptById = useActionDispatch(actions.getDeliveryReceiptById);
	const createDeliveryReceipt = useActionDispatch(actions.createDeliveryReceipt);

	const reset = () => {
		resetError();
		resetStatus();
	};

	const resetError = () => setErrors([]);

	const resetStatus = () => setStatus(request.NONE);

	const getDeliveryReceiptByIdRequest = (id, extraCallback = null) => {
		setRecentRequest(types.GET_DELIVERY_RECEIPT_BY_ID);
		getDeliveryReceiptById({ id, callback: modifiedExtraCallback(callback, extraCallback) });
	};

	const createDeliveryReceiptRequest = (order_slip_id) => {
		setRecentRequest(types.CREATE_DELIVERY_RECEIPT);
		createDeliveryReceipt({
			order_slip_id,
			callback: modifiedCallback(callback, CREATE_SUCCESS_MESSAGE, CREATE_ERROR_MESSAGE),
		});
	};

	const callback = ({ status, errors = [] }) => {
		setStatus(status);
		setErrors(errors);
	};

	return {
		deliveryReceipt,
		getDeliveryReceiptById: getDeliveryReceiptByIdRequest,
		createDeliveryReceipt: createDeliveryReceiptRequest,
		status,
		errors,
		recentRequest,
		reset,
		resetStatus,
		resetError,
	};
};
