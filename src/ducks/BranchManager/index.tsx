import deliveryReceiptsReducer, { key as DELIVERY_RECEIPTS_KEY } from './delivery-receipts';
import productChecksReducer, { key as PRODUCT_CHECKS_KEY } from './product-checks';
import localBranchSettingsReducer, {
	key as LOCAL_BRANCH_SETTINGS_KEY,
} from './local-branch-settings';

export const branchManagerReducers = {
	[DELIVERY_RECEIPTS_KEY]: deliveryReceiptsReducer,
	[PRODUCT_CHECKS_KEY]: productChecksReducer,
	[LOCAL_BRANCH_SETTINGS_KEY]: localBranchSettingsReducer,
};
