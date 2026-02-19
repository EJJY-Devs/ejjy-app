import axios from 'axios';
import { IListRequest } from './interfaces';

interface IList extends IListRequest {
	is_pending?: boolean;
	payor_id?: number;
	time_range?: string;
}

interface Modify {
	created_by_id: number;
	payor_id: number;
	branch_id?: number;
	amount: string;
	purpose: string;
	extra_description?: string;
	charge_sales_transaction_id?: number;
}

const service = {
	list: async (params: IList, baseURL: string) =>
		axios.get('/order-of-payments/', { baseURL, params }),

	create: async (body: Modify, baseURL: string) =>
		axios.post('/order-of-payments/', body, { baseURL }),
};

const serviceOffline = {
	listOffline: async (params: IList, baseURL) =>
		axios.get('/offline-order-of-payments/', { baseURL, params }),
};

export default {
	...service,
	...serviceOffline,
};
