import orderSlipsReducer, { key as ORDER_SLIPS_KEY } from '../order-slips';
import adjustmentSlipsReducer, { key as ADJUSTMENT_SLIPS_KEY } from './adjustment-slips';
import branchesReducer, { key as BRANCHES_KEY } from './branches';
import deliveryReceiptProductsReducer, {
	key as DELIVERY_RECEIPT_PRODUCTS_KEY,
} from './delivery-receipt-products';
import deliveryReceiptsReducer, { key as DELIVERY_RECEIPTS_KEY } from './delivery-receipts';
import productsReducer, { key as PRODUCTS_KEY } from './products';

export const officeManagerReducers = {
	[PRODUCTS_KEY]: productsReducer,
	[BRANCHES_KEY]: branchesReducer,
	[ORDER_SLIPS_KEY]: orderSlipsReducer,
	[DELIVERY_RECEIPTS_KEY]: deliveryReceiptsReducer,
	[ADJUSTMENT_SLIPS_KEY]: adjustmentSlipsReducer,
	[DELIVERY_RECEIPT_PRODUCTS_KEY]: deliveryReceiptProductsReducer,
};
