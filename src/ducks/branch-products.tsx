import { createAction } from 'redux-actions';

export const key = 'BRANCH_PRODUCTS';

export const types = {
	GET_BRANCH_PRODUCTS_BY_BRANCH: `${key}/GET_BRANCH_PRODUCTS_BY_BRANCH`,
	EDIT_BRANCH_PRODUCT: `${key}/EDIT_BRANCH_PRODUCT`,
};

export const actions = {
	getBranchProductsByBranch: createAction(types.GET_BRANCH_PRODUCTS_BY_BRANCH),
	editBranchProduct: createAction(types.EDIT_BRANCH_PRODUCT),
};
