import axios from 'axios';
import { IListRequest } from './interfaces';

interface List extends IListRequest {
	search?: string;
	branch_product_id?: number;
	branch_id?: number;
	product_id?: number;
	product_category?: string;
}

interface Edit {
	value: number;
}

const service = {
	list: async (params: List, baseURL) =>
		axios.get('/branches-product-balances/', { baseURL, params }),

	retrieve: async (id: number, baseURL) =>
		axios.get(`/branches-product-balances/${id}/`, { baseURL }),

	edit: async (id: number, body: Edit, baseURL) =>
		axios.patch(`/branches-product-balances/${id}/`, body, { baseURL }),
};

export default {
	...service,
};
