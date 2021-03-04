import { createAction } from 'redux-actions';

export const key = 'OM_PRODUCTS';

export const types = {
	GET_PRODUCTS: `${key}/GET_PRODUCTS`,
	CREATE_PRODUCT: `${key}/CREATE_PRODUCT`,
	EDIT_PRODUCT: `${key}/EDIT_PRODUCT`,
	REMOVE_PRODUCT: `${key}/REMOVE_PRODUCT`,
};

export const actions = {
	getProducts: createAction(types.GET_PRODUCTS),
	createProduct: createAction(types.CREATE_PRODUCT),
	editProduct: createAction(types.EDIT_PRODUCT),
	removeProduct: createAction(types.REMOVE_PRODUCT),
};
