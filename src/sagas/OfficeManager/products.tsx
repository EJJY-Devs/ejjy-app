import { call, put, retry, takeLatest } from 'redux-saga/effects';
import { actions, types } from '../../ducks/OfficeManager/products';
import { MAX_PAGE_SIZE, MAX_RETRY, RETRY_INTERVAL_MS } from '../../global/constants';
import { request } from '../../global/types';
import { ONLINE_API_URL } from '../../services';
import { service } from '../../services/OfficeManager/products';

/* WORKERS */
function* list({ payload }: any) {
	const { callback } = payload;
	callback({ status: request.REQUESTING });

	try {
		const response = yield retry(
			MAX_RETRY,
			RETRY_INTERVAL_MS,
			service.list,
			{
				page: 1,
				page_size: MAX_PAGE_SIZE,
			},
			ONLINE_API_URL,
		);

		yield put(actions.save({ type: types.GET_PRODUCTS, products: response.data.results }));
		callback({ status: request.SUCCESS });
	} catch (e) {
		callback({ status: request.ERROR, errors: e.errors });
	}
}

function* create({ payload }: any) {
	const { callback, ...data } = payload;
	callback({ status: request.REQUESTING });

	try {
		const response = yield call(service.create, data, ONLINE_API_URL);

		yield put(actions.save({ type: types.CREATE_PRODUCT, product: response.data?.product }));
		callback({ status: request.SUCCESS, response: response.data });
	} catch (e) {
		callback({ status: request.ERROR, errors: e.errors });
	}
}

function* edit({ payload }: any) {
	const { callback, ...data } = payload;
	callback({ status: request.REQUESTING });

	try {
		const response = yield call(service.edit, data, ONLINE_API_URL);

		yield put(actions.save({ type: types.EDIT_PRODUCT, product: response.data.product }));
		callback({ status: request.SUCCESS, response: response.data });
	} catch (e) {
		callback({ status: request.ERROR, errors: e.errors });
	}
}

function* remove({ payload }: any) {
	const { callback, id } = payload;
	callback({ status: request.REQUESTING });

	try {
		const response = yield call(service.remove, id, ONLINE_API_URL);

		yield put(actions.save({ type: types.REMOVE_PRODUCT, id }));
		callback({ status: request.SUCCESS, response: response.data });
	} catch (e) {
		callback({ status: request.ERROR, errors: e.errors });
	}
}

/* WATCHERS */
const listWatcherSaga = function* listWatcherSaga() {
	yield takeLatest(types.GET_PRODUCTS, list);
};

const createWatcherSaga = function* createWatcherSaga() {
	yield takeLatest(types.CREATE_PRODUCT, create);
};

const editWatcherSaga = function* editWatcherSaga() {
	yield takeLatest(types.EDIT_PRODUCT, edit);
};

const removeWatcherSaga = function* removeWatcherSaga() {
	yield takeLatest(types.REMOVE_PRODUCT, remove);
};

export default [listWatcherSaga(), createWatcherSaga(), editWatcherSaga(), removeWatcherSaga()];
