import { createAction, handleActions } from 'redux-actions';
import { createSelector } from 'reselect';

export const key = 'OM_ADJUSTMENT_SLIP';

export const types = {
	SAVE: `${key}/SAVE`,
	GET_ADJUSTMENT_SLIPS_BY_DELIVERY_RECEIPT_ID: `${key}/GET_ADJUSTMENT_SLIPS_BY_DELIVERY_RECEIPT_ID`,
	CREATE_ADJUSTMENT_SLIP: `${key}/CREATE_ADJUSTMENT_SLIP`,
};

const initialState = {
	adjustmentSlips: [],
};

const reducer = handleActions(
	{
		[types.SAVE]: (state, { payload }: any) => {
			const { type } = payload;
			let newData = {};

			switch (type) {
				case types.GET_ADJUSTMENT_SLIPS_BY_DELIVERY_RECEIPT_ID: {
					newData = { adjustmentSlips: payload.adjustmentSlips };
					break;
				}
				case types.CREATE_ADJUSTMENT_SLIP: {
					newData = { adjustmentSlips: [payload.adjustmentSlip, ...state.adjustmentSlips] };
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
	getAdjustmentSlipsByDeliveryReceiptId: createAction(
		types.GET_ADJUSTMENT_SLIPS_BY_DELIVERY_RECEIPT_ID,
	),
	createAdjustmentSlip: createAction(types.CREATE_ADJUSTMENT_SLIP),
};

const selectState = (state: any) => state[key] || initialState;
export const selectors = {
	selectAdjustmentSlips: () => createSelector(selectState, (state) => state.adjustmentSlips),
};

export default reducer;
