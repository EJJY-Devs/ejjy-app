import orderSlipsReducer, { key as ORDER_SLIPS_KEY } from '../order-slips';
import branchesReducer, { key as BRANCHES_KEY } from './branches';
import deliveryReceiptProductsReducer, {
	key as DELIVERY_RECEIPT_PRODUCTS_KEY,
} from './delivery-receipt-products';
import deliveryReceiptsReducer, {
	key as DELIVERY_RECEIPTS_KEY,
} from './delivery-receipts';
import pendingTransactionsReducer, {
	key as PENDING_TRANSACTIONS_KEY,
} from './pending-transactions';
import usersReducer, { key as USERS_KEY } from './users';

export const officeManagerReducers = {
	[BRANCHES_KEY]: branchesReducer,
	[ORDER_SLIPS_KEY]: orderSlipsReducer,
	[DELIVERY_RECEIPTS_KEY]: deliveryReceiptsReducer,
	[DELIVERY_RECEIPT_PRODUCTS_KEY]: deliveryReceiptProductsReducer,
	[USERS_KEY]: usersReducer,
	[PENDING_TRANSACTIONS_KEY]: pendingTransactionsReducer,
};
