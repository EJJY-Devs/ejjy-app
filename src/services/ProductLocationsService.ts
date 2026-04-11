import axios from 'axios';
import { IListRequest } from './interfaces';

interface Modify {
	name: string;
}

const service = {
	list: async (params: IListRequest, baseURL) =>
		axios.get('/tags/product-locations/', { baseURL, params }),

	create: async (body: Modify, baseURL) =>
		axios.post('/tags/product-locations/', body, { baseURL }),

	edit: async (id: number, body: Modify, baseURL) =>
		axios.patch(`/tags/product-locations/${id}/`, body, { baseURL }),

	delete: async (id: number, baseURL) =>
		axios.delete(`/tags/product-locations/${id}/`, { baseURL }),
};

const serviceOffline = {
	listOffline: async (baseURL) =>
		axios.get('/offline-tags-product-locations/', { baseURL }),
};

export default {
	...service,
	...serviceOffline,
};
