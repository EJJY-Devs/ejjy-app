import { call, put, select, takeLatest } from 'redux-saga/effects';
import { selectors as branchesSelectors } from '../../ducks/OfficeManager/branches';
import { actions, types } from '../../ducks/OfficeManager/cashiering-assignments';
import { MAX_PAGE_SIZE } from '../../global/constants';
import { request } from '../../global/types';
import { service } from '../../services/OfficeManager/cashiering-assignments';

/* WORKERS */
function* listByUserId({ payload }: any) {
	const { userId, branchId, callback } = payload;
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
		user_id: userId,
	};

	let isFetchedFromBackupURL = false;

	try {
		let response = null;

		try {
			// Fetch in branch url
			response = yield call(service.listByUserId, data, baseURL);
		} catch (e) {
			// Retry to fetch in backup branch url
			const baseBackupURL = yield select(branchesSelectors.selectBackUpURLByBranchId(branchId));
			if (baseURL && baseBackupURL) {
				try {
					// Fetch branch url
					response = yield call(service.listByUserId, data, baseBackupURL);
					isFetchedFromBackupURL = true;
				} catch (e) {
					throw e;
				}
			} else {
				throw e;
			}
		}

		yield put(
			actions.save({
				type: types.GET_CASHIERING_ASSIGNMENTS_BY_USER_ID,
				cashieringAssignments: response.data.results,
			}),
		);
		callback({ status: request.SUCCESS, isFetchedFromBackupURL });
	} catch (e) {
		callback({ status: request.ERROR, errors: e.errors });
	}
}

function* create({ payload }: any) {
	const { callback, branchId, ...data } = payload;
	callback({ status: request.REQUESTING });

	// Required: Branch must have an online URL (Requested by Office)
	const baseURL = yield select(branchesSelectors.selectURLByBranchId(branchId));
	if (!baseURL && branchId) {
		callback({ status: request.ERROR, errors: 'Branch has no online url.' });
		return;
	}

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

	// Required: Branch must have an online URL (Requested by Office)
	const baseURL = yield select(branchesSelectors.selectURLByBranchId(branchId));
	if (!baseURL && branchId) {
		callback({ status: request.ERROR, errors: 'Branch has no online url.' });
		return;
	}

	try {
		const response = yield call(service.edit, data, baseURL);

		yield put(
			actions.save({ type: types.EDIT_CASHIERING_ASSIGNMENT, cashieringAssignment: response.data }),
		);
		callback({ status: request.SUCCESS });
	} catch (e) {
		callback({ status: request.ERROR, errors: e.errors });
	}
}

function* remove({ payload }: any) {
	const { callback, branchId, id } = payload;
	callback({ status: request.REQUESTING });

	// Required: Branch must have an online URL (Requested by Office)
	const baseURL = yield select(branchesSelectors.selectURLByBranchId(branchId));
	if (!baseURL && branchId) {
		callback({ status: request.ERROR, errors: 'Branch has no online url.' });
		return;
	}

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
