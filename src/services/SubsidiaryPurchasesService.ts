import axios from 'axios';
import { IListRequest } from './interfaces';

interface List extends IListRequest {
	branch_id?: number;
	time_range?: string;
}

const service = {
	list: async (params: List, baseURL: string) =>
		axios.get('/subsidiary-purchases/', { baseURL, params }),
};

export default {
	...service,
};
