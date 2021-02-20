import { useState } from 'react';
import { useSelector } from 'react-redux';
import { actions, selectors, types } from '../../../ducks/OfficeManager/cashiering-assignments';
import { request } from '../../../global/types';
import { useActionDispatch } from '../../../hooks/useActionDispatch';
import { modifiedCallback } from '../../../utils/function';

const CREATE_SUCCESS_MESSAGE = 'Assignment was created successfully';
const CREATE_ERROR_MESSAGE = 'An error occurred while creating the assignment';

const EDIT_SUCCESS_MESSAGE = 'Assignment was edited successfully';
const EDIT_ERROR_MESSAGE = 'An error occurred while editing the assignment';

const REMOVE_SUCCESS_MESSAGE = 'Assignment was removed successfully';
const REMOVE_ERROR_MESSAGE = 'An error occurred while removing the assignment';

export const useCashieringAssignments = () => {
	const [status, setStatus] = useState<any>(request.NONE);
	const [errors, setErrors] = useState<any>([]);
	const [warnings, setWarnings] = useState<any>([]);
	const [recentRequest, setRecentRequest] = useState<any>();

	const cashieringAssignments = useSelector(selectors.selectCashieringAssignments());
	const getCashieringAssignmentsByUserId = useActionDispatch(
		actions.getCashieringAssignmentsByUserId,
	);
	const createCashieringAssignment = useActionDispatch(actions.createCashieringAssignment);
	const editCashieringAssignment = useActionDispatch(actions.editCashieringAssignment);
	const removeCashieringAssignment = useActionDispatch(actions.removeCashieringAssignment);

	const reset = () => {
		resetError();
		resetStatus();
	};

	const resetError = () => setErrors([]);

	const resetStatus = () => setStatus(request.NONE);

	const getCashieringAssignmentsByUserIdRequest = (data) => {
		setRecentRequest(types.GET_CASHIERING_ASSIGNMENTS_BY_USER_ID);
		getCashieringAssignmentsByUserId({ ...data, callback });
	};

	const createCashieringAssignmentRequest = (data) => {
		setRecentRequest(types.CREATE_CASHIERING_ASSIGNMENT);
		createCashieringAssignment({
			...data,
			callback: modifiedCallback(callback, CREATE_SUCCESS_MESSAGE, CREATE_ERROR_MESSAGE),
		});
	};

	const editCashieringAssignmentRequest = (data) => {
		setRecentRequest(types.EDIT_CASHIERING_ASSIGNMENT);
		editCashieringAssignment({
			...data,
			callback: modifiedCallback(callback, EDIT_SUCCESS_MESSAGE, EDIT_ERROR_MESSAGE),
		});
	};

	const removeCashieringAssignmentRequest = (data) => {
		setRecentRequest(types.REMOVE_CASHIERING_ASSIGNMENT);
		removeCashieringAssignment({
			...data,
			callback: modifiedCallback(callback, REMOVE_SUCCESS_MESSAGE, REMOVE_ERROR_MESSAGE),
		});
	};

	const callback = ({ status, errors = [], warnings = [] }) => {
		setStatus(status);
		setErrors(errors);
		setWarnings(warnings);
	};

	return {
		cashieringAssignments,
		getCashieringAssignmentsByUserId: getCashieringAssignmentsByUserIdRequest,
		createCashieringAssignment: createCashieringAssignmentRequest,
		editCashieringAssignment: editCashieringAssignmentRequest,
		removeCashieringAssignment: removeCashieringAssignmentRequest,
		status,
		errors,
		warnings,
		recentRequest,
		reset,
		resetStatus,
		resetError,
	};
};
