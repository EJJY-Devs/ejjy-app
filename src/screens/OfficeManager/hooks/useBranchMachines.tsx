import { useState } from 'react';
import { useSelector } from 'react-redux';
import { actions, selectors, types } from '../../../ducks/OfficeManager/branch-machines';
import { request } from '../../../global/types';
import { useActionDispatch } from '../../../hooks/useActionDispatch';
import { modifiedCallback, modifiedExtraCallback } from '../../../utils/function';

const CREATE_SUCCESS_MESSAGE = 'Branch machine was created successfully';
const CREATE_ERROR_MESSAGE = 'An error occurred while creating the branch machine';

const EDIT_SUCCESS_MESSAGE = 'Branch machine was edited successfully';
const EDIT_ERROR_MESSAGE = 'An error occurred while editing the branch machine';

export const useBranchMachines = () => {
	const [status, setStatus] = useState<any>(request.NONE);
	const [errors, setErrors] = useState<any>([]);
	const [warnings, setWarnings] = useState<any>([]);
	const [recentRequest, setRecentRequest] = useState<any>();

	const branchMachines = useSelector(selectors.selectBranchMachines());
	const getBranchMachines = useActionDispatch(actions.getBranchMachines);
	const createBranchMachine = useActionDispatch(actions.createBranchMachine);
	const editBranchMachine = useActionDispatch(actions.editBranchMachine);

	const reset = () => {
		resetError();
		resetStatus();
	};

	const resetError = () => setErrors([]);

	const resetStatus = () => setStatus(request.NONE);

	const getBranchMachinesRequest = (branchId) => {
		setRecentRequest(types.GET_BRANCH_MACHINES);
		getBranchMachines({ branchId, callback });
	};

	const createBranchMachineRequest = (product, extraCallback = null) => {
		setRecentRequest(types.CREATE_BRANCH_MACHINE);
		createBranchMachine({
			...product,
			callback: modifiedExtraCallback(
				modifiedCallback(callback, CREATE_SUCCESS_MESSAGE, CREATE_ERROR_MESSAGE),
				extraCallback,
			),
		});
	};

	const editBranchMachineRequest = (product, extraCallback = null) => {
		setRecentRequest(types.EDIT_BRANCH_MACHINE);
		editBranchMachine({
			...product,
			callback: modifiedExtraCallback(
				modifiedCallback(callback, EDIT_SUCCESS_MESSAGE, EDIT_ERROR_MESSAGE),
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
		branchMachines,
		getBranchMachines: getBranchMachinesRequest,
		createBranchMachine: createBranchMachineRequest,
		editBranchMachine: editBranchMachineRequest,
		status,
		errors,
		warnings,
		recentRequest,
		reset,
		resetStatus,
		resetError,
	};
};
