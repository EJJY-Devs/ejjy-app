import axios from 'axios';
import { IListRequest } from './interfaces';

interface List extends IListRequest {
	branch_id?: number;
	time_range?: string;
}

interface Detail {
	reference_number: string;
}

const service = {
	list: async (params: List, baseURL: string) =>
		axios.get('/trial-balance/', { baseURL, params }),

	detail: async (params: Detail, baseURL: string) =>
		axios.get('/trial-balance/details/', { baseURL, params }),
};

export default {
	...service,
};
