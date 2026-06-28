import axios from 'axios';
import { IListRequest } from './interfaces';

interface List extends IListRequest {
	search?: string;
	branch_id?: number;
	time_range?: string;
	entry_type?: string;
	expense_id?: number;
	purchase_id?: number;
}

interface Create {
	branch_id?: number;
	expense_id?: number;
	purchase_id?: number;
	debit_account: string;
	credit_account: string;
	amount: number;
	remarks: string;
	description?: string;
	entry_type?: string;
	datetime_created?: string;
}

const service = {
	list: async (params: List, baseURL: string) =>
		axios.get('/journal-entries/', { baseURL, params }),

	create: async (body: Create, baseURL: string) =>
		axios.post('/journal-entries/', body, { baseURL }),

	retrieve: async (id: number, baseURL: string) =>
		axios.get(`/journal-entries/${id}/`, { baseURL }),
};

export default {
	...service,
};
