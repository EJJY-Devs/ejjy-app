import axios from 'axios';
import { IListRequest } from './interfaces';

interface Modify {
	name: string;
}

const service = {
	list: async (params: IListRequest, baseURL) =>
		axios.get('/storage-types/', { baseURL, params }),

	create: async (body: Modify, baseURL) =>
		axios.post('/storage-types/', body, { baseURL }),

	edit: async (id: number, body: Modify, baseURL) =>
		axios.patch(`/storage-types/${id}/`, body, { baseURL }),

	delete: async (id: number, baseURL) =>
		axios.delete(`/storage-types/${id}/`, { baseURL }),
};

const serviceOffline = {
	listOffline: async (baseURL) =>
		axios.get('/offline-storage-types/', { baseURL }),
};

export default {
	...service,
	...serviceOffline,
};
