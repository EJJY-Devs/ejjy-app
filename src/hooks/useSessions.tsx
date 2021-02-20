import { useState } from 'react';
import { useSelector } from 'react-redux';
import { actions, selectors, types } from '../ducks/sessions';
import { request } from '../global/types';
import { useActionDispatch } from './useActionDispatch';

export const useSessions = () => {
	const [status, setStatus] = useState<any>(request.NONE);
	const [errors, setErrors] = useState<any>([]);
	const [warnings, setWarnings] = useState<any>([]);
	const [recentRequest, setRecentRequest] = useState<any>();
	const sessions = useSelector(selectors.selectSessions());

	const listSessions = useActionDispatch(actions.listSessions);

	const reset = () => {
		resetError();
		resetStatus();
	};

	const resetError = () => setErrors([]);

	const resetStatus = () => setStatus(request.NONE);

	const listSessionsRequest = (branchId) => {
		setRecentRequest(types.LIST_SESSIONS);

		listSessions({
			branch_id: branchId,
			callback,
		});
	};

	const callback = ({ status, errors = [], warnings = [] }) => {
		setStatus(status);
		setErrors(errors);
		setWarnings(warnings);
	};

	return {
		sessions,
		listSessions: listSessionsRequest,
		status,
		errors,
		warnings,
		recentRequest,
		reset,
		resetStatus,
		resetError,
	};
};
