import axios from 'axios';
import { IGetRequest } from './interfaces';

interface ICreateBranchDay {
	started_by_id: number;
}

interface IEditBranchDay {
	ended_by_id: number;
}

export const service = {
	list: async (params: IGetRequest, baseURL) => axios.get('/branches-days/', { baseURL, params }),

	get: async (params: IGetRequest, baseURL) =>
		axios.get('/branches-days/latest/', { baseURL, params }),

	create: async (body: ICreateBranchDay, baseURL) =>
		axios.post('/branches-days/', body, { baseURL }),

	edit: async (id: number, body: IEditBranchDay, baseURL) =>
		axios.patch(`/branches-days/${id}/`, body, { baseURL }),
};
