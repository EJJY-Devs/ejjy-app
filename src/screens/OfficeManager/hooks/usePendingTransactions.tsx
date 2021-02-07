import { useState } from 'react';
import { useSelector } from 'react-redux';
import { actions, selectors, types } from '../../../ducks/OfficeManager/pending-transactions';
import { request } from '../../../global/types';
import { useActionDispatch } from '../../../hooks/useActionDispatch';
import { modifiedCallback, modifiedExtraCallback } from '../../../utils/function';

const REMOVE_SUCCESS_MESSAGE = 'Pending transaction was removed successfully';
const REMOVE_ERROR_MESSAGE = 'An error occurred while removing the pending transaction';

const EXECUTE_SUCCESS_MESSAGE = 'Pending transaction was executed successfully';
const EXECUTE_ERROR_MESSAGE = 'An error occurred while executing the pending transaction';

export const usePendingTransactions = () => {
	const [status, setStatus] = useState<any>(request.NONE);
	const [errors, setErrors] = useState<any>([]);
	const [recentRequest, setRecentRequest] = useState<any>();

	const pendingTransactions = useSelector(selectors.selectPendingTransactions());
	const listPendingTransactions = useActionDispatch(actions.listPendingTransactions);
	const createPendingTransactions = useActionDispatch(actions.createPendingTransactions);
	const removePendingTransactions = useActionDispatch(actions.removePendingTransactions);
	const executePendingTransactions = useActionDispatch(actions.executePendingTransactions);

	const reset = () => {
		resetError();
		resetStatus();
	};

	const resetError = () => setErrors([]);

	const resetStatus = () => setStatus(request.NONE);

	const listPendingTransactionsRequest = (data, extraCallback = null) => {
		setRecentRequest(types.LIST_PENDING_TRANSACTIONS);
		listPendingTransactions({
			...data,
			callback: modifiedExtraCallback(callback, extraCallback),
		});
	};

	const createPendingTransactionsRequest = (data, extraCallback = null) => {
		setRecentRequest(types.CREATE_PENDING_TRANSACTIONS);
		createPendingTransactions({
			...data,
			callback: modifiedExtraCallback(callback, extraCallback),
		});
	};

	const executePendingTransactionsRequest = (data, extraCallback = null, showFeedbackMessage) => {
		setRecentRequest(types.EXECUTE_PENDING_TRANSACTIONS);
		executePendingTransactions({
			...data,
			callback: modifiedExtraCallback(
				showFeedbackMessage
					? modifiedCallback(callback, EXECUTE_SUCCESS_MESSAGE, EXECUTE_ERROR_MESSAGE)
					: callback,
				extraCallback,
			),
		});
	};

	const removePendingTransactionsRequest = (data, extraCallback = null, showFeedbackMessage) => {
		setRecentRequest(types.REMOVE_PENDING_TRANSACTIONS);
		removePendingTransactions({
			...data,
			callback: modifiedExtraCallback(
				showFeedbackMessage
					? modifiedCallback(callback, REMOVE_SUCCESS_MESSAGE, REMOVE_ERROR_MESSAGE)
					: callback,
				extraCallback,
			),
		});
	};

	const callback = ({ status, errors = [] }) => {
		setStatus(status);
		setErrors(errors);
	};

	return {
		pendingTransactions,
		listPendingTransactions: listPendingTransactionsRequest,
		createPendingTransactions: createPendingTransactionsRequest,
		removePendingTransactions: removePendingTransactionsRequest,
		executePendingTransactions: executePendingTransactionsRequest,
		status,
		errors,
		recentRequest,
		reset,
		resetStatus,
		resetError,
	};
};
