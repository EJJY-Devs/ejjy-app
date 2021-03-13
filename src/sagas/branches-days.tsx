import { call, put, select, takeLatest } from 'redux-saga/effects';
import { actions, types } from '../ducks/branches-days';
import { selectors as branchesSelectors } from '../ducks/OfficeManager/branches';
import { IS_APP_LIVE, MAX_PAGE_SIZE } from '../global/constants';
import { request } from '../global/types';
import { LOCAL_API_URL } from '../services';
import { service } from '../services/branches-days';

/* WORKERS */
function* list({ payload }: any) {
	const { page, pageSize, branchId, callback } = payload;
	callback({ status: request.REQUESTING });

	// Required: Branch must have an online URL (Requested by Office)
	const baseURL = yield select(branchesSelectors.selectURLByBranchId(branchId));
	if (!baseURL && branchId) {
		callback({ status: request.ERROR, errors: 'Branch has no online url.' });
		return;
	}

	let data = {
		page,
		page_size: pageSize,
	};

	let isFetchedFromBackupURL = false;

	try {
		let response = null;

		try {
			// Fetch in branch url
			response = yield call(service.list, data, IS_APP_LIVE ? baseURL : LOCAL_API_URL);
		} catch (e) {
			// Retry to fetch in backup branch url
			const baseBackupURL = yield select(branchesSelectors.selectBackUpURLByBranchId(branchId));
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

		callback({
			status: request.SUCCESS,
			warnings: isFetchedFromBackupURL ? ['Data was fetched from a backup server.'] : [],
			data: response.data,
		});
	} catch (e) {
		callback({ status: request.ERROR, errors: e.errors });
	}
}

function* getBranchDay({ payload }: any) {
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
			response = yield call(service.get, data, IS_APP_LIVE ? baseURL : LOCAL_API_URL);
		} catch (e) {
			// Retry to fetch in backup branch url
			const baseBackupURL = yield select(branchesSelectors.selectBackUpURLByBranchId(branch_id));
			if (baseURL && baseBackupURL) {
				try {
					// Fetch branch url
					response = yield call(service.get, data, baseBackupURL);
					isFetchedFromBackupURL = true;
				} catch (e) {
					throw e;
				}
			} else {
				throw e;
			}
		}

		yield put(actions.save({ type: types.GET_BRANCH_DAY, branchDay: response.data }));
		callback({
			status: request.SUCCESS,
			warnings: isFetchedFromBackupURL ? ['Data was fetched from a backup server.'] : [],
		});
	} catch (e) {
		callback({ status: request.ERROR, errors: e.errors });
	}
}

function* create({ payload }: any) {
	const { callback, branch_id, started_by_id } = payload;
	callback({ status: request.REQUESTING });

	// Required: Branch must have an online URL (Requested by Office)
	const baseURL = yield select(branchesSelectors.selectURLByBranchId(branch_id));
	if (!baseURL && branch_id) {
		callback({ status: request.ERROR, errors: 'Branch has no online url.' });
		return;
	}

	try {
		const response = yield call(
			service.create,
			{ started_by_id },
			IS_APP_LIVE ? baseURL : LOCAL_API_URL,
		);

		yield put(actions.save({ type: types.CREATE_BRANCH_DAY, branchDay: response.data }));
		callback({ status: request.SUCCESS });
	} catch (e) {
		callback({ status: request.ERROR, errors: e.errors });
	}
}

function* edit({ payload }: any) {
	const { callback, id, ended_by_id, branch_id } = payload;
	callback({ status: request.REQUESTING });

	// Required: Branch must have an online URL (Requested by Office)
	const baseURL = yield select(branchesSelectors.selectURLByBranchId(branch_id));
	if (!baseURL && branch_id) {
		callback({ status: request.ERROR, errors: 'Branch has no online url.' });
		return;
	}

	try {
		const response = yield call(
			service.edit,
			id,
			{ ended_by_id },
			IS_APP_LIVE ? baseURL : LOCAL_API_URL,
		);

		yield put(actions.save({ type: types.EDIT_BRANCH_DAY, branchDay: response.data }));
		callback({ status: request.SUCCESS });
	} catch (e) {
		callback({ status: request.ERROR, errors: e.errors });
	}
}

/* WATCHERS */
const listWatcherSaga = function* listWatcherSaga() {
	yield takeLatest(types.LIST_BRANCH_DAYS, list);
};

const getBranchDayWatcherSaga = function* getBranchDayWatcherSaga() {
	yield takeLatest(types.GET_BRANCH_DAY, getBranchDay);
};

const createWatcherSaga = function* createWatcherSaga() {
	yield takeLatest(types.CREATE_BRANCH_DAY, create);
};

const editWatcherSaga = function* editWatcherSaga() {
	yield takeLatest(types.EDIT_BRANCH_DAY, edit);
};

export default [
	listWatcherSaga(),
	getBranchDayWatcherSaga(),
	createWatcherSaga(),
	editWatcherSaga(),
];
