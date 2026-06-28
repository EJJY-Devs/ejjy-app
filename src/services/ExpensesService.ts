import axios from 'axios';
import { IListRequest } from './interfaces';

interface List extends IListRequest {
	search?: string;
	branch_id?: number;
	time_range?: string;
	journal_entry_status?: string;
}

interface Create {
	payee: string;
	particulars?: string;
	amount: number;
	received_by?: string;
	authorizer_id?: number | null;
	branch_id?: number;
}

interface Update {
	journal_entry_id?: number | null;
}

const service = {
	list: async (params: List, baseURL: string) =>
		axios.get('/expenses/', { baseURL, params }),

	create: async (body: Create, baseURL: string) =>
		axios.post('/expenses/', body, { baseURL }),

	retrieve: async (id: number, baseURL: string) =>
		axios.get(`/expenses/${id}/`, { baseURL }),

	update: async (id: number, body: Update, baseURL: string) =>
		axios.patch(`/expenses/${id}/`, body, { baseURL }),

	delete: async (id: number, baseURL: string) =>
		axios.delete(`/expenses/${id}/`, { baseURL }),
};

export default service;
