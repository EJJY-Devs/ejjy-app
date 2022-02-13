import { call, put, select, takeLatest } from 'redux-saga/effects';
import { selectors as branchesSelectors } from '../ducks/OfficeManager/branches';
import { actions, types } from '../ducks/cashiering-assignments';
import { IS_APP_LIVE, MAX_PAGE_SIZE } from '../global/constants';
import { request } from '../global/types';
import { service } from '../services/cashiering-assignments';
import { getBaseUrl } from './helper';

/* WORKERS */
function* listByUserId({ payload }: any) {
	const { userId, branchId, callback } = payload;
	callback({ status: request.REQUESTING });

	const baseURL = getBaseUrl(branchId, callback);

	const data = {
		page: 1,
		page_size: MAX_PAGE_SIZE,
		user_id: userId,
	};

	let isFetchedFromBackupURL = false;

	try {
		let response = null;

		try {
			// Fetch in branch url
			response = yield call(service.listByUserId, data, baseURL);
		} catch (e) {
			if (IS_APP_LIVE) {
				// Retry to fetch in backup branch url
				const baseBackupURL = yield select(
					branchesSelectors.selectBackUpURLByBranchId(branchId),
				);
				if (baseURL && baseBackupURL) {
					// Fetch branch url
					response = yield call(service.listByUserId, data, baseBackupURL);
					isFetchedFromBackupURL = true;
				} else {
					throw e;
				}
			}
		}

		yield put(
			actions.save({
				type: types.GET_CASHIERING_ASSIGNMENTS_BY_USER_ID,
				cashieringAssignments: response.data.results,
			}),
		);
		callback({
			status: request.SUCCESS,
			warnings: isFetchedFromBackupURL
				? ['Data Source: Backup Server, data might be outdated.']
				: [],
		});
	} catch (e) {
		callback({ status: request.ERROR, errors: e.errors });
	}
}

function* create({ payload }: any) {
	const { callback, branchId, ...data } = payload;
	callback({ status: request.REQUESTING });

	const baseURL = getBaseUrl(branchId, callback);

	try {
		const response = yield call(service.create, data, baseURL);

		yield put(
			actions.save({
				type: types.CREATE_CASHIERING_ASSIGNMENT,
				cashieringAssignment: response.data,
			}),
		);
		callback({ status: request.SUCCESS });
	} catch (e) {
		callback({ status: request.ERROR, errors: e.errors });
	}
}

function* edit({ payload }: any) {
	const { callback, branchId, ...data } = payload;
	callback({ status: request.REQUESTING });

	const baseURL = getBaseUrl(branchId, callback);

	try {
		const response = yield call(service.edit, data, baseURL);

		yield put(
			actions.save({
				type: types.EDIT_CASHIERING_ASSIGNMENT,
				cashieringAssignment: response.data,
			}),
		);
		callback({ status: request.SUCCESS });
	} catch (e) {
		callback({ status: request.ERROR, errors: e.errors });
	}
}

function* remove({ payload }: any) {
	const { callback, branchId, id } = payload;
	callback({ status: request.REQUESTING });

	const baseURL = getBaseUrl(branchId, callback);

	try {
		yield call(service.remove, id, baseURL);

		yield put(actions.save({ type: types.REMOVE_CASHIERING_ASSIGNMENT, id }));
		callback({ status: request.SUCCESS });
	} catch (e) {
		callback({ status: request.ERROR, errors: e.errors });
	}
}

/* WATCHERS */
const listByUserIdWatcherSaga = function* listByUserIdWatcherSaga() {
	yield takeLatest(types.GET_CASHIERING_ASSIGNMENTS_BY_USER_ID, listByUserId);
};

const createWatcherSaga = function* createWatcherSaga() {
	yield takeLatest(types.CREATE_CASHIERING_ASSIGNMENT, create);
};

const editWatcherSaga = function* editWatcherSaga() {
	yield takeLatest(types.EDIT_CASHIERING_ASSIGNMENT, edit);
};

const removeWatcherSaga = function* removeWatcherSaga() {
	yield takeLatest(types.REMOVE_CASHIERING_ASSIGNMENT, remove);
};

export default [
	listByUserIdWatcherSaga(),
	createWatcherSaga(),
	editWatcherSaga(),
	removeWatcherSaga(),
];
