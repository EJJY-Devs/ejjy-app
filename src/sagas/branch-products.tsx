import { call, put, retry, takeLatest } from 'redux-saga/effects';
import { actions, types } from '../ducks/branch-products';
import { MAX_PAGE_SIZE, MAX_RETRY, RETRY_INTERVAL_MS } from '../global/constants';
import { request } from '../global/types';
import { service } from '../services/branch-products';

/* WORKERS */
function* list({ payload }: any) {
	const { callback } = payload;
	callback({ status: request.REQUESTING });

	try {
		const response = yield retry(MAX_RETRY, RETRY_INTERVAL_MS, service.list, {
			page: 1,
			page_size: MAX_PAGE_SIZE,
		});

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

	try {
		const response = yield retry(MAX_RETRY, RETRY_INTERVAL_MS, service.listByBranch, {
			page: 1,
			page_size: MAX_PAGE_SIZE,
			branch_id: branchId,
		});

		yield put(
			actions.save({
				type: types.GET_BRANCH_PRODUCTS_BY_BRANCH,
				branchProducts: response.data,
			}),
		);
		callback({ status: request.SUCCESS });
	} catch (e) {
		callback({ status: request.ERROR, errors: e.errors });
	}
}

function* edit({ payload }: any) {
	const { callback, ...data } = payload;
	callback({ status: request.REQUESTING });

	try {
		const response = yield call(service.edit, data);

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
