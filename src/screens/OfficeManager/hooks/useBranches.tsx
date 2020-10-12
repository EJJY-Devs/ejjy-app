import { useState } from 'react';
import { useSelector } from 'react-redux';
import { actions, selectors, types } from '../../../ducks/OfficeManager/branches';
import { request } from '../../../global/types';
import { useActionDispatch } from '../../../hooks/useActionDispatch';
import { modifiedCallback } from '../../../utils/function';

const CREATE_SUCCESS_MESSAGE = 'Branch was created successfully';
const CREATE_ERROR_MESSAGE = 'An error occurred while creating the branch';

const EDIT_SUCCESS_MESSAGE = 'Branch was edited successfully';
const EDIT_ERROR_MESSAGE = 'An error occurred while editing the branch';

const REMOVE_SUCCESS_MESSAGE = 'Branch was removed successfully';
const REMOVE_ERROR_MESSAGE = 'An error occurred while removing the branch';

export const useBranches = () => {
	const [status, setStatus] = useState<any>(request.NONE);
	const [errors, setErrors] = useState<any>([]);
	const [recentRequest, setRecentRequest] = useState<any>();

	const branches = useSelector(selectors.selectBranches());
	const getBranches = useActionDispatch(actions.getBranches);
	const createBranch = useActionDispatch(actions.createBranch);
	const editBranch = useActionDispatch(actions.editBranch);
	const removeBranch = useActionDispatch(actions.removeBranch);

	const reset = () => {
		resetError();
		resetStatus();
	};

	const resetError = () => setErrors([]);

	const resetStatus = () => setStatus(request.NONE);

	const getBranchesRequest = () => {
		setRecentRequest(types.GET_BRANCHES);
		getBranches({ callback });
	};

	const createBranchRequest = (branch) => {
		setRecentRequest(types.CREATE_BRANCH);
		createBranch({
			...branch,
			callback: modifiedCallback(callback, CREATE_SUCCESS_MESSAGE, CREATE_ERROR_MESSAGE),
		});
	};

	const editBranchRequest = (branch) => {
		setRecentRequest(types.EDIT_BRANCH);
		editBranch({
			...branch,
			callback: modifiedCallback(callback, EDIT_SUCCESS_MESSAGE, EDIT_ERROR_MESSAGE),
		});
	};

	const removeBranchRequest = (id) => {
		setRecentRequest(types.REMOVE_BRANCH);
		removeBranch({
			id,
			callback: modifiedCallback(callback, REMOVE_SUCCESS_MESSAGE, REMOVE_ERROR_MESSAGE),
		});
	};

	const callback = ({ status, errors = [] }) => {
		setStatus(status);
		setErrors(errors);
	};

	return {
		branches,
		getBranches: getBranchesRequest,
		createBranch: createBranchRequest,
		editBranch: editBranchRequest,
		removeBranch: removeBranchRequest,
		status,
		errors,
		recentRequest,
		reset,
		resetStatus,
		resetError,
	};
};
