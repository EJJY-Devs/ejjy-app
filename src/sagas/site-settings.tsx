import { call, retry, select, takeLatest } from 'redux-saga/effects';
import { selectors as branchesSelectors } from '../ducks/OfficeManager/branches';
import { types } from '../ducks/site-settings';
import { IS_APP_LIVE, MAX_RETRY, RETRY_INTERVAL_MS } from '../global/constants';
import { request } from '../global/types';
import { service } from '../services/site-settings';
import { getLocalIpAddress } from '../utils/function';

/* WORKERS */
function* get({ payload }: any) {
	const { branchId, callback } = payload;
	callback({ status: request.REQUESTING });

	const localURL = getLocalIpAddress();

	// Required: Branch must have an online URL (Requested by Office)
	const baseURL = yield select(branchesSelectors.selectURLByBranchId(branchId));
	if (!baseURL && branchId) {
		callback({ status: request.ERROR, errors: 'Branch has no online url.' });
		return;
	}

	try {
		const { data } = yield retry(
			MAX_RETRY,
			RETRY_INTERVAL_MS,
			service.get,
			IS_APP_LIVE ? baseURL : localURL,
		);

		callback({ status: request.SUCCESS, data });
	} catch (e) {
		callback({ status: request.ERROR, errors: e.errors });
	}
}

function* edit({ payload }: any) {
	const { callback, branchId, id, ...editData } = payload;
	callback({ status: request.REQUESTING });

	const localURL = getLocalIpAddress();

	// Required: Branch must have an online URL (Requested by Office)
	const baseURL = yield select(branchesSelectors.selectURLByBranchId(branchId));
	if (!baseURL && branchId) {
		callback({ status: request.ERROR, errors: 'Branch has no online url.' });
		return;
	}

	try {
		const { data } = yield call(
			service.edit,
			id,
			editData,
			IS_APP_LIVE ? baseURL : localURL,
		);
		callback({ status: request.SUCCESS, data });
	} catch (e) {
		callback({ status: request.ERROR, errors: e.errors });
	}
}

/* WATCHERS */
const getWatcherSaga = function* getWatcherSaga() {
	yield takeLatest(types.GET_SITE_SETTINGS, get);
};

const editWatcherSaga = function* editWatcherSaga() {
	yield takeLatest(types.EDIT_SITE_SETTINGS, edit);
};

export default [getWatcherSaga(), editWatcherSaga()];