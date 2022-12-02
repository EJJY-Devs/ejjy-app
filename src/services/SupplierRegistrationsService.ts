import axios from 'axios';
import { IListRequest } from './interfaces';

interface Modify {
	account_id: number;
}

const service = {
	list: async (params: IListRequest, baseURL: string) =>
		axios.get('/supplier-registrations/', { baseURL, params }),

	create: async (body: Modify, baseURL: string) =>
		axios.post('/supplier-registrations/', body, { baseURL }),

	delete: async (id: number, baseURL) =>
		axios.delete(`/supplier-registrations/${id}/`, { baseURL }),
};

export default service;
