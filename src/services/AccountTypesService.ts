import axios from 'axios';
import { IListRequest } from './interfaces';

interface Modify {
	name: string;
}

const service = {
	list: async (params: IListRequest, baseURL) =>
		axios.get('/tags/account-types/', { baseURL, params }),

	create: async (body: Modify, baseURL) =>
		axios.post('/tags/account-types/', body, { baseURL }),

	edit: async (id: number, body: Modify, baseURL) =>
		axios.patch(`/tags/account-types/${id}/`, body, { baseURL }),

	delete: async (id: number, baseURL) =>
		axios.delete(`/tags/account-types/${id}/`, { baseURL }),
};

const serviceOffline = {
	listOffline: async (params: IListRequest, baseURL) =>
		axios.get('/offline-tags-account-types/', { baseURL, params }),
};

export default {
	...service,
	...serviceOffline,
};
