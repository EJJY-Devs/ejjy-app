import axios from 'axios';
import { IListRequest } from './interfaces';

interface List extends IListRequest {
	branch_id?: number;
	is_resolved?: boolean;
}

const service = {
	list: async (params: List, baseURL: string) =>
		axios.get('/purchase-cost-notifications/', { baseURL, params }),

	resolve: async (id: number, baseURL: string) =>
		axios.post(`/purchase-cost-notifications/${id}/resolve/`, {}, { baseURL }),
};

export default service;
