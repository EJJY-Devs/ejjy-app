import axios from 'axios';
import { IGetRequest } from '../interfaces';

interface ICreatePendingTransaction {
	branch_id: number;
	name: string;
	url: string;
	request_type: string;
	request_model: string;
	request_query_params: string;
	request_body: string;
}

interface IEditPendingTransaction {
	is_pending_approval: boolean;
}

export const service = {
	list: async (params: IGetRequest, baseURL) =>
		axios.get('/pending-database-transactions/', { baseURL, params }),

	create: async (body: ICreatePendingTransaction, baseURL) =>
		axios.post('/pending-database-transactions/', body, { baseURL }),

	edit: async (id, body: IEditPendingTransaction, baseURL) =>
		axios.patch(`/pending-database-transactions/${id}/`, body, { baseURL }),

	remove: async (id, baseURL) => axios.delete(`/pending-database-transactions/${id}/`, { baseURL }),

	execute: async (configuration) => axios(configuration),
};