import { useState } from 'react';
import { useSelector } from 'react-redux';
import { actions, selectors, types } from '../../../ducks/OfficeManager/users';
import { request } from '../../../global/types';
import { useActionDispatch } from '../../../hooks/useActionDispatch';
import { modifiedCallback, modifiedExtraCallback } from '../../../utils/function';

const REMOVE_SUCCESS_MESSAGE = 'User was removed successfully';
const REMOVE_ERROR_MESSAGE = 'An error occurred while removing the user';

export const useUsers = () => {
	const [status, setStatus] = useState<any>(request.NONE);
	const [errors, setErrors] = useState<any>([]);
	const [recentRequest, setRecentRequest] = useState<any>();

	const users = useSelector(selectors.selectUsers());
	const user = useSelector(selectors.selectUser());
	const getUsers = useActionDispatch(actions.getUsers);
	const getUserById = useActionDispatch(actions.getUserById);
	const removeUser = useActionDispatch(actions.removeUser);
	const editUser = useActionDispatch(actions.editUser);

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

	const editUserRequest = (data, extraCallback = null) => {
		setRecentRequest(types.EDIT_USER);
		editUser({
			...data,
			callback: modifiedExtraCallback(callback, extraCallback),
		});
	};

	const removeUserRequest = (id) => {
		setRecentRequest(types.REMOVE_USER);
		removeUser({
			id,
			callback: modifiedCallback(callback, REMOVE_SUCCESS_MESSAGE, REMOVE_ERROR_MESSAGE),
		});
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
		editUser: editUserRequest,
		removeUser: removeUserRequest,
		status,
		errors,
		recentRequest,
		reset,
		resetStatus,
		resetError,
	};
};
