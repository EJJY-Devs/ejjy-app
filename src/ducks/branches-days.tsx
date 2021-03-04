import { createAction, handleActions } from 'redux-actions';
import { createSelector } from 'reselect';

export const key = 'BM_BRANCHES_DAYS';

export const types = {
	SAVE: `${key}/SAVE`,
	LIST_BRANCH_DAYS: `${key}/LIST_BRANCH_DAYS`,
	GET_BRANCH_DAY: `${key}/GET_BRANCH_DAY`,
	CREATE_BRANCH_DAY: `${key}/CREATE_BRANCH_DAY`,
	EDIT_BRANCH_DAY: `${key}/EDIT_BRANCH_DAY`,
};

const initialState = {
	branchDay: null,
};

const reducer = handleActions(
	{
		[types.SAVE]: (state, { payload }: any) => {
			const { type } = payload;
			let newData = {};

			switch (type) {
				case types.GET_BRANCH_DAY:
				case types.CREATE_BRANCH_DAY:
				case types.EDIT_BRANCH_DAY: {
					newData = { branchDay: payload.branchDay };
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
	listBranchDays: createAction(types.LIST_BRANCH_DAYS),
	getBranchDay: createAction(types.GET_BRANCH_DAY),
	createBranchDay: createAction(types.CREATE_BRANCH_DAY),
	editBranchDay: createAction(types.EDIT_BRANCH_DAY),
};

const selectState = (state: any) => state[key] || initialState;
export const selectors = {
	selectBranchDay: () => createSelector(selectState, (state) => state.branchDay),
};

export default reducer;
