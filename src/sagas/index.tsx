import { all } from 'redux-saga/effects';
import { adminSagas } from './Admin';
import backOrdersSagas from './back-orders';
import branchProductPendingPriceUpdatesSagas from './branch-product-pending-price-updates';
import branchProductsSagas from './branch-products';
import branchesDaysSagas from './branches-days';
import orderSlipsSagas from './order-slips';
import preparationSlipsSagas from './preparation-slips';
import requisitionSlipsSagas from './requisition-slips';

export default function* rootSaga() {
	yield all([
		...backOrdersSagas,
		...branchesDaysSagas,
		...branchProductsSagas,
		...branchProductPendingPriceUpdatesSagas,
		...orderSlipsSagas,
		...preparationSlipsSagas,
		...requisitionSlipsSagas,
		...adminSagas,
	]);
}
