import { call, put, retry, select, takeLatest } from 'redux-saga/effects';
import { actions, types } from '../ducks/branch-products';
import { selectors as branchesSelectors } from '../ducks/OfficeManager/branches';
import { MAX_PAGE_SIZE, MAX_RETRY, RETRY_INTERVAL_MS } from '../global/constants';
import { request } from '../global/types';
import { LOCAL_API_URL } from '../services';
import { service } from '../services/branch-products';

/* WORKERS */
function* list({ payload }: any) {
	const { callback } = payload;
	callback({ status: request.REQUESTING });

	try {
		const response = yield retry(
			MAX_RETRY,
			RETRY_INTERVAL_MS,
			service.list,
			{
				page: 1,
				page_size: MAX_PAGE_SIZE,
			},
			LOCAL_API_URL,
		);

		yield put(
			actions.save({ type: types.GET_BRANCH_PRODUCTS, branchProducts: response.data.results }),
		);
		callback({ status: request.SUCCESS });
	} catch (e) {
		callback({ status: request.ERROR, errors: e.errors });
	}
}

function* listByBranch({ payload }: any) {
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
			response = yield call(service.listByBranch, data, baseURL || LOCAL_API_URL);
		} catch (e) {
			// Retry to fetch in backup branch url
			const baseBackupURL = yield select(branchesSelectors.selectBackUpURLByBranchId(branchId));
			if (baseURL && baseBackupURL) {
				try {
					// Fetch branch url
					response = yield call(service.listByBranch, data, baseBackupURL);
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
				type: types.GET_BRANCH_PRODUCTS_BY_BRANCH,
				branchProducts: response.data,
			}),
		);
		callback({ status: request.SUCCESS, isFetchedFromBackupURL });
	} catch (e) {
		callback({ status: request.ERROR, errors: e.errors });
	}
}

function* edit({ payload }: any) {
	const { callback, branch_id, ...data } = payload;
	callback({ status: request.REQUESTING });

	// Required: Branch must have an online URL (Requested by Office)
	const baseURL = yield select(branchesSelectors.selectURLByBranchId(branch_id));
	if (!baseURL && branch_id) {
		callback({ status: request.ERROR, errors: 'Branch has no online url.' });
		return;
	}

	try {
		const response = yield call(service.edit, data, baseURL);

		yield put(actions.save({ type: types.EDIT_BRANCH_PRODUCT, branchProduct: response.data }));
		callback({ status: request.SUCCESS });
	} catch (e) {
		callback({ status: request.ERROR, errors: e.errors });
	}
}
/* WATCHERS */
const listWatcherSaga = function* listWatcherSaga() {
	yield takeLatest(types.GET_BRANCH_PRODUCTS, list);
};

const listByBranchWatcherSaga = function* listByBranchWatcherSaga() {
	yield takeLatest(types.GET_BRANCH_PRODUCTS_BY_BRANCH, listByBranch);
};

const editWatcherSaga = function* editWatcherSaga() {
	yield takeLatest(types.EDIT_BRANCH_PRODUCT, edit);
};

export default [listWatcherSaga(), listByBranchWatcherSaga(), editWatcherSaga()];
