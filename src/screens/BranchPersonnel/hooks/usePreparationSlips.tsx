import { useState } from 'react';
import { useSelector } from 'react-redux';
import { actions, selectors, types } from '../../../ducks/BranchPersonnel/preparation-slips';
import { request } from '../../../global/types';
import { useActionDispatch } from '../../../hooks/useActionDispatch';
import { modifiedCallback, modifiedExtraCallback } from '../../../utils/function';

const FULFILL_SUCCESS_MESSAGE = 'Preparation slip was fulfilled successfully';
const FULFILL_ERROR_MESSAGE = 'An error occurred while fulfilling the preparation slip';

export const usePreparationSlips = () => {
	const [status, setStatus] = useState<any>(request.NONE);
	const [errors, setErrors] = useState<any>([]);
	const [recentRequest, setRecentRequest] = useState<any>();

	const preparationSlip = useSelector(selectors.selectPreparationSlip());
	const preparationSlips = useSelector(selectors.selectPreparationSlips());
	const getPreparationSlips = useActionDispatch(actions.getPreparationSlips);
	const getPreparationSlipById = useActionDispatch(actions.getPreparationSlipById);
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

	const getPreparationSlipByIdRequest = (id, assigned_personnel_id, extraCallback = null) => {
		setRecentRequest(types.GET_PREPARATION_SLIP_BY_ID);
		getPreparationSlipById({
			id,
			assigned_personnel_id,
			callback: modifiedExtraCallback(callback, extraCallback),
		});
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
		preparationSlip,
		preparationSlips,
		getPreparationSlips: getPreparationSlipsRequest,
		getPreparationSlipById: getPreparationSlipByIdRequest,
		fulfillPreparationSlip: fulfillPreparationSlipRequest,
		status,
		errors,
		recentRequest,
		reset,
		resetStatus,
		resetError,
	};
};
