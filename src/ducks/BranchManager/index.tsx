import deliveryReceiptsReducer, { key as DELIVERY_RECEIPTS_KEY } from './delivery-receipts';
import productChecksReducer, { key as PRODUCT_CHECKS_KEY } from './product-checks';

export const branchManagerReducers = {
	[DELIVERY_RECEIPTS_KEY]: deliveryReceiptsReducer,
	[PRODUCT_CHECKS_KEY]: productChecksReducer,
};
