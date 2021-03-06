import { call, put, select, takeLatest } from 'redux-saga/effects';
import { actions, types } from '../../ducks/OfficeManager/branch-machines';
import { selectors as branchesSelectors } from '../../ducks/OfficeManager/branches';
import { MAX_PAGE_SIZE } from '../../global/constants';
import { request } from '../../global/types';
import { LOCAL_API_URL } from '../../services';
import { service } from '../../services/OfficeManager/branch-machines';

/* WORKERS */
function* list({ payload }: any) {
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
			response = yield call(service.list, data, baseURL || LOCAL_API_URL);
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

		yield put(
			actions.save({ type: types.GET_BRANCH_MACHINES, branchMachines: response.data.results }),
		);
		callback({
			status: request.SUCCESS,
			warnings: isFetchedFromBackupURL ? ['Data was fetched from a backup server.'] : [],
		});
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
		const response = yield call(service.create, data, baseURL || LOCAL_API_URL);

		yield put(actions.save({ type: types.CREATE_BRANCH_MACHINE, branchMachine: response.data }));
		callback({ status: request.SUCCESS, response: response.data });
	} catch (e) {
		callback({ status: request.ERROR, errors: e.errors });
	}
}

function* edit({ payload }: any) {
	const { callback, id, branchId, ...data } = payload;
	callback({ status: request.REQUESTING });

	// Required: Branch must have an online URL (Requested by Office)
	const baseURL = yield select(branchesSelectors.selectURLByBranchId(branchId));
	if (!baseURL && branchId) {
		callback({ status: request.ERROR, errors: 'Branch has no online url.' });
		return;
	}

	try {
		const response = yield call(service.edit, id, data, baseURL || LOCAL_API_URL);

		yield put(actions.save({ type: types.EDIT_BRANCH_MACHINE, branchMachine: response.data }));
		callback({ status: request.SUCCESS, response: response.data });
	} catch (e) {
		callback({ status: request.ERROR, errors: e.errors });
	}
}

/* WATCHERS */
const listWatcherSaga = function* listWatcherSaga() {
	yield takeLatest(types.GET_BRANCH_MACHINES, list);
};

const createWatcherSaga = function* createWatcherSaga() {
	yield takeLatest(types.CREATE_BRANCH_MACHINE, create);
};

const editWatcherSaga = function* editWatcherSaga() {
	yield takeLatest(types.EDIT_BRANCH_MACHINE, edit);
};

export default [listWatcherSaga(), createWatcherSaga(), editWatcherSaga()];
