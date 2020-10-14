import { createAction, handleActions } from 'redux-actions';
import { createSelector } from 'reselect';

export const key = 'BP_PREPARATION_SLIPS';

export const types = {
	SAVE: `${key}/SAVE`,
	GET_PREPARATION_SLIPS: `${key}/GET_PREPARATION_SLIPS`,
	FULFILL_PREPARATION_SLIP: `${key}/FULFILL_PREPARATION_SLIP`,
};

const initialState = {
	preparationSlips: [],
};

const reducer = handleActions(
	{
		[types.SAVE]: (state, { payload }: any) => {
			const { type } = payload;
			let newData = {};

			switch (type) {
				case types.GET_PREPARATION_SLIPS: {
					newData = { preparationSlips: payload.preparationSlips };
					break;
				}
				// NOTE: Commented out because prep slip re-fetched after fulfilling prep slip
				// case types.FULFILL_PREPARATION_SLIP: {
				// 	const { preparationSlip: editedPreparationSlip } = payload;
				// 	const index = state.preparationSlips.findIndex(
				// 		({ id }) => id === editedPreparationSlip.id,
				// 	);

				// 	if (index !== NOT_FOUND_INDEX) {
				// 		const preparationSlips = cloneDeep(state.preparationSlips);
				// 		preparationSlips[index].products = editedPreparationSlip.products;
				// 		preparationSlips[index].status = preparationSlipStatus.COMPLETED;
				// 		newData = { preparationSlips };
				// 	}
				// 	break;
				// }
			}

			return { ...state, ...newData };
		},
	},
	initialState,
);

export const actions = {
	save: createAction(types.SAVE),
	getPreparationSlips: createAction(types.GET_PREPARATION_SLIPS),
	fulfillPreparationSlip: createAction(types.FULFILL_PREPARATION_SLIP),
};

const selectState = (state: any) => state[key] || initialState;
export const selectors = {
	selectPreparationSlips: () => createSelector(selectState, (state) => state.preparationSlips),
};

export default reducer;
