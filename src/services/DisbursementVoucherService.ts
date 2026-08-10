import axios from 'axios';
import { IListRequest } from './interfaces';

interface List extends IListRequest {
	search?: string;
	branch_id?: number;
	time_range?: string;
	supplier_account_id?: number;
}

interface Particular {
	description: string;
	amount: number;
}

interface Create {
	payee: string;
	particulars?: Particular[];
	amount: number;
	payment_method: string;
	remarks?: string;
	authorizer_id?: number | null;
	branch_id?: number;
	supplier_account_id: number;
	purchase_id?: number | null;
}

const service = {
	list: async (params: List, baseURL: string) =>
		axios.get('/disbursement-vouchers/', { baseURL, params }),

	create: async (body: Create, baseURL: string) =>
		axios.post('/disbursement-vouchers/', body, { baseURL }),

	retrieve: async (id: number, baseURL: string) =>
		axios.get(`/disbursement-vouchers/${id}/`, { baseURL }),

	delete: async (id: number, baseURL: string) =>
		axios.delete(`/disbursement-vouchers/${id}/`, { baseURL }),
};

export default service;
