import axios from 'axios';
import { IListRequest } from './interfaces';

interface Modify {
	name: string;
}

const service = {
	list: async (params: IListRequest, baseURL) =>
		axios.get('/tags/storage-types/', { baseURL, params }),

	create: async (body: Modify, baseURL) =>
		axios.post('/tags/storage-types/', body, { baseURL }),

	edit: async (id: number, body: Modify, baseURL) =>
		axios.patch(`/tags/storage-types/${id}/`, body, { baseURL }),

	delete: async (id: number, baseURL) =>
		axios.delete(`/tags/storage-types/${id}/`, { baseURL }),
};

const serviceOffline = {
	listOffline: async (baseURL) =>
		axios.get('/offline-tags-storage-types/', { baseURL }),
};

export default {
	...service,
	...serviceOffline,
};
