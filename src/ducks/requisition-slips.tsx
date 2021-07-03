import { cloneDeep } from 'lodash';
import { createAction, handleActions } from 'redux-actions';
import { createSelector } from 'reselect';
import { types as BMDeliveryReceiptTypes } from './BranchManager/delivery-receipts';

export const key = 'REQUISITION_SLIPS';

export const types = {
	SAVE: `${key}/SAVE`,
	GET_REQUISITION_SLIPS: `${key}/GET_REQUISITION_SLIPS`,
	GET_REQUISITION_SLIPS_EXTENDED: `${key}/GET_REQUISITION_SLIPS_EXTENDED`,
	GET_REQUISITION_SLIP_BY_ID: `${key}/GET_REQUISITION_SLIP_BY_ID`,
	GET_REQUISITION_SLIP_BY_ID_AND_BRANCH: `${key}/GET_REQUISITION_SLIP_BY_ID_AND_BRANCH`,
	CREATE_REQUISITION_SLIP: `${key}/CREATE_REQUISITION_SLIP`,
	EDIT_REQUISITION_SLIP: `${key}/EDIT_REQUISITION_SLIP`,

	SET_OUT_OF_STOCK: `${key}/SET_OUT_OF_STOCK`,

	REMOVE_REQUISITION_SLIP_BY_BRANCH: `${key}/REMOVE_REQUISITION_SLIP_BY_BRANCH`,
	SET_REQUISITION_SLIP_ACTION: `${key}/SET_REQUISITION_SLIP_ACTION`,
};

const initialState = {
	requisitionSlip: null,
	requisitionSlipsByBranch: {},
	requisitionSlipForOutOfStock: null,
};

const reducer = handleActions(
	{
		[types.SAVE]: (state, { payload }: any) => {
			const { type } = payload;
			let newData = {};

			switch (type) {
				case types.GET_REQUISITION_SLIP_BY_ID: {
					newData = { requisitionSlip: payload.requisitionSlip };
					break;
				}
				case types.GET_REQUISITION_SLIP_BY_ID_AND_BRANCH: {
					const requisitionSlipsByBranch = cloneDeep(
						state.requisitionSlipsByBranch,
					);

					if (payload?.isForOutOfStock) {
						newData = { requisitionSlipForOutOfStock: payload.requisitionSlip };
						break;
					} else if (payload?.branchId) {
						requisitionSlipsByBranch[payload?.branchId] =
							payload.requisitionSlip;
					}

					newData = { requisitionSlipsByBranch };
					break;
				}
				case BMDeliveryReceiptTypes.RECEIVE_DELIVERY_RECEIPT: {
					const { requisitionSlipAction } = payload;
					const requisitionSlip = cloneDeep(state.requisitionSlip);
					requisitionSlip.action.action = requisitionSlipAction;
					newData = { requisitionSlip };
					break;
				}
				default:
					break;
			}

			return { ...state, ...newData };
		},

		[types.REMOVE_REQUISITION_SLIP_BY_BRANCH]: (state) => ({
			...state,
			requisitionSlipsByBranch: {},
		}),

		[types.SET_REQUISITION_SLIP_ACTION]: (state, { payload }: any) => {
			const requisitionSlip = cloneDeep(state.requisitionSlip);
			requisitionSlip.action.action = payload.action;

			return { ...state, requisitionSlip };
		},
	},
	initialState,
);

export const actions = {
	save: createAction(types.SAVE),
	getRequisitionSlips: createAction(types.GET_REQUISITION_SLIPS),
	getRequisitionSlipsExtended: createAction(
		types.GET_REQUISITION_SLIPS_EXTENDED,
	),

	getRequisitionSlipById: createAction(types.GET_REQUISITION_SLIP_BY_ID),
	getRequisitionSlipByIdAndBranch: createAction(
		types.GET_REQUISITION_SLIP_BY_ID_AND_BRANCH,
	),
	createRequisitionSlip: createAction(types.CREATE_REQUISITION_SLIP),
	editRequisitionSlip: createAction(types.EDIT_REQUISITION_SLIP),
	setOutOfStock: createAction(types.SET_OUT_OF_STOCK),

	removeRequisitionSlipByBranch: createAction(
		types.REMOVE_REQUISITION_SLIP_BY_BRANCH,
	),
	setRequisitionSlipAction: createAction(types.SET_REQUISITION_SLIP_ACTION),
};

const selectState = (state: any) => state[key] || initialState;
export const selectors = {
	selectRequisitionSlip: () =>
		createSelector(selectState, (state) => state.requisitionSlip),
	selectRequisitionSlipsByBranch: () =>
		createSelector(selectState, (state) => state.requisitionSlipsByBranch),
	selectRequisitionSlipForOutOfStock: () =>
		createSelector(selectState, (state) => state.requisitionSlipForOutOfStock),
	// selectRequisitionSlipById: (id) =>
	// 	createSelector(selectState, (state) =>
	// 		state.requisitionSlips.find((requisitionSlip) => requisitionSlip.id === id),
	// 	),
};

export default reducer;
