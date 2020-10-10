import { put, retry, takeLatest } from 'redux-saga/effects';
import { actions, types } from '../../ducks/OfficeManager/delivery-receipt-products';
import { MAX_RETRY, RETRY_INTERVAL_MS } from '../../global/constants';
import { request } from '../../global/types';
import { service } from '../../services/OfficeManager/delivery-receipt-producs';

/* WORKERS */
function* getDeliveryReceiptById({ payload }: any) {
	const { id, callback } = payload;
	callback({ status: request.REQUESTING });

	try {
		const response = yield retry(MAX_RETRY, RETRY_INTERVAL_MS, service.getById, id);

		yield put(
			actions.save({
				type: types.GET_DELIVERY_RECEIPT_PRODUCT_BY_ID,
				deliveryReceiptProduct: response.data,
			}),
		);
		callback({ status: request.SUCCESS });
	} catch (e) {
		callback({ status: request.ERROR, errors: e.errors });
	}
}

/* WATCHERS */
const getDeliveryReceiptByIdWatcherSaga = function* getDeliveryReceiptByIdSaga() {
	yield takeLatest(types.GET_DELIVERY_RECEIPT_PRODUCT_BY_ID, getDeliveryReceiptById);
};

export default [getDeliveryReceiptByIdWatcherSaga()];
