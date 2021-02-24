import { call, put, retry, select, takeLatest } from 'redux-saga/effects';
import { actions, types } from '../../ducks/BranchManager/local-branch-settings';
import { selectors as branchesSelectors } from '../../ducks/OfficeManager/branches';
import { MAX_RETRY, RETRY_INTERVAL_MS } from '../../global/constants';
import { request } from '../../global/types';
import { service } from '../../services/BranchManager/local-branch-settings';
import { LOCAL_API_URL } from '../../services/index';

/* WORKERS */
function* get({ payload }: any) {
	const { branchId, callback } = payload;
	callback({ status: request.REQUESTING });

	// Required: Branch must have an online URL (Requested by Office)
	const baseURL = yield select(branchesSelectors.selectURLByBranchId(branchId));
	if (!baseURL && branchId) {
		callback({ status: request.ERROR, errors: 'Branch has no online url.' });
		return;
	}

	try {
		const response = yield retry(
			MAX_RETRY,
			RETRY_INTERVAL_MS,
			service.get,
			baseURL || LOCAL_API_URL,
		);
		yield put(
			actions.save({
				type: types.GET_LOCAL_BRANCH_SETTINGS,
				localBranchSettings: response.data?.results?.[0],
			}),
		);
		callback({ status: request.SUCCESS });
	} catch (e) {
		callback({ status: request.ERROR, errors: e.errors });
	}
}

function* edit({ payload }: any) {
	const { callback, branchId, id, ...data } = payload;
	callback({ status: request.REQUESTING });

	// Required: Branch must have an online URL (Requested by Office)
	const baseURL = yield select(branchesSelectors.selectURLByBranchId(branchId));
	if (!baseURL && branchId) {
		callback({ status: request.ERROR, errors: 'Branch has no online url.' });
		return;
	}

	try {
		const response = yield call(service.edit, id, data, baseURL || LOCAL_API_URL);
		yield put(
			actions.save({ type: types.EDIT_LOCAL_BRANCH_SETTINGS, localBranchSettings: response.data }),
		);
		callback({ status: request.SUCCESS });
	} catch (e) {
		callback({ status: request.ERROR, errors: e.errors });
	}
}

/* WATCHERS */
const getWatcherSaga = function* getWatcherSaga() {
	yield takeLatest(types.GET_LOCAL_BRANCH_SETTINGS, get);
};

const editWatcherSaga = function* editWatcherSaga() {
	yield takeLatest(types.EDIT_LOCAL_BRANCH_SETTINGS, edit);
};

export default [getWatcherSaga(), editWatcherSaga()];
