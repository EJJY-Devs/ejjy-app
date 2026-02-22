import axios from 'axios';
import { IListRequest } from './interfaces';

interface List extends IListRequest {
	account_code?: string;
	account_name?: string;
	account_type?: number;
	sub_type?: number;
	normal_balance?: number;
}

interface Modify {
	account_code: string;
	account_name: string;
	account_type: number;
	sub_type: number;
	normal_balance: number;
}

const service = {
	list: async (params: List, baseURL: string) =>
		axios.get('/chart-of-accounts/', { baseURL, params }),

	create: async (body: Modify, baseURL: string) =>
		axios.post('/chart-of-accounts/', body, { baseURL }),

	edit: async (id: number, body: Partial<Modify>, baseURL: string) =>
		axios.patch(`/chart-of-accounts/${id}/`, body, { baseURL }),

	delete: async (id: number, baseURL: string) =>
		axios.delete(`/chart-of-accounts/${id}/`, { baseURL }),
};

export default {
	...service,
};
