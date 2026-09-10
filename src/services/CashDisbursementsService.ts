import axios from 'axios';
import { IListRequest } from './interfaces';

interface List extends IListRequest {
	branch_id?: number;
	time_range?: string;
}

interface UpsertDetail {
	source_type: 'expense' | 'purchase';
	source_id: number;
	ewt_percentage: number;
	other_deductions_amount: number;
	other_deductions_remarks?: string;
}

const service = {
	list: async (params: List, baseURL: string) =>
		axios.get('/cash-disbursements/', { baseURL, params }),

	upsertDetail: async (body: UpsertDetail, baseURL: string) =>
		axios.post('/cash-disbursements/detail/', body, { baseURL }),
};

export default {
	...service,
};
