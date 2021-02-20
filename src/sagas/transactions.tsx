import { call, put, select, takeLatest } from 'redux-saga/effects';
import { selectors as branchesSelectors } from '../ducks/OfficeManager/branches';
import { actions, types } from '../ducks/transactions';
import { MAX_PAGE_SIZE } from '../global/constants';
import { request } from '../global/types';
import { service } from '../services/transactions';

/* WORKERS */
function* list({ payload }: any) {
	const { branch_id, callback } = payload;
	callback({ status: request.REQUESTING });

	// Required: Branch must have an online URL (Requested by Office)
	const baseURL = yield select(branchesSelectors.selectURLByBranchId(branch_id));
	if (!baseURL && branch_id) {
		callback({ status: request.ERROR, errors: 'Branch has no online url.' });
		return;
	}

	let data = {
		page: 1,
		page_size: MAX_PAGE_SIZE,
	};

	let isFetchedFromBackupURL = false;

	try {
		let response = null;

		try {
			// Fetch in branch url
			response = yield call(service.list, data, baseURL);
		} catch (e) {
			// Retry to fetch in backup branch url
			const baseBackupURL = yield select(branchesSelectors.selectBackUpURLByBranchId(branch_id));
			if (baseURL && baseBackupURL) {
				try {
					// Fetch branch url
					response = yield call(service.list, data, baseBackupURL);
					isFetchedFromBackupURL = true;
				} catch (e) {
					throw e;
				}
			} else {
				throw e;
			}
		}

		yield put(actions.save({ type: types.LIST_TRANSACTIONS, transactions: response.data.results }));
		callback({ status: request.SUCCESS, isFetchedFromBackupURL });
	} catch (e) {
		callback({ status: request.ERROR, errors: e.errors });
	}
}

/* WATCHERS */

const listWatcherSaga = function* listWatcherSaga() {
	yield takeLatest(types.LIST_TRANSACTIONS, list);
};

export default [listWatcherSaga()];
