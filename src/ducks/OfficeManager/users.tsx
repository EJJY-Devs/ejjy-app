import { createAction, handleActions } from 'redux-actions';
import { createSelector } from 'reselect';

export const key = 'OM_USERS';

export const types = {
	SAVE: `${key}/SAVE`,
	GET_USERS: `${key}/GET_USERS`,
	GET_USER_BY_ID: `${key}/GET_USER_BY_ID`,
	REMOVE_USER: `${key}/REMOVE_USER`,
	EDIT_USER: `${key}/EDIT_USER`,
};

const initialState = {
	users: [],
	user: {},
};

const reducer = handleActions(
	{
		[types.SAVE]: (state, { payload }: any) => {
			const { type } = payload;
			let newData = {};

			switch (type) {
				case types.GET_USERS: {
					newData = { users: payload.users };
					break;
				}
				case types.GET_USER_BY_ID: {
					newData = { user: payload.user };
					break;
				}
				case types.REMOVE_USER: {
					newData = { products: state.users.filter(({ id }) => id !== payload.id) };
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
	getUsers: createAction(types.GET_USERS),
	getUserById: createAction(types.GET_USER_BY_ID),
	removeUser: createAction(types.REMOVE_USER),
	editUser: createAction(types.EDIT_USER),
};

const selectState = (state: any) => state[key] || initialState;
export const selectors = {
	selectUsers: () => createSelector(selectState, (state) => state.users),
	selectUser: () => createSelector(selectState, (state) => state.user),
};

export default reducer;
