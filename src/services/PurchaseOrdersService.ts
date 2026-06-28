import axios from 'axios';
import { IListRequest } from './interfaces';

type Product = {
	product_id: number;
	cost_per_piece: number;
	quantity: number;
};

interface List extends IListRequest {
	time_range?: string;
	branch_id?: number;
	requisition_slip_id?: number;
}

interface Create {
	products: Product[];
	supplier_name: string;
	authorizer_id?: number;
	overall_remarks?: string;
	branch_id: number;
	requisition_slip_id?: number;
}

const service = {
	list: async (params: List, baseURL: string) =>
		axios.get('/purchase-orders/', { baseURL, params }),

	getById: async (id: number, baseURL: string) =>
		axios.get(`/purchase-orders/${id}/`, { baseURL }),

	create: async (body: Create, baseURL: string) =>
		axios.post('/purchase-orders/', body, { baseURL }),
};

export default service;
