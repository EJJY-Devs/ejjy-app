import axios from 'axios';
import { IListRequest } from './interfaces';

interface Modify {
	name: string;
}

const service = {
	list: async (params: IListRequest, baseURL) =>
		axios.get('/product-locations/', { baseURL, params }),

	create: async (body: Modify, baseURL) =>
		axios.post('/product-locations/', body, { baseURL }),

	edit: async (id: number, body: Modify, baseURL) =>
		axios.patch(`/product-locations/${id}/`, body, { baseURL }),

	delete: async (id: number, baseURL) =>
		axios.delete(`/product-locations/${id}/`, { baseURL }),
};

const serviceOffline = {
	listOffline: async (baseURL) =>
		axios.get('/offline-product-locations/', { baseURL }),
};

export default {
	...service,
	...serviceOffline,
};
