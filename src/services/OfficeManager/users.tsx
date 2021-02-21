import axios from 'axios';
import { IGetRequest } from '../interfaces';

export const service = {
	list: async (params: IGetRequest, baseURL) => axios.get('/users/', { baseURL, params }),

	listOnline: async (params: IGetRequest, baseURL) =>
		axios.get('/online-users/', { baseURL, params }),

	getByIdOnline: async (id, baseURL) => axios.get(`/online-users/${id}/`, { baseURL }),

	createOnline: async (body, baseURL) => axios.post('/online-users/', body, { baseURL }),

	editOnline: async (id, body, baseURL) => axios.patch(`/online-users/${id}/`, body, { baseURL }),

	removeOnline: async (id, baseURL) => axios.delete(`/online-users/${id}/`, { baseURL }),
};
