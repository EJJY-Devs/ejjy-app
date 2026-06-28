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
	has_void_adjustment_slip?: boolean;
}

interface CreateAdjustmentSlip {
	encoded_by_id: number;
}

const service = {
	list: async (params: List, baseURL) =>
		axios.get('/transactions/', { baseURL, params }),

	retrieve: async (id: number, baseURL) =>
		axios.get(`/transactions/${id}/`, { baseURL }),

	summary: async (params: List, baseURL) =>
		axios.get('/transactions/summary/', { baseURL, params }),

	createAdjustmentSlip: async (
		id: number,
		body: CreateAdjustmentSlip,
		baseURL: string,
	) =>
		axios.post(`/transactions/${id}/create-adjustment-slip/`, body, {
			baseURL,
		}),
};

export default service;
