import axios from 'axios';
import { IListRequest } from './interfaces';

interface SingleProductCheckFulfill {
	product_check_product_id: number;
	fulfilled_quantity_piece: number;
}

interface FulfillProductCheck {
	products: SingleProductCheckFulfill[];
}

interface ListProductChecks extends IListRequest {
	type: 'daily' | 'random';
	is_filled_up: boolean;
	only_of_today?: boolean;
	time_range?: string;
}

const service = {
	list: async (params: ListProductChecks, baseURL) =>
		axios.get('/product-checks/', { baseURL, params }),

	retrieve: async (id, baseURL) =>
		axios.get(`/product-checks/${id}/`, { baseURL }),

	createDailyChecks: async (baseURL) =>
		axios.post(`/product-checks/create-daily-checks/`, {}, { baseURL }),

	createRandomChecks: async (baseURL) =>
		axios.post(`/product-checks/create-random-checks/`, {}, { baseURL }),

	fulfill: async (id: number, body: FulfillProductCheck, baseURL) =>
		axios.post(`/product-checks/${id}/fulfill/`, body, { baseURL }),
};

export default service;
