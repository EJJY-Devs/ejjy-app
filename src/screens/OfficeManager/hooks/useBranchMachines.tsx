import { useState } from 'react';
import { useSelector } from 'react-redux';
import { actions, selectors, types } from '../../../ducks/OfficeManager/branch-machines';
import { request } from '../../../global/types';
import { useActionDispatch } from '../../../hooks/useActionDispatch';

export const useBranchMachines = () => {
	const [status, setStatus] = useState<any>(request.NONE);
	const [errors, setErrors] = useState<any>([]);
	const [warnings, setWarnings] = useState<any>([]);
	const [recentRequest, setRecentRequest] = useState<any>();

	const branchMachines = useSelector(selectors.selectBranchMachines());
	const getBranchMachines = useActionDispatch(actions.getBranchMachines);

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

	const callback = ({ status, errors = [], warnings = [] }) => {
		setStatus(status);
		setErrors(errors);
		setWarnings(warnings);
	};

	return {
		branchMachines,
		getBranchMachines: getBranchMachinesRequest,
		status,
		errors,
		warnings,
		recentRequest,
		reset,
		resetStatus,
		resetError,
	};
};
