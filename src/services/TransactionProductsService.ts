import axios from 'axios';
import { IListRequest } from './interfaces';

interface List extends IListRequest {
	is_vat_exempted?: boolean;
	or_number?: boolean;
	statuses?: string;
	time_range?: string;
	date?: string;
	branch_id?: string | number;
}

const service = {
	list: async (params: List, baseURL) =>
		axios.get('/transaction-products/', { baseURL, params }),

	getDates: async (
		params: { time_range?: string; branch_id?: string | number },
		baseURL,
	) => axios.get('/transaction-products/dates/', { baseURL, params }),

	getDailySummary: async (
		params: { date?: string; branch_id?: string | number; ordering?: string },
		baseURL,
	) => axios.get('/transaction-products/daily-summary/', { baseURL, params }),
};

export default service;
