import adjustmentSlipsSagas from './adjustment-slips';
import branchMachinesSagas from './branch-machines';
import branchesSagas from './branches';
import cashieringAssignmentsSagas from './cashiering-assignments';
import deliveryReceiptProducsSagas from './delivery-receipt-producs';
import preparationSlipsSagas from './delivery-receipts';
import orderSlipsSagas from './order-slips';
import productsSagas from './products';
import usersSagas from './users';

export const officeManagerSagas = [
	...adjustmentSlipsSagas,
	...branchMachinesSagas,
	...branchesSagas,
	...cashieringAssignmentsSagas,
	...deliveryReceiptProducsSagas,
	...preparationSlipsSagas,
	...orderSlipsSagas,
	...productsSagas,
	...usersSagas,
];
