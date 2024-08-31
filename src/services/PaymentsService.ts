import axios from 'axios';
import { IListRequest } from './interfaces';

interface List extends IListRequest {
	branch_machine_id?: number;
	is_adjusted?: boolean;
	mode_of_payment?: string;
	statuses?: string;
	time_range?: string;
}

const service = {
	summary: async (params: List, baseURL) =>
		axios.get('/payments/summary/', { baseURL, params }),
};

export default service;
