/* eslint-disable eqeqeq */
import { cloneDeep } from 'lodash';
import { createAction, handleActions } from 'redux-actions';
import { createSelector } from 'reselect';
import { NOT_FOUND_INDEX } from '../../global/constants';

export const key = 'OM_BRANCHES';

export const types = {
	SAVE: `${key}/SAVE`,
	GET_BRANCHES: `${key}/GET_BRANCHES`,
	GET_BRANCH: `${key}/GET_BRANCH`,
	CREATE_BRANCH: `${key}/CREATE_BRANCH`,
	EDIT_BRANCH: `${key}/EDIT_BRANCH`,
	REMOVE_BRANCH: `${key}/REMOVE_BRANCH`,
};

const initialState = {
	branches: [],
	branch: {},
};

const reducer = handleActions(
	{
		[types.SAVE]: (state, { payload }: any) => {
			const { type } = payload;
			let newData = {};

			switch (type) {
				case types.GET_BRANCHES: {
					newData = { branches: payload.branches };
					break;
				}
				case types.GET_BRANCH: {
					newData = { branch: payload.branch };
					break;
				}
				case types.CREATE_BRANCH: {
					newData = { branches: [payload.branch, ...state.branches] };
					break;
				}
				case types.EDIT_BRANCH: {
					const { branch: editedBranch } = payload;
					const index = state.branches.findIndex(({ id }) => id === editedBranch.id);

					if (index !== NOT_FOUND_INDEX) {
						const branches = cloneDeep(state.branches);
						branches[index] = editedBranch;
						newData = { branches };
					}
					break;
				}
				case types.REMOVE_BRANCH: {
					newData = { branches: state.branches.filter(({ id }) => id !== payload.id) };
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
	getBranch: createAction(types.GET_BRANCH),
	getBranches: createAction(types.GET_BRANCHES),
	createBranch: createAction(types.CREATE_BRANCH),
	editBranch: createAction(types.EDIT_BRANCH),
	removeBranch: createAction(types.REMOVE_BRANCH),
};

const selectState = (state: any) => state[key] || initialState;
export const selectors = {
	selectBranches: () => createSelector(selectState, (state) => state.branches),
	selectBranchById: (id) =>
		createSelector(selectState, (state) => state.branches.find((branch) => branch.id == id)),
	selectURLByBranchId: (id) =>
		createSelector(
			selectState,
			(state) => state.branches.find((branch) => branch.id == id)?.online_url ?? undefined,
		),
};

export default reducer;
