import { put, retry, takeLatest } from 'redux-saga/effects';
import { actions, types } from '../ducks/auth';
import { MAX_RETRY, RETRY_INTERVAL_MS } from '../global/constants';
import { request } from '../global/types';
import { service } from '../services/auth';

/* WORKERS */
function* login({ payload }: any) {
	const { username, password, callback } = payload;
	callback(request.REQUESTING);

	try {
		const loginResponse = yield retry(MAX_RETRY, RETRY_INTERVAL_MS, service.login, {
			login: username,
			password,
		});

		const tokenResponse = yield retry(MAX_RETRY, RETRY_INTERVAL_MS, service.acquireToken, {
			username,
			password,
		});

		yield put(
			actions.save({
				user: loginResponse.data,
				accessToken: tokenResponse.data.access,
				refreshToken: tokenResponse.data.refresh,
			}),
		);

		callback(request.SUCCESS);
	} catch (e) {
		callback(request.ERROR, e.errors);
	}
}

/* WATCHERS */
const loginWatcherSaga = function* loginWatcherSaga() {
	yield takeLatest(types.LOGIN, login);
};

export default [loginWatcherSaga()];
