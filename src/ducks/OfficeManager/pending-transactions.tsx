import { createAction, handleActions } from 'redux-actions';
import { createSelector } from 'reselect';

export const key = 'PENDING_TRANSACTIONS';

export const types = {
	SAVE: `${key}/SAVE`,
	LIST_PENDING_TRANSACTIONS: `${key}/LIST_PENDING_TRANSACTIONS`,
	CREATE_PENDING_TRANSACTIONS: `${key}/CREATE_PENDING_TRANSACTIONS`,
	EDIT_PENDING_TRANSACTIONS: `${key}/EDIT_PENDING_TRANSACTIONS`,
	REMOVE_PENDING_TRANSACTIONS: `${key}/REMOVE_PENDING_TRANSACTIONS`,
	EXECUTE_PENDING_TRANSACTIONS: `${key}/EXECUTE_PENDING_TRANSACTIONS`,
};

const initialState = {
	pendingTransactions: [],
};

const reducer = handleActions(
	{
		[types.SAVE]: (state, { payload }: any) => {
			const { type } = payload;
			let newData = {};

			switch (type) {
				case types.LIST_PENDING_TRANSACTIONS: {
					newData = { pendingTransactions: payload.pendingTransactions };
					break;
				}
			}

			return { ...state, ...newData };
		},
	},
	initialState,
);

export const actions = {
	save: createAction(types.SAVE),
	listPendingTransactions: createAction(types.LIST_PENDING_TRANSACTIONS),
	createPendingTransactions: createAction(types.CREATE_PENDING_TRANSACTIONS),
	editPendingTransactions: createAction(types.EDIT_PENDING_TRANSACTIONS),
	removePendingTransactions: createAction(types.REMOVE_PENDING_TRANSACTIONS),
	executePendingTransactions: createAction(types.EXECUTE_PENDING_TRANSACTIONS),
};

const selectState = (state: any) => state[key] || initialState;
export const selectors = {
	selectPendingTransactions: () =>
		createSelector(selectState, (state) => state.pendingTransactions),
};

export default reducer;
