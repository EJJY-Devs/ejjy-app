import branchesSagas from './branches';
import productsSagas from './products';
import orderSlipsSagas from '../order-slips';
import preparationSlipsSagas from './delivery-receipts';
import adjustmentSlipsSagas from './adjustment-slips';
import deliveryReceiptProducsSagas from './delivery-receipt-producs';

export const officeManagerSagas = [
	...branchesSagas,
	...productsSagas,
	...orderSlipsSagas,
	...preparationSlipsSagas,
	...adjustmentSlipsSagas,
	...deliveryReceiptProducsSagas,
];
