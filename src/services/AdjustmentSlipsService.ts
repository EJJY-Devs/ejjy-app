import axios from 'axios';

interface Product {
	product_id: number;
	adjusted_value: string;
	remarks: string;
	error_remarks: string;
}

interface ListParams {
	branch_id?: number;
	encoded_by_id?: number;
	page?: number;
	page_size?: number;
	time_range?: string;
}

interface Create {
	products: Product[];
	encoded_by_id: number;
	branch_id: number;
}

const service = {
	list: async (params: ListParams, baseURL: string) =>
		axios.get('/adjustment-slips/', { baseURL, params }),

	create: async (body: Create, baseURL: string) =>
		axios.post('/adjustment-slips/', body, { baseURL }),
};

export default service;
