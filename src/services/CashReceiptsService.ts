import axios from 'axios';
import { IListRequest } from './interfaces';

interface List extends IListRequest {
	branch_id?: number;
	branch_machine_id?: number;
	time_range?: string;
}

const service = {
	list: async (params: List, baseURL: string) =>
		axios.get('/cash-receipts/', { baseURL, params }),
};

export default {
	...service,
};
