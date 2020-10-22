import preparationSlipsSagas from './delivery-receipts';
import productChecksSagas from './product-checks';

export const branchManagerSagas = [...preparationSlipsSagas, ...productChecksSagas];
