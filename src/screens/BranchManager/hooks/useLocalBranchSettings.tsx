import { useState } from 'react';
import { useSelector } from 'react-redux';
import { actions, selectors, types } from '../../../ducks/BranchManager/local-branch-settings';
import { request } from '../../../global/types';
import { useActionDispatch } from '../../../hooks/useActionDispatch';
import { modifiedCallback } from '../../../utils/function';

const EDIT_SUCCESS_MESSAGE = 'Settings was edited successfully';
const EDIT_ERROR_MESSAGE = 'An error occurred while editing the settings';

export const useLocalBranchSettings = () => {
	const [status, setStatus] = useState<any>(request.NONE);
	const [errors, setErrors] = useState<any>([]);
	const [recentRequest, setRecentRequest] = useState<any>();

	const localBranchSettings = useSelector(selectors.selectLocalBranchSettings());
	const getLocalBranchSettings = useActionDispatch(actions.getLocalBranchSettings);
	const editLocalBranchSettings = useActionDispatch(actions.editLocalBranchSettings);

	const reset = () => {
		resetError();
		resetStatus();
	};

	const resetError = () => setErrors([]);

	const resetStatus = () => setStatus(request.NONE);

	const getLocalBranchSettingsRequest = (branchId) => {
		setRecentRequest(types.GET_LOCAL_BRANCH_SETTINGS);
		getLocalBranchSettings({ branchId, callback });
	};

	const editLocalBranchSettingsRequest = (data) => {
		setRecentRequest(types.EDIT_LOCAL_BRANCH_SETTINGS);
		editLocalBranchSettings({
			...data,
			callback: modifiedCallback(callback, EDIT_SUCCESS_MESSAGE, EDIT_ERROR_MESSAGE),
		});
	};

	const callback = ({ status, errors = [] }) => {
		setStatus(status);
		setErrors(errors);
	};

	return {
		localBranchSettings,
		getLocalBranchSettings: getLocalBranchSettingsRequest,
		editLocalBranchSettings: editLocalBranchSettingsRequest,
		status,
		errors,
		recentRequest,
		reset,
		resetStatus,
		resetError,
	};
};
