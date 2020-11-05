import { all } from 'redux-saga/effects';
import authSagas from './auth';
import branchProductsSagas from './branch-products';
import { branchManagerSagas } from './BranchManager';
import { branchPersonnelSagas } from './BranchPersonnel';
import { officeManagerSagas } from './OfficeManager';
import requisitionSlipsSagas from './requisition-slips';

export default function* rootSaga() {
	yield all([
		...authSagas,
		...branchProductsSagas,
		...requisitionSlipsSagas,
		...officeManagerSagas,
		...branchManagerSagas,
		...branchPersonnelSagas,
	]);
}
