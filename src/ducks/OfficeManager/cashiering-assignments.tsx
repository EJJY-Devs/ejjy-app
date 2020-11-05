import { cloneDeep } from 'lodash';
import { createAction, handleActions } from 'redux-actions';
import { createSelector } from 'reselect';
import { NOT_FOUND_INDEX } from '../../global/constants';

export const key = 'OM_CASHIERING_ASSIGNMENTS';

export const types = {
	SAVE: `${key}/SAVE`,
	GET_CASHIERING_ASSIGNMENTS_BY_USER_ID: `${key}/GET_CASHIERING_ASSIGNMENTS_BY_USER_ID`,
	CREATE_CASHIERING_ASSIGNMENT: `${key}/CREATE_CASHIERING_ASSIGNMENT`,
	EDIT_CASHIERING_ASSIGNMENT: `${key}/EDIT_CASHIERING_ASSIGNMENT`,
	REMOVE_CASHIERING_ASSIGNMENT: `${key}/REMOVE_CASHIERING_ASSIGNMENT`,
};

const initialState = {
	cashieringAssignments: [],
};

const reducer = handleActions(
	{
		[types.SAVE]: (state, { payload }: any) => {
			const { type } = payload;
			let newData = {};

			switch (type) {
				case types.GET_CASHIERING_ASSIGNMENTS_BY_USER_ID: {
					newData = { cashieringAssignments: payload.cashieringAssignments };
					break;
				}
				case types.CREATE_CASHIERING_ASSIGNMENT: {
					newData = {
						cashieringAssignments: [payload.cashieringAssignment, ...state.cashieringAssignments],
					};
					break;
				}
				case types.EDIT_CASHIERING_ASSIGNMENT: {
					const { cashieringAssignment: editedcashieringAssignment } = payload;
					const index = state.cashieringAssignments.findIndex(
						({ id }) => id === editedcashieringAssignment.id,
					);

					if (index !== NOT_FOUND_INDEX) {
						const cashieringAssignments = cloneDeep(state.cashieringAssignments);
						cashieringAssignments[index] = editedcashieringAssignment;
						newData = { cashieringAssignments };
					}
					break;
				}
				case types.REMOVE_CASHIERING_ASSIGNMENT: {
					newData = {
						cashieringAssignments: state.cashieringAssignments.filter(
							({ id }) => id !== payload.id,
						),
					};
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
	getCashieringAssignmentsByUserId: createAction(types.GET_CASHIERING_ASSIGNMENTS_BY_USER_ID),
	createCashieringAssignment: createAction(types.CREATE_CASHIERING_ASSIGNMENT),
	editCashieringAssignment: createAction(types.EDIT_CASHIERING_ASSIGNMENT),
	removeCashieringAssignment: createAction(types.REMOVE_CASHIERING_ASSIGNMENT),
};

const selectState = (state: any) => state[key] || initialState;
export const selectors = {
	selectCashieringAssignments: () =>
		createSelector(selectState, (state) => state.cashieringAssignments),
};

export default reducer;
