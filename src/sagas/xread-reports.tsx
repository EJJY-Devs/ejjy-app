import { call, put, select, takeLatest } from 'redux-saga/effects';
import { actions, types } from '../ducks/xread-reports';
import { IS_APP_LIVE } from '../global/constants';
import { request } from '../global/types';
import { LOCAL_API_URL } from '../services';
import { service } from '../services/xread-reports';
import { selectors as branchesSelectors } from '../ducks/OfficeManager/branches';

/* WORKERS */
function* create({ payload }: any) {
	const { branchMachineId, userId, branchId, callback } = payload;
	callback({ status: request.REQUESTING });

	// Required: Branch must have an online URL (Requested by Office)
	const baseURL = yield select(branchesSelectors.selectURLByBranchId(branchId));
	if (!baseURL && branchId) {
		callback({ status: request.ERROR, errors: 'Branch has no online url.' });
		return;
	}

	try {
		const response = yield call(
			service.create,
			{
				branch_machine_id: branchMachineId,
				user_id: userId,
			},
			IS_APP_LIVE ? baseURL : LOCAL_API_URL,
		);

		yield put(actions.save({ type: types.CREATE_XREAD_REPORT, xreadReport: response.data }));
		callback({ status: request.SUCCESS });
	} catch (e) {
		callback({ status: request.ERROR, errors: e.errors });
	}
}

/* WATCHERS */
const createWatcherSaga = function* createWatcherSaga() {
	yield takeLatest(types.CREATE_XREAD_REPORT, create);
};

export default [createWatcherSaga()];
