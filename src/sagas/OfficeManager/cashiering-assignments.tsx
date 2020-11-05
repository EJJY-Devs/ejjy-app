import { call, put, retry, takeLatest } from 'redux-saga/effects';
import { actions, types } from '../../ducks/OfficeManager/cashiering-assignments';
import { MAX_PAGE_SIZE, MAX_RETRY, RETRY_INTERVAL_MS } from '../../global/constants';
import { request } from '../../global/types';
import { service } from '../../services/OfficeManager/cashiering-assignments';

/* WORKERS */
function* listByUserId({ payload }: any) {
	const { userId, callback } = payload;
	callback({ status: request.REQUESTING });

	try {
		const response = yield retry(MAX_RETRY, RETRY_INTERVAL_MS, service.listByUserId, {
			page: 1,
			page_size: MAX_PAGE_SIZE,
			user_id: userId,
		});

		yield put(
			actions.save({
				type: types.GET_CASHIERING_ASSIGNMENTS_BY_USER_ID,
				cashieringAssignments: response.data.results,
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
		const response = yield call(service.create, data);

		yield put(
			actions.save({
				type: types.CREATE_CASHIERING_ASSIGNMENT,
				cashieringAssignment: response.data,
			}),
		);
		callback({ status: request.SUCCESS });
	} catch (e) {
		callback({ status: request.ERROR, errors: e.errors });
	}
}

function* edit({ payload }: any) {
	const { callback, ...data } = payload;
	callback({ status: request.REQUESTING });

	try {
		const response = yield call(service.edit, data);

		yield put(
			actions.save({ type: types.EDIT_CASHIERING_ASSIGNMENT, cashieringAssignment: response.data }),
		);
		callback({ status: request.SUCCESS });
	} catch (e) {
		callback({ status: request.ERROR, errors: e.errors });
	}
}

function* remove({ payload }: any) {
	const { callback, id } = payload;
	callback({ status: request.REQUESTING });

	try {
		yield call(service.remove, id);

		yield put(actions.save({ type: types.REMOVE_CASHIERING_ASSIGNMENT, id }));
		callback({ status: request.SUCCESS });
	} catch (e) {
		callback({ status: request.ERROR, errors: e.errors });
	}
}

/* WATCHERS */
const listByUserIdWatcherSaga = function* listByUserIdWatcherSaga() {
	yield takeLatest(types.GET_CASHIERING_ASSIGNMENTS_BY_USER_ID, listByUserId);
};

const createWatcherSaga = function* createWatcherSaga() {
	yield takeLatest(types.CREATE_CASHIERING_ASSIGNMENT, create);
};

const editWatcherSaga = function* editWatcherSaga() {
	yield takeLatest(types.EDIT_CASHIERING_ASSIGNMENT, edit);
};

const removeWatcherSaga = function* removeWatcherSaga() {
	yield takeLatest(types.REMOVE_CASHIERING_ASSIGNMENT, remove);
};

export default [
	listByUserIdWatcherSaga(),
	createWatcherSaga(),
	editWatcherSaga(),
	removeWatcherSaga(),
];
