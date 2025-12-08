import axios from 'axios';
import { IListRequest } from './interfaces';

interface List extends IListRequest {
	branch_id?: number;
	branch_product_id?: number;
	time_range?: string;
}

const service = {
	list: async (params: List, baseURL) =>
		axios.get('/product-conversions/', { baseURL, params }),
};

export default {
	...service,
};
