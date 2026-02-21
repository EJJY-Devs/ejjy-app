import axios from 'axios';
import { IListRequest } from './interfaces';

interface Create {
	name: string;
}

type EditProductItems = {
	product_id: number;
};

interface Edit {
	name: string;
	items: EditProductItems[];
}

const service = {
	list: async (params: IListRequest, baseURL) =>
		axios.get('/tags/product-groups/', { baseURL, params }),

	retrieve: async (id: number, baseURL) =>
		axios.get(`/tags/product-groups/${id}/`, { baseURL }),

	create: async (body: Create, baseURL) =>
		axios.post('/tags/product-groups/', body, { baseURL }),

	edit: async (id: number, body: Edit, baseURL) =>
		axios.patch(`/tags/product-groups/${id}/`, body, { baseURL }),

	delete: async (id: number, baseURL) =>
		axios.delete(`/tags/product-groups/${id}/`, { baseURL }),
};

const serviceOffline = {
	listOffline: async (baseURL) =>
		axios.get('/offline-tags-product-groups/', { baseURL }),
};

export default {
	...service,
	...serviceOffline,
};
