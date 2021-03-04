import { createAction } from 'redux-actions';

export const key = 'TRANSACTIONS';

export const types = {
	LIST_TRANSACTIONS: `${key}/LIST_TRANSACTIONS`,
};

export const actions = {
	listTransactions: createAction(types.LIST_TRANSACTIONS),
};
