import axios from 'axios';
import { IListRequest } from './interfaces';

interface Modify {
	name: string;
}

const service = {
	list: async (params: IListRequest, baseURL) =>
		axios.get('/tags/normal-balances/', { baseURL, params }),

	create: async (body: Modify, baseURL) =>
		axios.post('/tags/normal-balances/', body, { baseURL }),

	edit: async (id: number, body: Modify, baseURL) =>
		axios.patch(`/tags/normal-balances/${id}/`, body, { baseURL }),

	delete: async (id: number, baseURL) =>
		axios.delete(`/tags/normal-balances/${id}/`, { baseURL }),
};

const serviceOffline = {
	listOffline: async (params: IListRequest, baseURL) =>
		axios.get('/offline-tags-normal-balances/', { baseURL, params }),
};

export default {
	...service,
	...serviceOffline,
};
