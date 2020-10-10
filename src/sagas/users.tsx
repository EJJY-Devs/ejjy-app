import { put, retry, takeLatest } from 'redux-saga/effects';
import { actions, types } from '../ducks/users';
import { MAX_PAGE_SIZE, MAX_RETRY, RETRY_INTERVAL_MS } from '../global/constants';
import { request } from '../global/types';
import { service } from '../services/users';

/* WORKERS */
function* list({ payload }: any) {
	const { callback } = payload;
	callback({ status: request.REQUESTING });

	try {
		const response = yield retry(MAX_RETRY, RETRY_INTERVAL_MS, service.list, {
			page: 1,
			page_size: MAX_PAGE_SIZE,
		});

		yield put(actions.save({ type: types.GET_USERS, users: response.data.results }));
		callback({ status: request.SUCCESS });
	} catch (e) {
		callback({ status: request.ERROR, errors: e.errors });
	}
}

/* WATCHERS */
const listWatcherSaga = function* listWatcherSaga() {
	yield takeLatest(types.GET_USERS, list);
};

export default [listWatcherSaga()];
