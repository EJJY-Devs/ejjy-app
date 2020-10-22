import { createAction, handleActions } from 'redux-actions';
import { createSelector } from 'reselect';
import { productCheckingTypes } from '../../global/types';

export const key = 'BM_PRODUCT_CHECKS';

export const types = {
	SAVE: `${key}/SAVE`,
	GET_DAILY_CHECK: `${key}/GET_DAILY_CHECK`,
	GET_RANDOM_CHECKS: `${key}/GET_RANDOM_CHECKS`,
	FULFILL_PRODUCT_CHECK: `${key}/FULFILL_PRODUCT_CHECK`,
};

const initialState = {
	dailyCheck: null,
	randomChecks: [],
};

const reducer = handleActions(
	{
		[types.SAVE]: (state, { payload }: any) => {
			const { type } = payload;
			let newData = {};

			switch (type) {
				case types.GET_DAILY_CHECK: {
					newData = { dailyCheck: payload.productCheck };
					break;
				}
				case types.GET_RANDOM_CHECKS: {
					newData = { randomChecks: payload.productChecks };
					break;
				}
				case types.FULFILL_PRODUCT_CHECK: {
					const { productCheckType, id } = payload;

					if (productCheckType === productCheckingTypes.DAILY) {
						newData = { dailyCheck: null };
					}

					if (productCheckType === productCheckingTypes.RANDOM && id) {
						newData = {
							randomChecks: state.randomChecks.filter((randomCheck) => randomCheck.id !== id),
						};
					}

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
	getDailyCheck: createAction(types.GET_DAILY_CHECK),
	getRandomChecks: createAction(types.GET_RANDOM_CHECKS),
	fulfillProductCheck: createAction(types.FULFILL_PRODUCT_CHECK),
};

const selectState = (state: any) => state[key] || initialState;
export const selectors = {
	selectDailyChecks: () => createSelector(selectState, (state) => state.dailyCheck),
	selectRandomChecks: () => createSelector(selectState, (state) => state.randomChecks),
};

export default reducer;
