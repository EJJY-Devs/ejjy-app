import axios from 'axios';
import { IListRequest } from './interfaces';

interface List extends IListRequest {
	branch_id?: number;
	time_range?: string;
	as_of_date?: string;
	month?: string;
}

interface DetailList extends IListRequest {
	account_code: string;
	branch_id?: number;
	time_range?: string;
	as_of_date?: string;
	month?: string;
}

const service = {
	list: async (params: List, baseURL: string) =>
		axios.get('/general-ledger/', { baseURL, params }),

	detailList: async (params: DetailList, baseURL: string) =>
		axios.get('/general-ledger/details/', { baseURL, params }),
};

export default {
	...service,
};
