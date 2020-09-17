import { all } from 'redux-saga/effects';
import authSagas from './auth';
import branchProductsSagas from './branch-products';
import { branchManagerSagas } from './BranchManager';
import { officeManagerSagas } from './OfficeManager';
import purchaseRequestsSagas from './purchase-requests';
import usersSagas from './users';

export default function* rootSaga() {
	yield all([
		...authSagas,
		...branchProductsSagas,
		...purchaseRequestsSagas,
		...usersSagas,
		...officeManagerSagas,
		...branchManagerSagas,
	]);
}
