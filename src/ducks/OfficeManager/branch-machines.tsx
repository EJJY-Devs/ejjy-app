import { cloneDeep } from 'lodash';
import { createAction, handleActions } from 'redux-actions';
import { createSelector } from 'reselect';
import { NOT_FOUND_INDEX } from '../../global/constants';

export const key = 'OM_BRANCH_MACHINES';

export const types = {
	SAVE: `${key}/SAVE`,
	GET_BRANCH_MACHINES: `${key}/GET_BRANCH_MACHINES`,
	CREATE_BRANCH_MACHINE: `${key}/CREATE_BRANCH_MACHINE`,
	EDIT_BRANCH_MACHINE: `${key}/EDIT_BRANCH_MACHINE`,
};

const initialState = {
	branchMachines: [],
};

const reducer = handleActions(
	{
		[types.SAVE]: (state, { payload }: any) => {
			const { type } = payload;
			let newData = {};

			switch (type) {
				case types.GET_BRANCH_MACHINES: {
					newData = { branchMachines: payload.branchMachines };
					break;
				}
				case types.CREATE_BRANCH_MACHINE: {
					newData = { branchMachines: [payload.branchMachine, ...state.branchMachines] };
					break;
				}
				case types.EDIT_BRANCH_MACHINE: {
					const { branchMachine: editedBranchMachine } = payload;
					const index = state.branchMachines.findIndex(({ id }) => id === editedBranchMachine.id);

					if (index !== NOT_FOUND_INDEX) {
						const branchMachines = cloneDeep(state.branchMachines);
						branchMachines[index] = editedBranchMachine;
						newData = { branchMachines };
					}
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
	getBranchMachines: createAction(types.GET_BRANCH_MACHINES),
	createBranchMachine: createAction(types.CREATE_BRANCH_MACHINE),
	editBranchMachine: createAction(types.EDIT_BRANCH_MACHINE),
};

const selectState = (state: any) => state[key] || initialState;
export const selectors = {
	selectBranchMachines: () => createSelector(selectState, (state) => state.branchMachines),
};

export default reducer;
