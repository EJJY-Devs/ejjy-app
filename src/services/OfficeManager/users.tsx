import axios from 'axios';
import { IGetRequest } from '../interfaces';

interface IListUsersRequest extends IGetRequest {
	branch_id: number;
}

export const service = {
	list: async (params: IListUsersRequest, baseURL) =>
		axios.get('/online-users/', { baseURL, params }),

	getById: async (id, baseURL) => axios.get(`/online-users/${id}/`, { baseURL }),
};
