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
	supplier_address?: string;
	supplier_tin: string;
	encoded_by_id?: string;
	checked_by_id: string;
	branch_id: number;
	overall_remarks?: string;
}

const service = {
	list: async (params: List, baseURL: string) =>
		axios.get('/receiving-vouchers/', {
			baseURL,
			params: { ...params, limit: 'all' },
		}),

	create: async (body: Modify, baseURL: string) =>
		axios.post('/receiving-vouchers/', body, { baseURL }),
};

const serviceOffline = {
	listOffline: async (params: List, baseURL: string) =>
		axios.get('/offline-receiving-vouchers/', {
			baseURL,
			params: { ...params, limit: 'all' },
		}),
};

export default {
	...service,
	...serviceOffline,
};
