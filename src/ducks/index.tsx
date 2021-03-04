import { connectRouter } from 'connected-react-router';
import { combineReducers } from 'redux';
import storage from 'redux-persist/lib/storage';
import { APP_KEY } from '../global/constants';
import history from '../utils/history';
import { adminReducers } from './Admin';
import authReducer, { key as AUTH_KEY, types } from './auth';
import branchesDaysReducer, { key as BRANCHES_DAYS_KEY } from './branches-days';
import { branchManagerReducers } from './BranchManager';
import { branchPersonnelReducers } from './BranchPersonnel';
import networkReducer, { key as NETWORK_KEY } from './network';
import { officeManagerReducers } from './OfficeManager';
import requestReducer, { REQUEST_KEY } from './request';
import requisitionSlipsReducer, { key as REQUISITION_SLIP_KEY } from './requisition-slips';
import uiReducer, { key as UI_KEY } from './ui';
import usersReducer, { key as USERS_KEY } from './users';
import xreadReportsReducer, { key as XREAD_REPORTS_KEY } from './xread-reports';

const appReducer = combineReducers({
	router: connectRouter(history),
	[AUTH_KEY]: authReducer,
	[REQUEST_KEY]: requestReducer,
	[REQUISITION_SLIP_KEY]: requisitionSlipsReducer,
	[BRANCHES_DAYS_KEY]: branchesDaysReducer,
	[XREAD_REPORTS_KEY]: xreadReportsReducer,
	[USERS_KEY]: usersReducer,
	[UI_KEY]: uiReducer,
	[NETWORK_KEY]: networkReducer,
	...adminReducers,
	...officeManagerReducers,
	...branchManagerReducers,
	...branchPersonnelReducers,
});

export default (state, action) => {
	if (action.type === types.LOGOUT) {
		storage.removeItem(APP_KEY);
		state = undefined;
	}
	return appReducer(state, action);
};
