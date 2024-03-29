import { MAX_PAGE_SIZE, MAX_RETRY, request, RETRY_INTERVAL_MS } from 'global';
import {
	call,
	put,
	retry,
	select,
	takeEvery,
	takeLatest,
} from 'redux-saga/effects';
import { UsersService } from 'services';
import { getOnlineApiUrl } from 'utils';
import { selectors as branchesSelectors } from '../ducks/OfficeManager/branches';
import { actions, types } from '../ducks/OfficeManager/users';
import { getBaseUrl } from './helper';

/* WORKERS */
function* listUsers({ payload }: any) {
	const { branchId, userType, callback } = payload;
	callback({ status: request.REQUESTING });

	const baseURL = getBaseUrl(branchId, callback);

	const data = {
		page: 1,
		page_size: MAX_PAGE_SIZE,
		user_type: userType,
	};

	let isFetchedFromBackupURL = false;

	try {
		let response = null;

		try {
			// Fetch in branch url
			response = yield call(UsersService.list, data, baseURL);
		} catch (e) {
			// Retry to fetch in backup branch url
			const baseBackupURL = yield select(
				branchesSelectors.selectBackUpURLByBranchId(branchId),
			);
			if (baseURL && baseBackupURL) {
				// Fetch branch url
				response = yield call(UsersService.list, data, baseBackupURL);
				isFetchedFromBackupURL = true;
			} else {
				throw e;
			}
		}

		callback({
			status: request.SUCCESS,
			data: response.data,
			warnings: isFetchedFromBackupURL
				? ['Data Source: Backup Server, data might be outdated.']
				: [],
		});
	} catch (e) {
		callback({ status: request.ERROR, errors: e.errors });
	}
}

function* listOnlineUsers({ payload }: any) {
	const {
		branchId,
		userType,
		isPendingCreateApproval,
		isPendingUpdateUserTypeApproval,
		callback,
	} = payload;
	callback({ status: request.REQUESTING });

	try {
		const response = yield call(
			UsersService.listOnline,
			{
				page: 1,
				page_size: MAX_PAGE_SIZE,
				branch_id: branchId,
				user_type: userType,
				is_pending_create_approval: isPendingCreateApproval,
				is_pending_update_user_type_approval: isPendingUpdateUserTypeApproval,
			},
			getOnlineApiUrl(),
		);

		callback({ status: request.SUCCESS, data: response.data });
	} catch (e) {
		callback({ status: request.ERROR, errors: e.errors });
	}
}

function* getById({ payload }: any) {
	const { id, callback } = payload;
	callback({ status: request.REQUESTING });

	try {
		const response = yield retry(
			MAX_RETRY,
			RETRY_INTERVAL_MS,
			UsersService.getByIdOnline,
			id,
			getOnlineApiUrl(),
		);

		yield put(
			actions.save({ type: types.GET_USER_BY_ID, user: response.data }),
		);
		callback({ status: request.SUCCESS, data: response.data });
	} catch (e) {
		callback({ status: request.ERROR, errors: e.errors });
	}
}

function* getByIdOnline({ payload }: any) {
	const { id, callback } = payload;
	callback({ status: request.REQUESTING });

	try {
		const response = yield retry(
			MAX_RETRY,
			RETRY_INTERVAL_MS,
			UsersService.getByIdOnline,
			id,
			getOnlineApiUrl(),
		);

		yield put(
			actions.save({ type: types.GET_USER_BY_ID, user: response.data }),
		);
		callback({ status: request.SUCCESS, data: response.data });
	} catch (e) {
		callback({ status: request.ERROR, errors: e.errors });
	}
}

function* create({ payload }: any) {
	const { callback, ...data } = payload;
	callback({ status: request.REQUESTING });

	const baseURL = getBaseUrl(null, callback);

	try {
		const response = yield call(
			UsersService.create,
			data,
			baseURL, // TODO: Need to check first on what URL to use. For now, let's use the local
		);

		callback({ status: request.SUCCESS, response: response.data });
	} catch (e) {
		callback({ status: request.ERROR, errors: e.errors });
	}
}

function* createOnline({ payload }: any) {
	const { callback, ...data } = payload;
	callback({ status: request.REQUESTING });

	try {
		const response = yield call(
			UsersService.createOnline,
			data,
			getOnlineApiUrl(),
		);

		callback({ status: request.SUCCESS, response: response.data });
	} catch (e) {
		callback({ status: request.ERROR, errors: e.errors });
	}
}

function* editOnline({ payload }: any) {
	const { id, branchId, callback } = payload;
	callback({ status: request.REQUESTING });

	try {
		const response = yield call(
			UsersService.editOnline,
			id,
			{ branch_id: branchId },
			getOnlineApiUrl(),
		);

		yield put(actions.save({ type: types.EDIT_USER, id }));
		callback({ status: request.SUCCESS, response: response.data });
	} catch (e) {
		callback({ status: request.ERROR, errors: e.errors });
	}
}

function* remove({ payload }: any) {
	const { id, callback } = payload;
	callback({ status: request.REQUESTING });

	try {
		const response = yield call(
			UsersService.removeOnline,
			id,
			getOnlineApiUrl(),
		);

		yield put(actions.save({ type: types.REMOVE_USER, id }));
		callback({ status: request.SUCCESS, response: response.data });
	} catch (e) {
		callback({ status: request.ERROR, errors: e.errors });
	}
}

/* WATCHERS */
const listUsersWatcherSaga = function* listUsersWatcherSaga() {
	yield takeLatest(types.GET_USERS, listUsers);
};

const listOnlineUsersWatcherSaga = function* listOnlineUsersWatcherSaga() {
	yield takeEvery(types.GET_ONLINE_USERS, listOnlineUsers);
};

const getByIdWatcherSaga = function* getByIdWatcherSaga() {
	yield takeLatest(types.GET_USER_BY_ID, getById);
};

const getByIdOnlineWatcherSaga = function* getByIdOnlineWatcherSaga() {
	yield takeLatest(types.GET_ONLINE_USER_BY_ID, getByIdOnline);
};

const createWatcherSaga = function* createWatcherSaga() {
	yield takeLatest(types.CREATE_USER, create);
};

const createOnlineWatcherSaga = function* createOnlineWatcherSaga() {
	yield takeLatest(types.CREATE_ONLINE_USER, createOnline);
};

const editOnlineWatcherSaga = function* editOnlineWatcherSaga() {
	yield takeLatest(types.EDIT_USER, editOnline);
};

const removeWatcherSaga = function* removeWatcherSaga() {
	yield takeLatest(types.REMOVE_USER, remove);
};

export default [
	listUsersWatcherSaga(),
	listOnlineUsersWatcherSaga(),
	getByIdWatcherSaga(),
	getByIdOnlineWatcherSaga(),
	createWatcherSaga(),
	createOnlineWatcherSaga(),
	editOnlineWatcherSaga(),
	removeWatcherSaga(),
];
