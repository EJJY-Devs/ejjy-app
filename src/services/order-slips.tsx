import axios from 'axios';
import { IGetRequest } from './interfaces';

type Product = {
	product_id: number;
	quantity_piece?: number;
	quantity_bulk?: number;
	assigned_person_id: number;
};

type EditProduct = {
	order_slip_product_id: number;
	product_id: number;
	quantity_piece?: number;
	quantity_bulk?: number;
	assigned_person_id: number;
};

interface ICreateOrderSlip {
	requesting_user_id: number;
	assigned_store_id: number;
	purchase_request_id: number;
	products: Product[];
}

interface IEditOrderSlip {
	id: number;
	assigned_store_id: number;
	products: EditProduct[];
}

interface IGetOrderSlipsRequest extends IGetRequest {
	purchase_request_id: number;
	is_out_of_stock?: boolean;
}

export const service = {
	list: async (params: IGetOrderSlipsRequest) => axios.get('/order-slips/', { params }),
	listExtended: async (params: IGetOrderSlipsRequest) =>
		axios.get('/order-slips/extended/', { params }),
	create: async (body: ICreateOrderSlip) => axios.post('/order-slips/', body),
	edit: async (body: IEditOrderSlip) => axios.patch(`/order-slips/${body.id}/`, body),
	remove: async (id: number) => axios.delete(`/order-slips/${id}/`),
};
