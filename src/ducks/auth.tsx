import { createAction, handleActions } from 'redux-actions';
import { createSelector } from 'reselect';

export const key = 'AUTH';

export const types = {
	SAVE: `${key}/SAVE`,
	LOGIN: `${key}/LOGIN`,
	LOGOUT: `${key}/LOGOUT`,
};

const initialState = {
	user: {},
	accessToken: null,
	refreshToken: null,
};

const reducer = handleActions(
	{
		[types.SAVE]: (state, { payload }) => ({
			...state,
			...payload,
		}),
	},
	initialState,
);

export const actions = {
	save: createAction(types.SAVE),
	login: createAction(types.LOGIN),
	logout: createAction(types.LOGOUT),
};

const selectState = (state: any) => state[key] || initialState;
export const selectors = {
	selectUser: () => createSelector(selectState, (state) => state.user),
	selectAccessToken: () => createSelector(selectState, (state) => state.accessToken),
	selectRefreshToken: () => createSelector(selectState, (state) => state.refreshToken),
};

export default reducer;
