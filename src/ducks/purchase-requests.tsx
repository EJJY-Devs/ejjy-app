import { cloneDeep } from 'lodash';
import { createAction, handleActions } from 'redux-actions';
import { createSelector } from 'reselect';
import { types as BMDeliveryReceiptTypes } from './BranchManager/delivery-receipts';

export const key = 'PURCHASE_REQUESTS';

export const types = {
	SAVE: `${key}/SAVE`,
	GET_PURCHASE_REQUESTS: `${key}/GET_PURCHASE_REQUESTS`,
	GET_PURCHASE_REQUESTS_EXTENDED: `${key}/GET_PURCHASE_REQUESTS_EXTENDED`,
	GET_PURCHASE_REQUEST_BY_ID: `${key}/GET_PURCHASE_REQUEST_BY_ID`,
	GET_PURCHASE_REQUEST_BY_ID_AND_BRANCH: `${key}/GET_PURCHASE_REQUEST_BY_ID_AND_BRANCH`,
	CREATE_PURCHASE_REQUEST: `${key}/CREATE_PURCHASE_REQUEST`,
	EDIT_PURCHASE_REQUEST: `${key}/EDIT_PURCHASE_REQUEST`,

	REMOVE_PURCHASE_REQUEST_BY_BRANCH: `${key}/REMOVE_PURCHASE_REQUEST_BY_BRANCH`,
	SET_PURCHASE_REQUEST_ACTION: `${key}/SET_PURCHASE_REQUEST_ACTION`,
};

const initialState = {
	purchaseRequests: [],
	purchaseRequest: null,
	purchaseRequestsByBranch: {},
	purchaseRequestForOutOfStock: null,
};

const reducer = handleActions(
	{
		[types.SAVE]: (state, { payload }: any) => {
			const { type } = payload;
			let newData = {};

			switch (type) {
				case types.GET_PURCHASE_REQUESTS:
				case types.GET_PURCHASE_REQUESTS_EXTENDED: {
					newData = { purchaseRequests: payload.purchaseRequests };
					break;
				}
				case types.GET_PURCHASE_REQUEST_BY_ID: {
					newData = { purchaseRequest: payload.purchaseRequest };
					break;
				}
				case types.GET_PURCHASE_REQUEST_BY_ID_AND_BRANCH: {
					const purchaseRequestsByBranch = cloneDeep(state.purchaseRequestsByBranch);
					if (payload?.branchId) {
						purchaseRequestsByBranch[payload?.branchId] = payload.purchaseRequest;
					} else {
						newData = { purchaseRequestForOutOfStock: payload.purchaseRequest };
						break;
					}

					newData = { purchaseRequestsByBranch };
					break;
				}
				case types.CREATE_PURCHASE_REQUEST: {
					newData = { purchaseRequests: [payload.purchaseRequest, ...state.purchaseRequests] };
					break;
				}
				case BMDeliveryReceiptTypes.RECEIVE_DELIVERY_RECEIPT: {
					const { purchaseRequestAction } = payload;
					const purchaseRequest = cloneDeep(state.purchaseRequest);
					purchaseRequest.action.action = purchaseRequestAction;
					newData = { purchaseRequest };
					break;
				}
			}

			return { ...state, ...newData };
		},

		[types.REMOVE_PURCHASE_REQUEST_BY_BRANCH]: (state) => {
			return { ...state, purchaseRequestsByBranch: {} };
		},

		[types.SET_PURCHASE_REQUEST_ACTION]: (state, { payload }: any) => {
			const purchaseRequest = cloneDeep(state.purchaseRequest);
			purchaseRequest.action.action = payload.action;

			return { ...state, purchaseRequest };
		},
	},
	initialState,
);

export const actions = {
	save: createAction(types.SAVE),
	getPurchaseRequests: createAction(types.GET_PURCHASE_REQUESTS),
	getPurchaseRequestsExtended: createAction(types.GET_PURCHASE_REQUESTS_EXTENDED),
	getPurchaseRequestById: createAction(types.GET_PURCHASE_REQUEST_BY_ID),
	getPurchaseRequestByIdAndBranch: createAction(types.GET_PURCHASE_REQUEST_BY_ID_AND_BRANCH),
	createPurchaseRequest: createAction(types.CREATE_PURCHASE_REQUEST),
	editPurchaseRequest: createAction(types.EDIT_PURCHASE_REQUEST),

	removePurchaseRequestByBranch: createAction(types.REMOVE_PURCHASE_REQUEST_BY_BRANCH),
	setPurchaseRequestAction: createAction(types.SET_PURCHASE_REQUEST_ACTION),
};

const selectState = (state: any) => state[key] || initialState;
export const selectors = {
	selectPurchaseRequest: () => createSelector(selectState, (state) => state.purchaseRequest),
	selectPurchaseRequestsByBranch: () =>
		createSelector(selectState, (state) => state.purchaseRequestsByBranch),
	selectPurchaseRequestForOutOfStock: () =>
		createSelector(selectState, (state) => state.purchaseRequestForOutOfStock),
	selectPurchaseRequests: () => createSelector(selectState, (state) => state.purchaseRequests),
	selectPurchaseRequestById: (id) =>
		createSelector(selectState, (state) =>
			state.purchaseRequests.find((purchaseRequest) => purchaseRequest.id === id),
		),
};

export default reducer;
