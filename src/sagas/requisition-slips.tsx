import { call, put, retry, takeLatest } from 'redux-saga/effects';
import { actions, types } from '../ducks/requisition-slips';
import { MAX_PAGE_SIZE, MAX_RETRY, RETRY_INTERVAL_MS } from '../global/constants';
import { request } from '../global/types';
import { service } from '../services/requisition-slips';

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
			actions.save({ type: types.GET_REQUISITION_SLIPS, requisitionSlips: response.data.results }),
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
		const response = yield retry(MAX_RETRY, RETRY_INTERVAL_MS, service.listExtended, {
			page: 1,
			page_size: MAX_PAGE_SIZE,
		});

		yield put(
			actions.save({
				type: types.GET_REQUISITION_SLIPS_EXTENDED,
				requisitionSlips: response.data.results,
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
		const response = yield retry(
			MAX_RETRY,
			RETRY_INTERVAL_MS,
			service.getByIdAndBranch,
			{ preparing_branch_id: branchId },
			id,
		);

		yield put(
			actions.save({
				type: types.GET_REQUISITION_SLIP_BY_ID_AND_BRANCH,
				branchId,
				requisitionSlip: response.data,
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
			type: types.GET_REQUISITION_SLIP_BY_ID,
			requisitionSlip: null,
		}),
	);

	callback({ status: request.REQUESTING });

	try {
		const response = yield retry(MAX_RETRY, RETRY_INTERVAL_MS, service.getById, id);

		yield put(
			actions.save({
				type: types.GET_REQUISITION_SLIP_BY_ID,
				requisitionSlip: response.data,
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
			actions.save({ type: types.CREATE_REQUISITION_SLIP, requisitionSlip: response.data }),
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

		yield put(actions.save({ type: types.EDIT_REQUISITION_SLIP, requisitionSlip: response.data }));
		callback({ status: request.SUCCESS });
	} catch (e) {
		callback({ status: request.ERROR, errors: e.errors });
	}
}

/* WATCHERS */
const listWatcherSaga = function* listWatcherSaga() {
	yield takeLatest(types.GET_REQUISITION_SLIPS, list);
};

const listExtendedWatcherSaga = function* listExtendedWatcherSaga() {
	yield takeLatest(types.GET_REQUISITION_SLIPS_EXTENDED, listExtended);
};

const getByIdWatcherSaga = function* getByIdWatcherSaga() {
	yield takeLatest(types.GET_REQUISITION_SLIP_BY_ID, getById);
};

const getByIdAndBranchWatcherSaga = function* getByIdAndBranchWatcherSaga() {
	yield takeLatest(types.GET_REQUISITION_SLIP_BY_ID_AND_BRANCH, getByIdAndBranch);
};

const createWatcherSaga = function* createWatcherSaga() {
	yield takeLatest(types.CREATE_REQUISITION_SLIP, create);
};

const editWatcherSaga = function* editWatcherSaga() {
	yield takeLatest(types.EDIT_REQUISITION_SLIP, edit);
};

export default [
	listWatcherSaga(),
	listExtendedWatcherSaga(),
	getByIdWatcherSaga(),
	getByIdAndBranchWatcherSaga(),
	createWatcherSaga(),
	editWatcherSaga(),
];
