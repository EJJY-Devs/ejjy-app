import { useState } from 'react';
import { useSelector } from 'react-redux';
import { actions, selectors, types } from '../../../ducks/OfficeManager/users';
import { request } from '../../../global/types';
import { useActionDispatch } from '../../../hooks/useActionDispatch';
import { modifiedExtraCallback } from '../../../utils/function';

export const useUsers = () => {
	const [status, setStatus] = useState<any>(request.NONE);
	const [errors, setErrors] = useState<any>([]);
	const [recentRequest, setRecentRequest] = useState<any>();

	const users = useSelector(selectors.selectUsers());
	const user = useSelector(selectors.selectUser());
	const getUsers = useActionDispatch(actions.getUsers);
	const getUserById = useActionDispatch(actions.getUserById);

	const reset = () => {
		resetError();
		resetStatus();
	};

	const resetError = () => setErrors([]);

	const resetStatus = () => setStatus(request.NONE);

	const getUsersRequest = (data: any = {}) => {
		setRecentRequest(types.GET_USERS);
		getUsers({ ...data, callback });
	};

	const getUserByIdRequest = (id = 0, extraCallback = null) => {
		setRecentRequest(types.GET_USER_BY_ID);
		getUserById({ id, callback: modifiedExtraCallback(callback, extraCallback) });
	};

	const callback = ({ status, errors = [] }) => {
		setStatus(status);
		setErrors(errors);
	};

	return {
		users,
		user,
		getUsers: getUsersRequest,
		getUserById: getUserByIdRequest,
		status,
		errors,
		recentRequest,
		reset,
		resetStatus,
		resetError,
	};
};
