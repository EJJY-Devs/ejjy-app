import axios from 'axios';
import { IGetRequest } from '../interfaces';

interface PreparattionSlipProduct {
	order_slip_product_id: number;
	product_id: number;
	quantity_piece: number;
	fulfilled_quantity_piece: number;
	assigned_person_id: number;
}

interface IFulfillPreparationSlip {
	id: number;
	assigned_store_id: number;
	is_prepared?: boolean;
	products: PreparattionSlipProduct[];
}

interface IGetPreparationSlipsRequest extends IGetRequest {
	id?: number;
	requisition_slip_id: number;
	assigned_store_id: number;
	assigned_personnel_id: number;
}

interface IGetPreparationSlipByIdRequest {
	assigned_personnel_id: number;
}

export const service = {
	list: async (params: IGetPreparationSlipsRequest, baseURL) =>
		axios.get('/order-slips/with-assigned-personnel-details/', {
			baseURL,
			params,
		}),

	getById: async (id, params: IGetPreparationSlipByIdRequest, baseURL) =>
		axios.get(`/order-slips/${id}/with-assigned-personnel-details/`, {
			baseURL,
			params,
		}),

	fulfill: async (body: IFulfillPreparationSlip, baseURL) =>
		axios.patch(`/order-slips/${body.id}/`, body, { baseURL }),
};
