import { createAction } from 'redux-actions';

export const key = 'CASHIERING_SESSIONS';

export const types = {
	LIST_SESSIONS: `${key}/LIST_SESSIONS`,
};

export const actions = {
	listSessions: createAction(types.LIST_SESSIONS),
};
