import axios from 'axios';
import { IListRequest } from './interfaces';

interface List extends IListRequest {
	sender_branch_id?: number;
	receiver_id?: number;
	type?: string;
	time_range?: string;
}

interface Create {
	encoded_by_id: string;
	is_online: boolean;
	overall_remarks: string;
	products: Product[];
	sender_id: number;
	type: string;
	customer_name: string;
	customer_address: string;
	customer_tin: string;
	branch_id: number;
}

interface Edit {
	receiver_id: number;
}

interface Receive {
	is_online: boolean;
	products: Product[];
}

type Product = {
	product_id: number;
	quantity_returned: number | string;
	price_per_piece: number | string;
	remarks: string;
};

const service = {
	list: async (params: List, baseURL) =>
		axios.get('/back-orders/', { baseURL, params }),

	retrieve: async (id: number, baseURL) =>
		axios.get(`/back-orders/${id}/`, { baseURL }),

	create: async (body: Create, baseURL) =>
		axios.post('/back-orders/', body, { baseURL }),

	edit: async (id: number, body: Edit, baseURL) =>
		axios.patch(`/back-orders/${id}/`, body, { baseURL }),

	receive: async (id: number, body: Receive, baseURL) =>
		axios.post(`/back-orders/${id}/receive/`, body, { baseURL }),
};
export default service;
