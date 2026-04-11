import axios from 'axios';
import { IListRequest } from './interfaces';

interface Modify {
	name: string;
	priority_level: number;
}

const service = {
	list: async (params: IListRequest, baseURL) =>
		axios.get('/tags/product-categories/', { baseURL, params }),

	create: async (body: Modify, baseURL) =>
		axios.post('/tags/product-categories/', body, { baseURL }),

	edit: async (id, body: Modify, baseURL) =>
		axios.patch(`/tags/product-categories/${id}/`, body, { baseURL }),

	delete: async (id, baseURL) =>
		axios.delete(`/tags/product-categories/${id}/`, { baseURL }),
};

const serviceOffline = {
	listOffline: async (params: IListRequest, baseURL) =>
		axios.get('/offline-tags-product-categories/', { baseURL, params }),
};

export default {
	...service,
	...serviceOffline,
};
