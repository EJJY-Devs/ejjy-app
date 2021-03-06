import { call, select, takeLatest } from 'redux-saga/effects';
import { selectors as branchesSelectors } from '../ducks/OfficeManager/branches';
import { types } from '../ducks/sessions';
import { request } from '../global/types';
import { service } from '../services/sessions';

/* WORKERS */
function* list({ payload }: any) {
	const { page, pageSize, branchId, callback } = payload;
	callback({ status: request.REQUESTING });

	// Required: Branch must have an online URL (Requested by Office)
	const baseURL = yield select(branchesSelectors.selectURLByBranchId(branchId));
	if (!baseURL && branchId) {
		callback({ status: request.ERROR, errors: 'Branch has no online url.' });
		return;
	}

	let data = {
		page,
		page_size: pageSize,
	};

	let isFetchedFromBackupURL = false;

	try {
		let response = null;

		try {
			// Fetch in branch url
			response = yield call(service.list, data, baseURL);
		} catch (e) {
			// Retry to fetch in backup branch url
			const baseBackupURL = yield select(branchesSelectors.selectBackUpURLByBranchId(branchId));
			if (baseURL && baseBackupURL) {
				try {
					// Fetch branch url
					response = yield call(service.list, data, baseBackupURL);
					isFetchedFromBackupURL = true;
				} catch (e) {
					throw e;
				}
			} else {
				throw e;
			}
		}

		callback({
			status: request.SUCCESS,
			warnings: isFetchedFromBackupURL ? ['Data was fetched from a backup server.'] : [],
			data: response.data,
		});
	} catch (e) {
		callback({ status: request.ERROR, errors: e.errors });
	}
}

/* WATCHERS */
const listWatcherSaga = function* listWatcherSaga() {
	yield takeLatest(types.LIST_SESSIONS, list);
};

export default [listWatcherSaga()];
