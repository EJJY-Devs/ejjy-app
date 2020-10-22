import { useState } from 'react';
import { useSelector } from 'react-redux';
import { actions, selectors, types } from '../../../ducks/BranchManager/product-checks';
import { productCheckingTypes, request } from '../../../global/types';
import { useActionDispatch } from '../../../hooks/useActionDispatch';
import { modifiedCallback } from '../../../utils/function';

const FULFILL_PRODUCT_CHECK_SUCCESS_MESSAGE = 'Product check was fulfilled successfully';
const FULFILL_PRODUCT_CHECK_ERROR_MESSAGE = 'An error occurred while fulfilling the product checks';

export const useProductChecks = () => {
	const [status, setStatus] = useState<any>(request.NONE);
	const [errors, setErrors] = useState<any>([]);
	const [recentRequest, setRecentRequest] = useState<any>();

	const dailyCheck = useSelector(selectors.selectDailyChecks());
	const randomChecks = useSelector(selectors.selectRandomChecks());
	const getDailyCheck = useActionDispatch(actions.getDailyCheck);
	const getRandomChecks = useActionDispatch(actions.getRandomChecks);
	const fulfillProductCheck = useActionDispatch(actions.fulfillProductCheck);

	const reset = () => {
		resetError();
		resetStatus();
	};

	const resetError = () => setErrors([]);

	const resetStatus = () => setStatus(request.NONE);

	const getDailyCheckRequest = (assigned_store_id, is_filled_up = false) => {
		setRecentRequest(types.GET_DAILY_CHECK);
		getDailyCheck({ type: productCheckingTypes.DAILY, assigned_store_id, is_filled_up, callback });
	};

	const getRandomChecksRequest = (assigned_store_id, is_filled_up = false) => {
		setRecentRequest(types.GET_RANDOM_CHECKS);
		getRandomChecks({
			type: productCheckingTypes.RANDOM,
			assigned_store_id,
			is_filled_up,
			callback,
		});
	};

	const fulfillProductCheckRequest = (data) => {
		setRecentRequest(types.FULFILL_PRODUCT_CHECK);
		fulfillProductCheck({
			...data,
			callback: modifiedCallback(
				callback,
				FULFILL_PRODUCT_CHECK_SUCCESS_MESSAGE,
				FULFILL_PRODUCT_CHECK_ERROR_MESSAGE,
			),
		});
	};

	const callback = ({ status, errors = [] }) => {
		setStatus(status);
		setErrors(errors);
	};

	return {
		dailyCheck,
		randomChecks,
		getDailyCheck: getDailyCheckRequest,
		getRandomChecks: getRandomChecksRequest,
		fulfillProductCheck: fulfillProductCheckRequest,
		status,
		errors,
		recentRequest,
		reset,
		resetStatus,
		resetError,
	};
};
