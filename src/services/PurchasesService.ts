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
}

interface Modify {
	products: Product[];
	supplier_name: string;
	encoded_by_id?: number;
	authorizer_id?: number;
	overall_remarks?: string;
	branch_id: number;
	requisition_slip_id?: number;
	purchase_order_id?: number;
}

interface Update {
	journal_entry_id?: number | null;
}

const service = {
	list: async (params: List, baseURL: string) =>
		axios.get('/purchases/', { baseURL, params }),

	getById: async (id: number, baseURL: string) =>
		axios.get(`/purchases/${id}/`, { baseURL }),

	create: async (body: Modify, baseURL: string) =>
		axios.post('/purchases/', body, { baseURL }),

	update: async (id: number, body: Update, baseURL: string) =>
		axios.patch(`/purchases/${id}/`, body, { baseURL }),
};

export default service;
