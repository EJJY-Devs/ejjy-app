import axios from 'axios';
import { IListRequest } from './interfaces';

interface Modify {
	name: string;
	divisor_amount: number;
}

const service = {
	list: async (params: IListRequest, baseURL) =>
		axios.get('/tags/patronage-system-tags/', { baseURL, params }),

	create: async (body: Modify, baseURL) =>
		axios.post('/tags/patronage-system-tags/', body, { baseURL }),

	edit: async (id, body: Modify, baseURL) =>
		axios.patch(`/tags/patronage-system-tags/${id}/`, body, { baseURL }),

	delete: async (id, baseURL) =>
		axios.delete(`/tags/patronage-system-tags/${id}/`, { baseURL }),
};

const serviceOffline = {
	listOffline: async (params: IListRequest, baseURL) =>
		axios.get('/offline-tags-patronage-system-tags/', { baseURL, params }),
};

export default {
	...service,
	...serviceOffline,
};
