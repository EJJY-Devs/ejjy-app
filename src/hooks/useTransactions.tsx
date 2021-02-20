import { useState } from 'react';
import { useSelector } from 'react-redux';
import { actions, selectors, types } from '../ducks/transactions';
import { request } from '../global/types';
import { useActionDispatch } from './useActionDispatch';

export const useTransactions = () => {
	const [status, setStatus] = useState<any>(request.NONE);
	const [errors, setErrors] = useState<any>([]);
	const [warnings, setWarnings] = useState<any>([]);
	const [recentRequest, setRecentRequest] = useState<any>();
	const transactions = useSelector(selectors.selectTransactions());

	const listTransactions = useActionDispatch(actions.listTransactions);

	const reset = () => {
		resetError();
		resetStatus();
	};

	const resetError = () => setErrors([]);

	const resetStatus = () => setStatus(request.NONE);

	const listTransactionsRequest = (branchId) => {
		setRecentRequest(types.LIST_TRANSACTIONS);

		listTransactions({
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
		transactions,
		listTransactions: listTransactionsRequest,
		status,
		errors,
		warnings,
		recentRequest,
		reset,
		resetStatus,
		resetError,
	};
};
