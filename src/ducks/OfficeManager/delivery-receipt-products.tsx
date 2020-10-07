import { createAction, handleActions } from 'redux-actions';
import { createSelector } from 'reselect';

export const key = 'OM_DELIVERY_RECEIPT_PRODUCTS';

export const types = {
	SAVE: `${key}/SAVE`,
	GET_DELIVERY_RECEIPT_PRODUCT_BY_ID: `${key}/GET_DELIVERY_RECEIPT_PRODUCT_BY_ID`,
};

const initialState = {
	deliveryReceiptProduct: [],
};

const reducer = handleActions(
	{
		[types.SAVE]: (state, { payload }: any) => {
			const { type } = payload;
			let newData = {};

			switch (type) {
				case types.GET_DELIVERY_RECEIPT_PRODUCT_BY_ID: {
					newData = { deliveryReceiptProduct: payload.deliveryReceiptProduct };
					break;
				}
			}

			return { ...state, ...newData };
		},
	},
	initialState,
);

export const actions = {
	save: createAction(types.SAVE),
	getDeliveryReceiptProductById: createAction(types.GET_DELIVERY_RECEIPT_PRODUCT_BY_ID),
};

const selectState = (state: any) => state[key] || initialState;
export const selectors = {
	selectDeliveryReceiptProduct: () =>
		createSelector(selectState, (state) => state.deliveryReceiptProduct),
};

export default reducer;
