import axios from 'axios';
import { IListRequest } from './interfaces';

interface Modify {
	name: string;
}

const service = {
	list: async (params: IListRequest, baseURL) =>
		axios.get('/product-types/', { baseURL, params }),

	create: async (body: Modify, baseURL) =>
		axios.post('/product-types/', body, { baseURL }),

	edit: async (id: number, body: Modify, baseURL) =>
		axios.patch(`/product-types/${id}/`, body, { baseURL }),

	delete: async (id: number, baseURL) =>
		axios.delete(`/product-types/${id}/`, { baseURL }),
};

const serviceOffline = {
	listOffline: async (baseURL) =>
		axios.get('/offline-product-types/', { baseURL }),
};

export default {
	...service,
	...serviceOffline,
};
