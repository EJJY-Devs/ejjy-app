import { call, put, retry, takeLatest } from 'redux-saga/effects';
import { getOnlineApiUrl } from 'utils';
import { actions, types } from '../../ducks/BranchManager/delivery-receipts';
import { actions as orderSlipActions } from '../../ducks/order-slips';
import { actions as requisitionSlipsActions } from '../../ducks/requisition-slips';
import { MAX_RETRY, RETRY_INTERVAL_MS } from '../../global/constants';
import { request } from '../../global/types';
import { service } from '../../services/BranchManager/delivery-receipts';

/* WORKERS */
function* getById({ payload }: any) {
	const { id, callback } = payload;
	callback({ status: request.REQUESTING });

	try {
		const response = yield retry(
			MAX_RETRY,
			RETRY_INTERVAL_MS,
			service.retrieve,
			id,
			getOnlineApiUrl(),
		);

		yield put(
			actions.save({
				type: types.GET_DELIVERY_RECEIPT_BY_ID,
				deliveryReceipt: response.data,
			}),
		);
		callback({ status: request.SUCCESS });
	} catch (e) {
		callback({ status: request.ERROR, errors: e.errors });
	}
}

function* receive({ payload }: any) {
	const { callback, requisitionSlipAction, ...data } = payload;
	callback({ status: request.REQUESTING });

	try {
		yield call(service.receive, data, getOnlineApiUrl());

		yield put(
			orderSlipActions.save({
				type: types.RECEIVE_DELIVERY_RECEIPT,
				orderSlipId: data.order_slip_id,
			}),
		);

		yield put(
			requisitionSlipsActions.save({
				type: types.RECEIVE_DELIVERY_RECEIPT,
				requisitionSlipAction,
			}),
		);
		callback({ status: request.SUCCESS });
	} catch (e) {
		callback({ status: request.ERROR, errors: e.errors });
	}
}

/* WATCHERS */
const getByIdWatcherSaga = function* getByIdWatcherSaga() {
	yield takeLatest(types.GET_DELIVERY_RECEIPT_BY_ID, getById);
};

const receiveWatcherSaga = function* receiveWatcherSaga() {
	yield takeLatest(types.RECEIVE_DELIVERY_RECEIPT, receive);
};

export default [getByIdWatcherSaga(), receiveWatcherSaga()];
