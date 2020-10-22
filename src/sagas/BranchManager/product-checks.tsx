import { call, put, retry, takeLatest } from 'redux-saga/effects';
import { actions, types } from '../../ducks/BranchManager/product-checks';
import { MAX_PAGE_SIZE, MAX_RETRY, RETRY_INTERVAL_MS } from '../../global/constants';
import { request } from '../../global/types';
import { service } from '../../services/BranchManager/product-checks';

/* WORKERS */
function* getDailyCheck({ payload }: any) {
	const { type, assigned_store_id, is_filled_up, callback } = payload;
	callback({ status: request.REQUESTING });

	try {
		const response = yield retry(MAX_RETRY, RETRY_INTERVAL_MS, service.list, {
			page: 1,
			page_size: MAX_PAGE_SIZE,
			type,
			assigned_store_id,
			is_filled_up,
		});

		yield put(
			actions.save({ type: types.GET_DAILY_CHECK, productCheck: response.data.results?.[0] }),
		);
		callback({ status: request.SUCCESS });
	} catch (e) {
		callback({ status: request.ERROR, errors: e.errors });
	}
}

function* getRandomChecks({ payload }: any) {
	const { type, assigned_store_id, is_filled_up, callback } = payload;
	callback({ status: request.REQUESTING });

	try {
		const response = yield retry(MAX_RETRY, RETRY_INTERVAL_MS, service.list, {
			page: 1,
			page_size: MAX_PAGE_SIZE,
			type,
			assigned_store_id,
			is_filled_up,
		});

		yield put(
			actions.save({ type: types.GET_RANDOM_CHECKS, productChecks: response.data.results }),
		);
		callback({ status: request.SUCCESS });
	} catch (e) {
		callback({ status: request.ERROR, errors: e.errors });
	}
}

function* fulfill({ payload }: any) {
	const { callback, type, products, id } = payload;
	callback({ status: request.REQUESTING });

	try {
		yield call(service.fulfill, id, { products });
		yield put(actions.save({ type: types.FULFILL_PRODUCT_CHECK, productCheckType: type, id }));
		callback({ status: request.SUCCESS });
	} catch (e) {
		callback({ status: request.ERROR, errors: e.errors });
	}
}

/* WATCHERS */
const getDailyCheckWatcherSaga = function* getDailyCheckWatcherSaga() {
	yield takeLatest(types.GET_DAILY_CHECK, getDailyCheck);
};

const getRandomChecksWatcherSaga = function* getRandomChecksWatcherSaga() {
	yield takeLatest(types.GET_RANDOM_CHECKS, getRandomChecks);
};

const fulfillWatcherSaga = function* fulfillWatcherSaga() {
	yield takeLatest(types.FULFILL_PRODUCT_CHECK, fulfill);
};

export default [getDailyCheckWatcherSaga(), getRandomChecksWatcherSaga(), fulfillWatcherSaga()];
