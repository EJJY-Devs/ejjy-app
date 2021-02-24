import { createAction, handleActions } from 'redux-actions';
import { createSelector } from 'reselect';

export const key = 'BM_LOCAL_BRANCH_SETTINGS';

export const types = {
	SAVE: `${key}/SAVE`,
	GET_LOCAL_BRANCH_SETTINGS: `${key}/GET_LOCAL_BRANCH_SETTINGS`,
	EDIT_LOCAL_BRANCH_SETTINGS: `${key}/EDIT_LOCAL_BRANCH_SETTINGS`,
};

const initialState = {
	localBranchSettings: {},
};

const reducer = handleActions(
	{
		[types.SAVE]: (state, { payload }: any) => {
			const { type } = payload;
			let newData = {};

			switch (type) {
				case types.GET_LOCAL_BRANCH_SETTINGS:
				case types.EDIT_LOCAL_BRANCH_SETTINGS: {
					newData = { localBranchSettings: payload.localBranchSettings };
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
	getLocalBranchSettings: createAction(types.GET_LOCAL_BRANCH_SETTINGS),
	editLocalBranchSettings: createAction(types.EDIT_LOCAL_BRANCH_SETTINGS),
};

const selectState = (state: any) => state[key] || initialState;
export const selectors = {
	selectLocalBranchSettings: () =>
		createSelector(selectState, (state) => state.localBranchSettings),
};

export default reducer;
