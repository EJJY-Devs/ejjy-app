import axios from 'axios';
import { IListRequest } from './interfaces';

interface Modify {
	name: string;
	server_url: string;
	store_name: string;
	store_address: string;
	proprietor: string;
	contact_number: string;
	vat_type: string;
	tin: string;
}

interface Ping {
	branch_key: string;
}

const service = {
	list: async (params: IListRequest, baseURL) =>
		axios.get('/branches/', { baseURL, params }),

	retrieve: async (id, baseURL) => axios.get(`/branches/${id}/`, { baseURL }),

	create: async (body: Modify, baseURL) =>
		axios.post('/branches/', body, { baseURL }),

	ping: async (body: Ping, baseURL) =>
		axios.post('/branches/ping/', body, { baseURL }),

	edit: async (id, body: Modify, baseURL) =>
		axios.patch(`/branches/${id}/`, body, { baseURL }),

	delete: async (id, baseURL) => axios.delete(`/branches/${id}/`, { baseURL }),
};

const serviceOffline = {
	listOffline: async (params: IListRequest, baseURL) =>
		axios.get('/offline-branches/', { baseURL, params }),

	retrieveOffline: async (id, baseURL) =>
		axios.get(`/offline-branches/${id}/`, { baseURL }),
};

export default {
	...service,
	...serviceOffline,
};
