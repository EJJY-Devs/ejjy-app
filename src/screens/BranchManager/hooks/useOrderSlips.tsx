import { useState } from 'react';
import { useSelector } from 'react-redux';
import { actions, selectors, types } from '../../../ducks/order-slips';
import { request } from '../../../global/types';
import { useActionDispatch } from '../../../hooks/useActionDispatch';

export const useOrderSlips = () => {
	const [status, setStatus] = useState<any>(request.NONE);
	const [errors, setErrors] = useState<any>([]);
	const [recentRequest, setRecentRequest] = useState<any>();

	const orderSlips = useSelector(selectors.selectOrderSlips());
	const getOrderSlips = useActionDispatch(actions.getOrderSlips);
	const getOrderSlipsExtended = useActionDispatch(actions.getOrderSlipsExtended);

	const reset = () => {
		resetError();
		resetStatus();
	};

	const resetError = () => setErrors([]);

	const resetStatus = () => setStatus(request.NONE);

	const getOrderSlipRequest = (assignedStoreId) => {
		setRecentRequest(types.GET_ORDER_SLIPS);
		getOrderSlips({ assigned_store_id: assignedStoreId, callback });
	};

	const getOrderSlipsExtendedRequest = (assignedStoreId) => {
		setRecentRequest(types.GET_ORDER_SLIPS_EXTENDED);
		getOrderSlipsExtended({ assigned_store_id: assignedStoreId, callback });
	};

	const callback = ({ status, errors = [] }) => {
		setStatus(status);
		setErrors(errors);
	};

	return {
		orderSlips,
		getOrderSlip: getOrderSlipRequest,
		getOrderSlipsExtended: getOrderSlipsExtendedRequest,
		status,
		errors,
		recentRequest,
		reset,
		resetStatus,
		resetError,
	};
};
