import axios from 'axios';
import { IListRequest } from './interfaces';

interface List extends IListRequest {
	search?: string;
	branch_product_id?: number;
	branch_id?: number;
	product_id?: number;
	product_category?: string;
	ordering?: string;
}

interface Edit {
	value: number;
}

interface Create {
	product_id: number;
	type: string;
}

const service = {
	list: async (params: List, baseURL) =>
		axios.get('/branches-product-balances/', { baseURL, params }),

	retrieve: async (id: number, baseURL) =>
		axios.get(`/branches-product-balances/${id}/`, { baseURL }),

	create: async (body: Create, baseURL) =>
		axios.post('/branches-product-balances/', body, { baseURL }),

	edit: async (id: number, body: Edit, baseURL) =>
		axios.patch(`/branches-product-balances/${id}/`, body, { baseURL }),

	getTypes: async (branchProductId: number, baseURL) =>
		axios.get('/branches-product-balances/types/', {
			baseURL,
			params: { branch_product_id: branchProductId },
		}),
};

export default {
	...service,
};
