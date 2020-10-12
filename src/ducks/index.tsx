import { connectRouter } from 'connected-react-router';
import { combineReducers } from 'redux';
import storage from 'redux-persist/lib/storage';
import { STORAGE_KEY } from '../configureStore';
import history from '../utils/history';
import authReducer, { key as AUTH_KEY, types } from './auth';
import branchProductsReducer, { key as BRANCH_PRODUCTS_KEY } from './branch-products';
import { branchManagerReducers } from './BranchManager';
import { branchPersonnelReducers } from './BranchPersonnel';
import { officeManagerReducers } from './OfficeManager';
import requisitionSlipsReducer, { key as REQUISITION_SLIP_KEY } from './requisition-slips';
import requestReducer, { REQUEST_KEY } from './request';
import uiReducer, { key as UI_KEY } from './ui';
import usersReducer, { key as USERS_KEY } from './users';

const appReducer = combineReducers({
	router: connectRouter(history),
	[AUTH_KEY]: authReducer,
	[REQUEST_KEY]: requestReducer,
	[BRANCH_PRODUCTS_KEY]: branchProductsReducer,
	[REQUISITION_SLIP_KEY]: requisitionSlipsReducer,
	[USERS_KEY]: usersReducer,
	[UI_KEY]: uiReducer,
	...officeManagerReducers,
	...branchManagerReducers,
	...branchPersonnelReducers,
});

export default (state, action) => {
	if (action.type === types.LOGOUT) {
		storage.removeItem(STORAGE_KEY);
		state = undefined;
	}
	return appReducer(state, action);
};
