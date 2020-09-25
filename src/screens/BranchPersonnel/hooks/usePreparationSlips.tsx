import { useState } from 'react';
import { useSelector } from 'react-redux';
import { actions, selectors, types } from '../../../ducks/BranchPersonnel/preparation-slips';
import { request } from '../../../global/types';
import { useActionDispatch } from '../../../hooks/useActionDispatch';
import { modifiedCallback } from '../../../utils/function';

const FULFILL_SUCCESS_MESSAGE = 'Preparation slip fulfilled successfully';
const FULFILL_ERROR_MESSAGE = 'An error occurred while fulfilling the preparation slip';

export const usePreparationSlips = () => {
	const [status, setStatus] = useState<any>(request.NONE);
	const [errors, setErrors] = useState<any>([]);
	const [recentRequest, setRecentRequest] = useState<any>();

	const preparationSlips = useSelector(selectors.selectPreparationSlips());
	const getPreparationSlips = useActionDispatch(actions.getPreparationSlips);
	const fulfillPreparationSlip = useActionDispatch(actions.fulfillPreparationSlip);

	const reset = () => {
		resetError();
		resetStatus();
	};

	const resetError = () => setErrors([]);

	const resetStatus = () => setStatus(request.NONE);

	const getPreparationSlipsRequest = (assigned_personnel_id) => {
		setRecentRequest(types.GET_PREPARATION_SLIPS);
		getPreparationSlips({ assigned_personnel_id, callback });
	};

	const fulfillPreparationSlipRequest = (branch) => {
		setRecentRequest(types.FULFILL_PREPARATION_SLIP);
		fulfillPreparationSlip({
			...branch,
			callback: modifiedCallback(callback, FULFILL_SUCCESS_MESSAGE, FULFILL_ERROR_MESSAGE),
		});
	};

	const callback = ({ status, errors = [] }) => {
		setStatus(status);
		setErrors(errors);
	};

	return {
		preparationSlips,
		getPreparationSlips: getPreparationSlipsRequest,
		fulfillPreparationSlip: fulfillPreparationSlipRequest,
		status,
		errors,
		recentRequest,
		reset,
		resetStatus,
		resetError,
	};
};