import axios from 'axios';
import { IListRequest } from './interfaces';

interface Modify {
	name: string;
}

const service = {
	list: async (params: IListRequest, baseURL) =>
		axios.get('/brand-names/', { baseURL, params }),

	create: async (body: Modify, baseURL) =>
		axios.post('/brand-names/', body, { baseURL }),

	edit: async (id: number, body: Modify, baseURL) =>
		axios.patch(`/brand-names/${id}/`, body, { baseURL }),

	delete: async (id: number, baseURL) =>
		axios.delete(`/brand-names/${id}/`, { baseURL }),
};

const serviceOffline = {
	listOffline: async (baseURL) =>
		axios.get('/offline-brand-names/', { baseURL }),
};

export default {
	...service,
	...serviceOffline,
};
