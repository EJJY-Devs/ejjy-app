import axios from 'axios';
import { IListRequest } from './interfaces';

interface List extends IListRequest {
	branch_machine_id?: number;
	branch_id?: number;
	is_adjusted?: boolean;
	mode_of_payment?: string;
	payor_creditor_account_id?: number;
	statuses?: string;
	time_range?: string;
	or_number?: string;
}

const service = {
	list: async (params: List, baseURL) =>
		axios.get('/transactions/', { baseURL, params }),

	retrieve: async (id: number, baseURL) =>
		axios.get(`/transactions/${id}/`, { baseURL }),

	summary: async (params: List, baseURL) =>
		axios.get('/transactions/summary/', { baseURL, params }),
};

export default service;
