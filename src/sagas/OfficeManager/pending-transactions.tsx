import { call, put, retry, takeLatest } from 'redux-saga/effects';
import { actions, types } from '../../ducks/OfficeManager/pending-transactions';
import { MAX_PAGE_SIZE, MAX_RETRY, RETRY_INTERVAL_MS } from '../../global/constants';
import { request } from '../../global/types';
import { ONLINE_API_URL } from '../../services/index';
import { service } from '../../services/OfficeManager/pending-transactions';

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

		yield put(
			actions.save({
				type: types.LIST_PENDING_TRANSACTIONS,
				pendingTransactions: response.data.results,
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
		const response = yield call(service.create, data, ONLINE_API_URL);

		yield put(actions.save({ type: types.CREATE_PENDING_TRANSACTIONS, branch: response.data }));
		callback({ status: request.SUCCESS });
	} catch (e) {
		callback({ status: request.ERROR, errors: e.errors });
	}
}

function* edit({ payload }: any) {
	const { callback, id, ...data } = payload;
	callback({ status: request.REQUESTING });

	try {
		yield call(service.edit, id, data, ONLINE_API_URL);
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

		callback({ status: request.SUCCESS });
	} catch (e) {
		callback({ status: request.ERROR, errors: e.errors });
	}
}

function* execute({ payload }: any) {
	const { callback, url, request_body, request_query_params, request_type } = payload;
	callback({ status: request.REQUESTING });

	try {
		yield call(service.execute, {
			method: request_type,
			url,
			data: request_body,
			params: request_query_params,
		});

		callback({ status: request.SUCCESS });
	} catch (e) {
		callback({ status: request.ERROR, errors: e.errors });
	}
}

/* WATCHERS */
const listWatcherSaga = function* listWatcherSaga() {
	yield takeLatest(types.LIST_PENDING_TRANSACTIONS, list);
};

const createWatcherSaga = function* createWatcherSaga() {
	yield takeLatest(types.CREATE_PENDING_TRANSACTIONS, create);
};

const editWatcherSaga = function* editWatcherSaga() {
	yield takeLatest(types.EDIT_PENDING_TRANSACTIONS, edit);
};

const removeWatcherSaga = function* removeWatcherSaga() {
	yield takeLatest(types.REMOVE_PENDING_TRANSACTIONS, remove);
};

const executeWatcherSaga = function* executeWatcherSaga() {
	yield takeLatest(types.EXECUTE_PENDING_TRANSACTIONS, execute);
};

export default [
	listWatcherSaga(),
	createWatcherSaga(),
	editWatcherSaga(),
	removeWatcherSaga(),
	executeWatcherSaga(),
];
