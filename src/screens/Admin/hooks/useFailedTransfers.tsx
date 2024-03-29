import { useState } from 'react';
import { useSelector } from 'react-redux';
import { modifiedExtraCallback } from 'utils';
import {
	actions,
	selectors,
	types,
} from '../../../ducks/Admin/failed-transfers';
import { request } from '../../../global/types';
import { useActionDispatch } from '../../../hooks/useActionDispatch';

export const useFailedTransfers = () => {
	const [status, setStatus] = useState<any>(request.NONE);
	const [errors, setErrors] = useState<any>([]);
	const [recentRequest, setRecentRequest] = useState<any>();

	const failedTransfers = useSelector(selectors.selectFailedTransfers());
	const getFailedTansferCountAction = useActionDispatch(
		actions.getFailedTansferCount,
	);

	const reset = () => {
		resetError();
		resetStatus();
	};

	const resetError = () => setErrors([]);

	const resetStatus = () => setStatus(request.NONE);

	const getFailedTansferCount = (data, extraCallback = null) => {
		setRecentRequest(types.GET_FAILED_TRANSFER_COUNT);
		getFailedTansferCountAction({
			...data,
			callback: modifiedExtraCallback(callback, extraCallback),
		});
	};

	const callback = ({
		status: callbackStatus,
		errors: callbackErrors = [],
	}) => {
		setStatus(callbackStatus);
		setErrors(callbackErrors);
	};

	return {
		failedTransfers,
		getFailedTansferCount,
		status,
		errors,
		recentRequest,
		reset,
		resetStatus,
		resetError,
	};
};
