import { call, put, retry, takeLatest } from 'redux-saga/effects';
import { actions, types } from '../../ducks/OfficeManager/delivery-receipts';
import { actions as orderSlipActions } from '../../ducks/order-slips';
import { MAX_RETRY, RETRY_INTERVAL_MS } from '../../global/constants';
import { request } from '../../global/types';
import { service } from '../../services/OfficeManager/delivery-receipts';

/* WORKERS */
function* getById({ payload }: any) {
	const { id, callback } = payload;
	callback({ status: request.REQUESTING });

	try {
		const response = yield retry(MAX_RETRY, RETRY_INTERVAL_MS, service.getById, id);

		yield put(
			actions.save({ type: types.GET_DELIVERY_RECEIPT_BY_ID, deliveryReceipt: response.data }),
		);
		callback({ status: request.SUCCESS });
	} catch (e) {
		callback({ status: request.ERROR, errors: e.errors });
	}
}

function* create({ payload }: any) {
	const { callback, order_slip_id } = payload;
	callback({ status: request.REQUESTING });

	try {
		const response = yield call(service.create, { order_slip_id });

		yield put(
			orderSlipActions.save({
				type: types.CREATE_DELIVERY_RECEIPT,
				orderSlipId: order_slip_id,
				deliveryReceiptId: response.data.id,
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

const createWatcherSaga = function* createWatcherSaga() {
	yield takeLatest(types.CREATE_DELIVERY_RECEIPT, create);
};

export default [getByIdWatcherSaga(), createWatcherSaga()];
