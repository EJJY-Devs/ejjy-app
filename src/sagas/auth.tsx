import { call, put, takeLatest } from 'redux-saga/effects';
import { actions, types } from '../ducks/auth';
import { IS_APP_LIVE } from '../global/constants';
import { request } from '../global/types';
import { service } from '../services/auth';
import { LOCAL_API_URL, ONLINE_API_URL } from '../services/index';

/* WORKERS */
function* login({ payload }: any) {
	const { username, password, callback } = payload;
	callback(request.REQUESTING);

	try {
		const loginBaseURL = IS_APP_LIVE ? ONLINE_API_URL : LOCAL_API_URL;
		const endpoint = IS_APP_LIVE ? service.loginOnline : service.login;
		const loginResponse = yield call(endpoint, { login: username, password }, loginBaseURL);

		if (loginResponse) {
			let tokenBaseURL = IS_APP_LIVE ? ONLINE_API_URL : LOCAL_API_URL;
			const tokenResponse = yield call(service.acquireToken, { username, password }, tokenBaseURL);

			yield put(
				actions.save({
					user: loginResponse.data,
					accessToken: tokenResponse.data.access,
					refreshToken: tokenResponse.data.refresh,
				}),
			);

			callback(request.SUCCESS);
		} else {
			callback(request.ERROR, ['Username or password is invalid.']);
		}
	} catch (e) {
		callback(request.ERROR, e.errors);
	}
}

function* retrieve({ payload }: any) {
	const { id, loginCount } = payload;

	try {
		// while (true) {
		// 	if (id) {
		// 		const baseURL = IS_APP_LIVE ? ONLINE_API_URL : LOCAL_API_URL;
		// 		const { data } = yield call(service.retrieve, id, {}, baseURL);
		// 		if (data?.login_count !== loginCount) {
		// 			yield put(actions.logout({ id }));
		// 			break;
		// 		}
		// 	} else {
		// 		break;
		// 	}
		// 	yield delay(AUTH_CHECKING_INTERVAL_MS);
		// }
	} catch (e) {
		console.error(e);
	}
}

function* logout({ payload }: any) {
	const { id } = payload;

	try {
		if (id) {
			const baseURL = IS_APP_LIVE ? ONLINE_API_URL : LOCAL_API_URL;
			const endpoint = IS_APP_LIVE ? service.logoutOnline : service.login;
			yield call(endpoint, id, baseURL);
		}
	} catch (e) {
		console.error(e);
	}
}

/* WATCHERS */
const loginWatcherSaga = function* loginWatcherSaga() {
	yield takeLatest(types.LOGIN, login);
};

const retrieveWatcherSaga = function* retrieveWatcherSaga() {
	yield takeLatest(types.RETRIEVE_USER, retrieve);
};

const logoutWatcherSaga = function* logoutWatcherSaga() {
	yield takeLatest(types.LOGOUT, logout);
};

export default [loginWatcherSaga(), retrieveWatcherSaga(), logoutWatcherSaga()];
