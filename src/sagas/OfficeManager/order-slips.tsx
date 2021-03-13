import { call, put, retry, takeLatest } from 'redux-saga/effects';
import { actions, types } from '../../ducks/order-slips';
import { actions as requisitionSlipActions } from '../../ducks/requisition-slips';
import { MAX_PAGE_SIZE, MAX_RETRY, RETRY_INTERVAL_MS } from '../../global/constants';
import { request } from '../../global/types';
import { service } from '../../services/order-slips';
import { ONLINE_API_URL } from '../../services/index';

/* WORKERS */
function* list({ payload }: any) {
	const { requisition_slip_id = null, assigned_store_id = null, callback } = payload;
	callback({ status: request.REQUESTING });

	try {
		const response = yield retry(
			MAX_RETRY,
			RETRY_INTERVAL_MS,
			service.list,
			{
				page: 1,
				page_size: MAX_PAGE_SIZE,
				requisition_slip_id,
				assigned_store_id,
			},
			ONLINE_API_URL,
		);

		yield put(actions.save({ type: types.GET_ORDER_SLIPS, orderSlips: response.data.results }));
		callback({ status: request.SUCCESS });
	} catch (e) {
		callback({ status: request.ERROR, errors: e.errors });
	}
}

function* listExtended({ payload }: any) {
	const {
		page,
		pageSize,
		requisition_slip_id = null,
		assigned_store_id = null,
		callback,
	} = payload;
	callback({ status: request.REQUESTING });

	try {
		const response = yield retry(
			MAX_RETRY,
			RETRY_INTERVAL_MS,
			service.listExtended,
			{
				page,
				page_size: pageSize,
				requisition_slip_id,
				assigned_store_id,
			},
			ONLINE_API_URL,
		);

		callback({ status: request.SUCCESS, data: response.data });
	} catch (e) {
		callback({ status: request.ERROR, errors: e.errors });
	}
}

function* create({ payload }: any) {
	const { callback, ...data } = payload;
	callback({ status: request.REQUESTING });

	try {
		const response = yield call(service.create, data, ONLINE_API_URL);

		yield put(actions.save({ type: types.CREATE_ORDER_SLIP, orderSlip: response.data }));
		yield put(requisitionSlipActions.removeRequisitionSlipByBranch());
		callback({ status: request.SUCCESS });
	} catch (e) {
		callback({ status: request.ERROR, errors: e.errors });
	}
}

function* edit({ payload }: any) {
	const { callback, ...data } = payload;
	callback({ status: request.REQUESTING });

	try {
		const response = yield call(service.edit, data, ONLINE_API_URL);

		yield put(actions.save({ type: types.EDIT_ORDER_SLIP, orderSlip: response.data }));
		yield put(requisitionSlipActions.removeRequisitionSlipByBranch());
		callback({ status: request.SUCCESS });
	} catch (e) {
		callback({ status: request.ERROR, errors: e.errors });
	}
}

function* remove({ payload }: any) {
	const { callback, id } = payload;
	callback({ status: request.REQUESTING });

	try {
		yield call(service.remove, id, ONLINE_API_URL);

		yield put(actions.save({ type: types.REMOVE_ORDER_SLIP, id }));
		callback({ status: request.SUCCESS });
	} catch (e) {
		callback({ status: request.ERROR, errors: e.errors });
	}
}

/* WATCHERS */
const listWatcherSaga = function* listWatcherSaga() {
	yield takeLatest(types.GET_ORDER_SLIPS, list);
};

const listExtendedWatcherSaga = function* listExtendedWatcherSaga() {
	yield takeLatest(types.GET_ORDER_SLIPS_EXTENDED, listExtended);
};

const createWatcherSaga = function* createWatcherSaga() {
	yield takeLatest(types.CREATE_ORDER_SLIP, create);
};

const editWatcherSaga = function* editWatcherSaga() {
	yield takeLatest(types.EDIT_ORDER_SLIP, edit);
};

const removeWatcherSaga = function* removeWatcherSaga() {
	yield takeLatest(types.REMOVE_ORDER_SLIP, remove);
};

export default [
	listWatcherSaga(),
	listExtendedWatcherSaga(),
	createWatcherSaga(),
	editWatcherSaga(),
	removeWatcherSaga(),
];
