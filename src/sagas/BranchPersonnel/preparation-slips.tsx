import { call, put, takeLatest } from 'redux-saga/effects';
import { actions, types } from '../../ducks/BranchPersonnel/preparation-slips';
import { MAX_PAGE_SIZE } from '../../global/constants';
import { request } from '../../global/types';
import { service } from '../../services/BranchPersonnel/preparation-slips';

/* WORKERS */
function* list({ payload }: any) {
	const {
		purchase_request_id = null,
		assigned_store_id = null,
		assigned_personnel_id,
		callback,
	} = payload;
	callback({ status: request.REQUESTING });

	try {
		const response = yield call(service.list, {
			ordering: 'id',
			page: 1,
			page_size: MAX_PAGE_SIZE,
			purchase_request_id,
			assigned_store_id,
			assigned_personnel_id,
		});

		yield put(actions.save({ type: types.GET_PREPARATION_SLIPS, preparationSlips: response.data }));
		callback({ status: request.SUCCESS });
	} catch (e) {
		callback({ status: request.ERROR, errors: e.errors });
	}
}

function* fulfill({ payload }: any) {
	const { callback, ...data } = payload;
	callback({ status: request.REQUESTING });

	try {
		const response = yield call(service.fulfill, data);

		yield put(
			actions.save({ type: types.FULFILL_PREPARATION_SLIP, preparationSlip: response.data }),
		);
		callback({ status: request.SUCCESS });
	} catch (e) {
		callback({ status: request.ERROR, errors: e.errors });
	}
}

/* WATCHERS */
const listWatcherSaga = function* listesWatcherSaga() {
	yield takeLatest(types.GET_PREPARATION_SLIPS, list);
};

const fulfillWatcherSaga = function* fulfillWatcherSaga() {
	yield takeLatest(types.FULFILL_PREPARATION_SLIP, fulfill);
};

export default [listWatcherSaga(), fulfillWatcherSaga()];
