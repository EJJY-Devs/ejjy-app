import axios from 'axios';
import { IListRequest } from './interfaces';

interface Modify {
	name: string;
}

const service = {
	list: async (params: IListRequest, baseURL) =>
		axios.get('/tags/account-sub-types/', { baseURL, params }),

	create: async (body: Modify, baseURL) =>
		axios.post('/tags/account-sub-types/', body, { baseURL }),

	edit: async (id: number, body: Modify, baseURL) =>
		axios.patch(`/tags/account-sub-types/${id}/`, body, { baseURL }),

	delete: async (id: number, baseURL) =>
		axios.delete(`/tags/account-sub-types/${id}/`, { baseURL }),
};

const serviceOffline = {
	listOffline: async (baseURL) =>
		axios.get('/offline-tags-account-sub-types/', { baseURL }),
};

export default {
	...service,
	...serviceOffline,
};
