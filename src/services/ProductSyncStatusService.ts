import axios from 'axios';
import { IListRequest } from './interfaces';

interface List extends IListRequest {
	branch_id?: number;
	product_id?: number;
	out_of_sync_only?: boolean;
}

const service = {
	list: async (params: List, baseURL) =>
		axios.get('/product-sync-status/', { baseURL, params }),
};

export default service;
