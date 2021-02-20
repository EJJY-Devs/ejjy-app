import { call, put, retry, select, takeLatest } from 'redux-saga/effects';
import { selectors as branchesSelectors } from '../../ducks/OfficeManager/branches';
import { actions, types } from '../../ducks/OfficeManager/users';
import { MAX_PAGE_SIZE, MAX_RETRY, RETRY_INTERVAL_MS } from '../../global/constants';
import { request } from '../../global/types';
import { ONLINE_API_URL } from '../../services/index';
import { service } from '../../services/OfficeManager/users';

/* WORKERS */
function* listOnline({ payload }: any) {
	const { branchId, callback } = payload;
	callback({ status: request.REQUESTING });

	// Required: Branch must have an online URL (Requested by Office)
	const baseURL = yield select(branchesSelectors.selectURLByBranchId(branchId));
	if (!baseURL && branchId) {
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
			response = yield call(service.listOnline, data, baseURL || ONLINE_API_URL);
		} catch (e) {
			// Retry to fetch in backup branch url
			const baseBackupURL = yield select(branchesSelectors.selectBackUpURLByBranchId(branchId));
			if (baseURL && baseBackupURL) {
				try {
					// Fetch branch url
					response = yield call(service.listOnline, data, baseBackupURL);
					isFetchedFromBackupURL = true;
				} catch (e) {
					throw e;
				}
			} else {
				throw e;
			}
		}

		yield put(actions.save({ type: types.GET_USERS, users: response.data.results }));
		callback({
			status: request.SUCCESS,
			warnings: isFetchedFromBackupURL ? ['Fetched data is outdated.'] : [],
		});
	} catch (e) {
		callback({ status: request.ERROR, errors: e.errors });
	}
}

function* getByIdOnline({ payload }: any) {
	const { id, callback } = payload;
	callback({ status: request.REQUESTING });

	try {
		const response = yield retry(
			MAX_RETRY,
			RETRY_INTERVAL_MS,
			service.getByIdOnline,
			id,
			ONLINE_API_URL,
		);

		yield put(actions.save({ type: types.GET_USER_BY_ID, user: response.data }));
		callback({ status: request.SUCCESS });
	} catch (e) {
		callback({ status: request.ERROR, errors: e.errors });
	}
}

function* createOnline({ payload }: any) {
	const { callback, ...data } = payload;
	callback({ status: request.REQUESTING });

	try {
		const response = yield call(service.createOnline, data, ONLINE_API_URL);

		callback({ status: request.SUCCESS, response: response.data });
	} catch (e) {
		callback({ status: request.ERROR, errors: e.errors, response: e.response });
	}
}

function* editOnline({ payload }: any) {
	const { id, branch_id, callback } = payload;
	callback({ status: request.REQUESTING });

	try {
		const response = yield call(service.editOnline, id, { branch_id }, ONLINE_API_URL);

		yield put(actions.save({ type: types.EDIT_USER, id }));
		callback({ status: request.SUCCESS, response: response.data });
	} catch (e) {
		callback({ status: request.ERROR, errors: e.errors, response: e.response });
	}
}

function* remove({ payload }: any) {
	const { id, callback } = payload;
	callback({ status: request.REQUESTING });

	try {
		const response = yield call(service.removeOnline, id, ONLINE_API_URL);

		yield put(actions.save({ type: types.REMOVE_USER, id }));
		callback({ status: request.SUCCESS, response: response.data });
	} catch (e) {
		callback({ status: request.ERROR, errors: e.errors, response: e.response });
	}
}

/* WATCHERS */
const listOnlineWatcherSaga = function* listOnlineWatcherSaga() {
	yield takeLatest(types.GET_USERS, listOnline);
};

const getByIdOnlineWatcherSaga = function* getByIdOnlineWatcherSaga() {
	yield takeLatest(types.GET_USER_BY_ID, getByIdOnline);
};

const createOnlineWatcherSaga = function* createOnlineWatcherSaga() {
	yield takeLatest(types.CREATE_USER, createOnline);
};

const editOnlineWatcherSaga = function* editOnlineWatcherSaga() {
	yield takeLatest(types.EDIT_USER, editOnline);
};

const removeWatcherSaga = function* removeWatcherSaga() {
	yield takeLatest(types.REMOVE_USER, remove);
};

export default [
	listOnlineWatcherSaga(),
	getByIdOnlineWatcherSaga(),
	createOnlineWatcherSaga(),
	editOnlineWatcherSaga(),
	removeWatcherSaga(),
];
