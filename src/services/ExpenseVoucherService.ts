import axios from 'axios';
import { IListRequest } from './interfaces';

interface List extends IListRequest {
	search?: string;
	branch_id?: number;
	time_range?: string;
	journal_entry_status?: string;
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
	remarks?: string;
	authorizer_id?: number | null;
	branch_id?: number;
	supplier_account_id?: number | null;
}

interface Update {
	journal_entry_id?: number | null;
}

const service = {
	list: async (params: List, baseURL: string) =>
		axios.get('/expense-vouchers/', { baseURL, params }),

	create: async (body: Create, baseURL: string) =>
		axios.post('/expense-vouchers/', body, { baseURL }),

	retrieve: async (id: number, baseURL: string) =>
		axios.get(`/expense-vouchers/${id}/`, { baseURL }),

	update: async (id: number, body: Update, baseURL: string) =>
		axios.patch(`/expense-vouchers/${id}/`, body, { baseURL }),

	delete: async (id: number, baseURL: string) =>
		axios.delete(`/expense-vouchers/${id}/`, { baseURL }),
};

export default service;
