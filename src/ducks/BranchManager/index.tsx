import deliveryReceiptsReducer, {
	key as DELIVERY_RECEIPTS_KEY,
} from './delivery-receipts';
import localBranchSettingsReducer, {
	key as LOCAL_BRANCH_SETTINGS_KEY,
} from './local-branch-settings';

export const branchManagerReducers = {
	[DELIVERY_RECEIPTS_KEY]: deliveryReceiptsReducer,
	[LOCAL_BRANCH_SETTINGS_KEY]: localBranchSettingsReducer,
};
