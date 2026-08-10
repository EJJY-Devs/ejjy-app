import axios from 'axios';
import { IListRequest } from './interfaces';

interface List extends IListRequest {
	branch_id?: number;
	product_id?: number;
	out_of_sync_only?: boolean;
}

interface Resolve {
	field: string;
	source: 'head_office' | 'branch';
}

const service = {
	list: async (params: List, baseURL) =>
		axios.get('/product-sync-status/', { baseURL, params }),

	resolve: async (id: number, body: Resolve, baseURL) =>
		axios.post(`/product-sync-status/${id}/resolve/`, body, { baseURL }),
};

export default service;
