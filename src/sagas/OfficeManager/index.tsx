import adjustmentSlipsSagas from './adjustment-slips';
import branchMachinesSagas from './branch-machines';
import branchesSagas from './branches';
import cashieringAssignmentsSagas from './cashiering-assignments';
import deliveryReceiptProducsSagas from './delivery-receipt-producs';
import preparationSlipsSagas from './delivery-receipts';
import orderSlipsSagas from './order-slips';
import pendingTransactionsSagas from './pending-transactions';
import productsSagas from './products';

export const officeManagerSagas = [
	...adjustmentSlipsSagas,
	...branchMachinesSagas,
	...branchesSagas,
	...cashieringAssignmentsSagas,
	...deliveryReceiptProducsSagas,
	...preparationSlipsSagas,
	...orderSlipsSagas,
	...productsSagas,
	...pendingTransactionsSagas,
];
