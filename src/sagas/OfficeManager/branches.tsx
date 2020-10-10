import { call, put, retry, takeLatest } from 'redux-saga/effects';
import {
	actions as branchProductsActions,
	types as branchProductsTypes,
} from '../../ducks/branch-products';
import { actions, types } from '../../ducks/OfficeManager/branches';
import { MAX_PAGE_SIZE, MAX_RETRY, RETRY_INTERVAL_MS } from '../../global/constants';
import { request } from '../../global/types';
import { service as branchProductsService } from '../../services/branch-products';
import { service } from '../../services/OfficeManager/branches';

/* WORKERS */
function* list({ payload }: any) {
	const { withBranchProducts = true, callback } = payload;
	callback({ status: request.REQUESTING });

	try {
		const branchesResponse = yield retry(MAX_RETRY, RETRY_INTERVAL_MS, service.list, {
			page: 1,
			page_size: MAX_PAGE_SIZE,
		});

		// Side Effect: Fetch branch products
		if (withBranchProducts) {
			const branchProductsResponse = yield call(branchProductsService.list, {
				page: 1,
				page_size: MAX_PAGE_SIZE,
			});

			yield put(
				branchProductsActions.save({
					type: branchProductsTypes.GET_BRANCH_PRODUCTS,
					branchProducts: branchProductsResponse.data.results,
				}),
			);
		}

		yield put(actions.save({ type: types.GET_BRANCHES, branches: branchesResponse.data.results }));
		callback({ status: request.SUCCESS });
	} catch (e) {
		callback({ status: request.ERROR, errors: e.errors });
	}
}

function* getById({ payload }: any) {
	const { id, callback } = payload;
	callback({ status: request.REQUESTING });

	try {
		const response = yield retry(MAX_RETRY, RETRY_INTERVAL_MS, service.getById, id);

		yield put(actions.save({ type: types.GET_BRANCH, branch: response.data.results }));
		callback({ status: request.SUCCESS });
	} catch (e) {
		callback({ status: request.ERROR, errors: e.errors });
	}
}

function* create({ payload }: any) {
	const { callback, ...data } = payload;
	callback({ status: request.REQUESTING });

	try {
		const response = yield call(service.create, data);

		yield put(actions.save({ type: types.CREATE_BRANCH, branch: response.data }));
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

		yield put(actions.save({ type: types.EDIT_BRANCH, branch: response.data }));
		callback({ status: request.SUCCESS });
	} catch (e) {
		callback({ status: request.ERROR, errors: e.errors });
	}
}

function* remove({ payload }: any) {
	const { callback, id } = payload;
	callback({ status: request.REQUESTING });

	try {
		yield call(service.remove, id);

		yield put(actions.save({ type: types.REMOVE_BRANCH, id }));
		callback({ status: request.SUCCESS });
	} catch (e) {
		callback({ status: request.ERROR, errors: e.errors });
	}
}

/* WATCHERS */
const listWatcherSaga = function* listWatcherSaga() {
	yield takeLatest(types.GET_BRANCHES, list);
};

const getByIdWatcherSaga = function* getByIdesWatcherSaga() {
	yield takeLatest(types.GET_BRANCH, getById);
};

const createWatcherSaga = function* createWatcherSaga() {
	yield takeLatest(types.CREATE_BRANCH, create);
};

const editWatcherSaga = function* editWatcherSaga() {
	yield takeLatest(types.EDIT_BRANCH, edit);
};

const removeWatcherSaga = function* removeWatcherSaga() {
	yield takeLatest(types.REMOVE_BRANCH, remove);
};

export default [
	getByIdWatcherSaga(),
	listWatcherSaga(),
	createWatcherSaga(),
	editWatcherSaga(),
	removeWatcherSaga(),
];
