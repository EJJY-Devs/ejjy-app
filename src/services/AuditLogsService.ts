import axios from 'axios';
import { IListRequest } from './interfaces';

interface ListAuditLogs extends IListRequest {
	type?: 'daily' | 'random' | 'all';
	is_filled_up?: boolean;
	time_range?: string;
	status?: string;
}

interface CreateAuditLog {
	branch_product_id: number;
	type: 'daily' | 'random';
	inputted_qty: number;
}

const service = {
	list: async (params: ListAuditLogs, baseURL: string) =>
		axios.get('/audit-logs/', { baseURL, params }),

	retrieve: async (id: number, baseURL: string) =>
		axios.get(`/audit-logs/${id}/`, { baseURL }),

	create: async (body: CreateAuditLog, baseURL: string) =>
		axios.post('/audit-logs/', body, { baseURL }),

	getCounts: async (baseURL: string) =>
		axios.get('/audit-logs/counts/', { baseURL }),

	markAdjusted: async (
		id: number,
		body: { adjustment_slip_id: number },
		baseURL: string,
	) => axios.patch(`/audit-logs/${id}/mark-adjusted/`, body, { baseURL }),
};

export default service;
