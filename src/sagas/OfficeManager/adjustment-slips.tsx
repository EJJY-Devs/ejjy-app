import { call, put, retry, takeLatest } from 'redux-saga/effects';
import { actions, types } from '../../ducks/OfficeManager/adjustment-slips';
import { MAX_PAGE_SIZE, MAX_RETRY, RETRY_INTERVAL_MS } from '../../global/constants';
import { request } from '../../global/types';
import { ONLINE_API_URL } from '../../services';
import { service } from '../../services/OfficeManager/adjustment-slips';

/* WORKERS */
function* getByDeliveryReceiptId({ payload }: any) {
	const { deliveryReceiptId, callback } = payload;
	callback({ status: request.REQUESTING });

	try {
		const response = yield retry(
			MAX_RETRY,
			RETRY_INTERVAL_MS,
			service.getByDeliveryReceiptId,
			{
				page: 1,
				page_size: MAX_PAGE_SIZE,
				delivery_receipt_id: deliveryReceiptId,
			},
			ONLINE_API_URL,
		);

		yield put(
			actions.save({
				type: types.GET_ADJUSTMENT_SLIPS_BY_DELIVERY_RECEIPT_ID,
				adjustmentSlips: response.data.results,
			}),
		);
		callback({ status: request.SUCCESS });
	} catch (e) {
		callback({ status: request.ERROR, errors: e.errors });
	}
}

function* create({ payload }: any) {
	const { callback, data } = payload;
	callback({ status: request.REQUESTING });

	try {
		const response = yield call(service.create, data, ONLINE_API_URL);

		yield put(actions.save({ type: types.CREATE_ADJUSTMENT_SLIP, adjustmentSlip: response.data }));
		callback({ status: request.SUCCESS });
	} catch (e) {
		callback({ status: request.ERROR, errors: e.errors });
	}
}

/* WATCHERS */
const getByDeliveryReceiptIdWatcherSaga = function* getByDeliveryReceiptIdSaga() {
	yield takeLatest(types.GET_ADJUSTMENT_SLIPS_BY_DELIVERY_RECEIPT_ID, getByDeliveryReceiptId);
};

const createWatcherSaga = function* createWatcherSaga() {
	yield takeLatest(types.CREATE_ADJUSTMENT_SLIP, create);
};

export default [getByDeliveryReceiptIdWatcherSaga(), createWatcherSaga()];
