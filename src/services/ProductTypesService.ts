import axios from 'axios';
import { IListRequest } from './interfaces';

interface Modify {
	name: string;
}

const service = {
	list: async (params: IListRequest, baseURL) =>
		axios.get('/tags/product-types/', { baseURL, params }),

	create: async (body: Modify, baseURL) =>
		axios.post('/tags/product-types/', body, { baseURL }),

	edit: async (id: number, body: Modify, baseURL) =>
		axios.patch(`/tags/product-types/${id}/`, body, { baseURL }),

	delete: async (id: number, baseURL) =>
		axios.delete(`/tags/product-types/${id}/`, { baseURL }),
};

const serviceOffline = {
	listOffline: async (baseURL) =>
		axios.get('/offline-tags-product-types/', { baseURL }),
};

export default {
	...service,
	...serviceOffline,
};
