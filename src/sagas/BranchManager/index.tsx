import preparationSlipsSagas from './delivery-receipts';
import productChecksSagas from './product-checks';
import localBranchSettingsSagas from './local-branch-settings';

export const branchManagerSagas = [
	...preparationSlipsSagas,
	...productChecksSagas,
	...localBranchSettingsSagas,
];
