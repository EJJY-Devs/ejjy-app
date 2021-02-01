import { call, put, retry, takeLatest } from 'redux-saga/effects';
import { actions, types } from '../../ducks/BranchPersonnel/preparation-slips';
import { MAX_PAGE_SIZE, MAX_RETRY, RETRY_INTERVAL_MS } from '../../global/constants';
import { request } from '../../global/types';
import { ONLINE_API_URL } from '../../services';
import { service } from '../../services/BranchPersonnel/preparation-slips';

/* WORKERS */
function* list({ payload }: any) {
	const {
		requisition_slip_id = null,
		assigned_store_id = null,
		assigned_personnel_id,
		callback,
	} = payload;
	callback({ status: request.REQUESTING });

	try {
		const response = yield retry(
			MAX_RETRY,
			RETRY_INTERVAL_MS,
			service.list,
			{
				ordering: 'id',
				page: 1,
				page_size: MAX_PAGE_SIZE,
				requisition_slip_id,
				assigned_store_id,
				assigned_personnel_id,
			},
			ONLINE_API_URL,
		);

		yield put(actions.save({ type: types.GET_PREPARATION_SLIPS, preparationSlips: response.data }));
		callback({ status: request.SUCCESS });
	} catch (e) {
		callback({ status: request.ERROR, errors: e.errors });
	}
}

function* getById({ payload }: any) {
	const { id, assigned_personnel_id, callback } = payload;
	callback({ status: request.REQUESTING });

	try {
		const response = yield retry(
			MAX_RETRY,
			RETRY_INTERVAL_MS,
			service.getById,
			id,
			{ assigned_personnel_id },
			ONLINE_API_URL,
		);

		yield put(
			actions.save({ type: types.GET_PREPARATION_SLIP_BY_ID, preparationSlip: response.data }),
		);
		callback({ status: request.SUCCESS });
	} catch (e) {
		callback({ status: request.ERROR, errors: e.errors });
	}
}

function* fulfill({ payload }: any) {
	const { callback, ...data } = payload;
	callback({ status: request.REQUESTING });

	try {
		const response = yield call(service.fulfill, data, ONLINE_API_URL);

		yield put(
			actions.save({ type: types.FULFILL_PREPARATION_SLIP, preparationSlip: response.data }),
		);
		callback({ status: request.SUCCESS });
	} catch (e) {
		callback({ status: request.ERROR, errors: e.errors });
	}
}

/* WATCHERS */
const listWatcherSaga = function* listWatcherSaga() {
	yield takeLatest(types.GET_PREPARATION_SLIPS, list);
};

const getByIdWatcherSaga = function* getByIdWatcherSaga() {
	yield takeLatest(types.GET_PREPARATION_SLIP_BY_ID, getById);
};

const fulfillWatcherSaga = function* fulfillWatcherSaga() {
	yield takeLatest(types.FULFILL_PREPARATION_SLIP, fulfill);
};

export default [listWatcherSaga(), getByIdWatcherSaga(), fulfillWatcherSaga()];
