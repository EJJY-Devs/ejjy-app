import axios from 'axios';
import { IListRequest } from './interfaces';

interface List extends IListRequest {
	search?: string;
}

interface Entry {
	debit_account: string;
	credit_account: string;
}

interface Create {
	name: string;
	information?: string;
	entries: Entry[];
}

const service = {
	list: async (params: List, baseURL: string) =>
		axios.get('/accounting-transactions/', { baseURL, params }),

	create: async (body: Create, baseURL: string) =>
		axios.post('/accounting-transactions/', body, { baseURL }),

	delete: async (id: number, baseURL: string) =>
		axios.delete(`/accounting-transactions/${id}/`, { baseURL }),
};

const serviceOffline = {
	listOffline: async (baseURL: string) =>
		axios.get('/offline-accounting-transactions/', { baseURL }),
};

export default {
	...service,
	...serviceOffline,
};
