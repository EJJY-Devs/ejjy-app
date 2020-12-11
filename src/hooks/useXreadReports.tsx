import { useState } from 'react';
import { useSelector } from 'react-redux';
import { actions, selectors, types } from '../ducks/xread-reports';
import { request } from '../global/types';
import { modifiedExtraCallback } from '../utils/function';
import { useActionDispatch } from './useActionDispatch';

export const useXreadReports = () => {
	const [status, setStatus] = useState<any>(request.NONE);
	const [errors, setErrors] = useState<any>([]);
	const [recentRequest, setRecentRequest] = useState<any>();
	const xreadReport = useSelector(selectors.selectXreadReport());

	const createXreadReport = useActionDispatch(actions.createXreadReport);

	const reset = () => {
		resetError();
		resetStatus();
	};

	const resetError = () => setErrors([]);

	const resetStatus = () => setStatus(request.NONE);

	const createXreadReportRequest = (data, extraCallback = null) => {
		setRecentRequest(types.CREATE_XREAD_REPORT);
		createXreadReport({ ...data, callback: modifiedExtraCallback(callback, extraCallback) });
	};

	const callback = ({ status, errors = [] }) => {
		setStatus(status);
		setErrors(errors);
	};

	return {
		xreadReport,
		createXreadReport: createXreadReportRequest,
		status,
		errors,
		recentRequest,
		reset,
		resetStatus,
		resetError,
	};
};