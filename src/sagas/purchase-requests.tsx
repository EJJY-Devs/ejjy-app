import { call, put, takeLatest } from 'redux-saga/effects';
import { actions, types } from '../ducks/purchase-requests';
import { MAX_PAGE_SIZE } from '../global/constants';
import { request } from '../global/types';
import { service } from '../services/purchase-requests';

/* WORKERS */
function* list({ payload }: any) {
	const { callback } = payload;
	callback({ status: request.REQUESTING });

	try {
		const response = yield call(service.list, {
			page: 1,
			page_size: MAX_PAGE_SIZE,
		});

		yield put(
			actions.save({ type: types.GET_PURCHASE_REQUESTS, purchaseRequests: response.data.results }),
		);
		callback({ status: request.SUCCESS });
	} catch (e) {
		callback({ status: request.ERROR, errors: e.errors });
	}
}

function* listExtended({ payload }: any) {
	const { callback } = payload;
	callback({ status: request.REQUESTING });

	try {
		const response = yield call(service.listExtended, {
			page: 1,
			page_size: MAX_PAGE_SIZE,
		});

		yield put(
			actions.save({
				type: types.GET_PURCHASE_REQUESTS_EXTENDED,
				purchaseRequests: response.data.results,
			}),
		);
		callback({ status: request.SUCCESS });
	} catch (e) {
		callback({ status: request.ERROR, errors: e.errors });
	}
}

function* getByIdAndBranch({ payload }: any) {
	const { id, branchId, callback } = payload;
	callback({ status: request.REQUESTING });

	try {
		const response = yield call(service.getByIdAndBranch, { preparing_branch_id: branchId }, id);

		yield put(
			actions.save({
				type: types.GET_PURCHASE_REQUEST_BY_ID_AND_BRANCH,
				branchId,
				purchaseRequest: response.data,
			}),
		);
		callback({ status: request.SUCCESS });
	} catch (e) {
		callback({ status: request.ERROR, errors: e.errors });
	}
}

function* getById({ payload }: any) {
	const { id, callback } = payload;
	yield put(
		actions.save({
			type: types.GET_PURCHASE_REQUEST_BY_ID,
			purchaseRequest: null,
		}),
	);

	callback({ status: request.REQUESTING });

	try {
		const response = yield call(service.getById, id);

		yield put(
			actions.save({
				type: types.GET_PURCHASE_REQUEST_BY_ID,
				purchaseRequest: response.data,
			}),
		);
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

		yield put(
			actions.save({ type: types.CREATE_PURCHASE_REQUEST, purchaseRequest: response.data }),
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

		yield put(actions.save({ type: types.EDIT_PURCHASE_REQUEST, purchaseRequest: response.data }));
		callback({ status: request.SUCCESS });
	} catch (e) {
		callback({ status: request.ERROR, errors: e.errors });
	}
}

/* WATCHERS */
const listWatcherSaga = function* listWatcherSaga() {
	yield takeLatest(types.GET_PURCHASE_REQUESTS, list);
};

const listExtendedWatcherSaga = function* listExtendedWatcherSaga() {
	yield takeLatest(types.GET_PURCHASE_REQUESTS_EXTENDED, listExtended);
};

const getByIdWatcherSaga = function* getByIdWatcherSaga() {
	yield takeLatest(types.GET_PURCHASE_REQUEST_BY_ID, getById);
};

const getByIdAndBranchWatcherSaga = function* getByIdAndBranchWatcherSaga() {
	yield takeLatest(types.GET_PURCHASE_REQUEST_BY_ID_AND_BRANCH, getByIdAndBranch);
};

const createWatcherSaga = function* createWatcherSaga() {
	yield takeLatest(types.CREATE_PURCHASE_REQUEST, create);
};

const editWatcherSaga = function* editWatcherSaga() {
	yield takeLatest(types.EDIT_PURCHASE_REQUEST, edit);
};

export default [
	listWatcherSaga(),
	listExtendedWatcherSaga(),
	getByIdWatcherSaga(),
	getByIdAndBranchWatcherSaga(),
	createWatcherSaga(),
	editWatcherSaga(),
];
