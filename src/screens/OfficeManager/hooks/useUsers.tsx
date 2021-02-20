import { useState } from 'react';
import { useSelector } from 'react-redux';
import { actions, selectors, types } from '../../../ducks/OfficeManager/users';
import { request } from '../../../global/types';
import { useActionDispatch } from '../../../hooks/useActionDispatch';
import { modifiedCallback, modifiedExtraCallback } from '../../../utils/function';

const CREATE_SUCCESS_MESSAGE = 'User was created successfully';
const CREATE_ERROR_MESSAGE = 'An error occurred while creating the user';

const EDIT_SUCCESS_MESSAGE = 'User was edited successfully';
const EDIT_ERROR_MESSAGE = 'An error occurred while editing the user';

const REMOVE_SUCCESS_MESSAGE = 'User was removed successfully';
const REMOVE_ERROR_MESSAGE = 'An error occurred while removing the user';

export const useUsers = () => {
	const [status, setStatus] = useState<any>(request.NONE);
	const [errors, setErrors] = useState<any>([]);
	const [warnings, setWarnings] = useState<any>([]);
	const [recentRequest, setRecentRequest] = useState<any>();

	const users = useSelector(selectors.selectUsers());
	const user = useSelector(selectors.selectUser());
	const getUsers = useActionDispatch(actions.getUsers);
	const getUserById = useActionDispatch(actions.getUserById);
	const createUser = useActionDispatch(actions.createUser);
	const editUser = useActionDispatch(actions.editUser);
	const removeUser = useActionDispatch(actions.removeUser);

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

	const createUserRequest = (data, extraCallback = null) => {
		setRecentRequest(types.EDIT_USER);
		createUser({
			...data,
			callback: modifiedExtraCallback(
				modifiedCallback(callback, CREATE_SUCCESS_MESSAGE, CREATE_ERROR_MESSAGE),
				extraCallback,
			),
		});
	};

	const editUserRequest = (data, extraCallback = null) => {
		setRecentRequest(types.EDIT_USER);
		editUser({
			...data,
			callback: modifiedExtraCallback(
				modifiedCallback(callback, EDIT_SUCCESS_MESSAGE, EDIT_ERROR_MESSAGE),
				extraCallback,
			),
		});
	};

	const removeUserRequest = (id, extraCallback = null) => {
		setRecentRequest(types.REMOVE_USER);
		removeUser({
			id,
			callback: modifiedExtraCallback(
				modifiedCallback(callback, REMOVE_SUCCESS_MESSAGE, REMOVE_ERROR_MESSAGE),
				extraCallback,
			),
		});
	};

	const callback = ({ status, errors = [], warnings = [] }) => {
		setStatus(status);
		setErrors(errors);
		setWarnings(warnings);
	};

	return {
		users,
		user,
		getUsers: getUsersRequest,
		getUserById: getUserByIdRequest,
		createUser: createUserRequest,
		editUser: editUserRequest,
		removeUser: removeUserRequest,
		status,
		errors,
		warnings,
		recentRequest,
		reset,
		resetStatus,
		resetError,
	};
};
