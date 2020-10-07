import { useState } from 'react';
import { useSelector } from 'react-redux';
import { actions, selectors, types } from '../../../ducks/OfficeManager/adjustment-slips';
import { request } from '../../../global/types';
import { useActionDispatch } from '../../../hooks/useActionDispatch';
import { modifiedCallback, modifiedExtraCallback } from '../../../utils/function';

const CREATE_SUCCESS_MESSAGE = 'Adjustment slip created successfully';
const CREATE_ERROR_MESSAGE = 'An error occurred while creating the adjustment slip';

export const useAdjustmentSlips = () => {
	const [status, setStatus] = useState<any>(request.NONE);
	const [errors, setErrors] = useState<any>([]);
	const [recentRequest, setRecentRequest] = useState<any>();

	const adjustmentSlips = useSelector(selectors.selectAdjustmentSlips());
	const getAdjustmentSlipsByDeliveryReceiptId = useActionDispatch(
		actions.getAdjustmentSlipsByDeliveryReceiptId,
	);
	const createAdjustmentSlip = useActionDispatch(actions.createAdjustmentSlip);

	const reset = () => {
		resetError();
		resetStatus();
	};

	const resetError = () => setErrors([]);

	const resetStatus = () => setStatus(request.NONE);

	const getAdjustmentSlipsByDeliveryReceiptIdRequest = (
		deliveryReceiptId,
		extraCallback = null,
	) => {
		setRecentRequest(types.GET_ADJUSTMENT_SLIPS_BY_DELIVERY_RECEIPT_ID);
		getAdjustmentSlipsByDeliveryReceiptId({
			deliveryReceiptId,
			callback: modifiedExtraCallback(callback, extraCallback),
		});
	};

	const createAdjustmentSlipRequest = (data) => {
		setRecentRequest(types.CREATE_ADJUSTMENT_SLIP);
		createAdjustmentSlip({
			data,
			callback: modifiedCallback(callback, CREATE_SUCCESS_MESSAGE, CREATE_ERROR_MESSAGE),
		});
	};

	const callback = ({ status, errors = [] }) => {
		setStatus(status);
		setErrors(errors);
	};

	return {
		adjustmentSlips,
		getAdjustmentSlipsByDeliveryReceiptId: getAdjustmentSlipsByDeliveryReceiptIdRequest,
		createAdjustmentSlip: createAdjustmentSlipRequest,
		status,
		errors,
		recentRequest,
		reset,
		resetStatus,
		resetError,
	};
};
