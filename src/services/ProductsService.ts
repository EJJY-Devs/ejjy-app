import axios from 'axios';
import { IListRequest } from 'services/interfaces';

interface List extends IListRequest {
	product_category?: string;
	ids?: string;
}

interface Modify {
	acting_user_id: number;
	allowable_spoilage?: number;
	barcode: string;
	cost_per_bulk: number;
	cost_per_piece: number;
	description: string;
	has_quantity_allowance: boolean;
	is_shown_in_scale_list?: boolean;
	is_vat_exempted: boolean;
	max_balance: number;
	name: string;
	pieces_in_bulk: number;
	price_per_bulk: number;
	price_per_piece: number;
	print_details: string;
	product_category: string;
	reorder_point: number;
	textcode: number;
	type: 'Wet' | 'Dry';
	unit_of_measurement: 'Weighing' | 'Non-Weighing';
}

interface Delete extends IListRequest {
	acting_user_id: number;
}

const service = {
	list: async (params: List, baseURL) =>
		axios.get('/products/', { baseURL, params }),

	create: async (body: Modify, baseURL) =>
		axios.post('/products/', body, { baseURL }),

	edit: async (id: number, body: Modify, baseURL) =>
		axios.patch(`/products/${id}/`, body, { baseURL }),

	delete: async (id, body: Delete, baseURL) =>
		axios.delete(`/products/${id}/`, { data: body, baseURL }),
};

export default service;