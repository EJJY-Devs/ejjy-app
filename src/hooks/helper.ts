import axios from 'axios';
import { appTypes } from 'global';
import {
	getAppType,
	getLocalApiUrl,
	getLocalBranchId,
	getOnlineApiUrl,
} from 'utils';

export const getBaseUrl = (isCUD = true) => {
	const onlineApiUrl = getOnlineApiUrl();
	const localApiUrl = getLocalApiUrl();
	const appType = getAppType();

	/* Condition on what API to use for CUD services:
	 *       BO    HO
	 *  NSA  ON    ON
	 *  SA   OF    X
	 */

	let baseURL = localApiUrl;
	if (
		isCUD &&
		((appType === appTypes.BACK_OFFICE && localApiUrl !== onlineApiUrl) ||
			appType === appTypes.HEAD_OFFICE)
	) {
		baseURL = onlineApiUrl;
	}

	return baseURL;
};

export const wrapServiceWithCatch = (service) => {
	return service.catch((e) => Promise.reject(e.errors));
};

// Eagerly reports this branch's changed product prices to Head Office right
// after a local price edit succeeds, instead of waiting for the periodic
// useTriggerProductSync poll (up to 60s later). Best-effort: a branch-side
// price save should never fail just because Head Office is unreachable.
export const triggerProductSyncIfBackoffice = () => {
	const localApiUrl = getLocalApiUrl();
	const branchId = getLocalBranchId();

	if (getAppType() !== appTypes.BACK_OFFICE || !localApiUrl || !branchId) {
		return;
	}

	axios
		.post(`${localApiUrl}/product-sync-trigger/trigger/`, {
			branch_id: branchId,
		})
		.catch((error) => {
			console.error('Failed to eagerly trigger product sync:', error);
		});
};
