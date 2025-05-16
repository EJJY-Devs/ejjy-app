import axios from 'axios';
import { IListRequest } from 'services/interfaces';

interface List extends IListRequest {
	branch_id: number;
	ids?: string;
	product_category?: string;
}

interface Modify {
	acting_user_id: number;
	// allowable_spoilage?: number;
	// barcode: string;
	// conversion_amount?: number;
	cost_per_bulk: number;
	cost_per_piece: number;
	// description: string;
	// has_quantity_allowance: boolean;
	is_daily_checked?: boolean;
	is_randomly_checked?: boolean;
	is_shown_in_scale_list?: boolean;
	is_sold_in_branch?: boolean;
	is_vat_exempted?: boolean;
	max_balance: number;
	name: string;
	// packing_barcode_unit_of_measurement?: 'Weighing' | 'Non-Weighing';
	// packing_barcode?: string;
	pieces_in_bulk: number;
	point_system_tag_id: number;
	price_per_bulk: number;
	price_per_piece: number;
	price_tag_print_details: string;
	print_details: string;
	product_category: string;
	reorder_point: number;
	selling_barcode_unit_of_measurement?: 'Weighing' | 'Non-Weighing';
	selling_barcode?: string;
	textcode: number;
	type: 'Wet' | 'Dry';
	unit_of_measurement: 'Weighing' | 'Non-Weighing';
	wholesale_price: number;
	credit_price: number;
	special_price: number;
	is_multiple_instance: boolean;
}

interface Delete extends IListRequest {
	acting_user_id: number;
}

const service = {
	list: async (params: List, baseURL) =>
		axios.get('/products/', { baseURL, params }),

	create: async (body: Modify, baseURL) =>
		axios.post('/products/', body, { baseURL }),

	reinitialize: async (body, baseURL) =>
		axios.post('/products/reinitialize-with-csv/', body, {
			baseURL,
			headers: {
				'content-type': 'multipart/form-data',
			},
		}),

	edit: async (id: number, body: Modify, baseURL) =>
		axios.patch(`/products/${id}/`, body, { baseURL }),

	delete: async (id, body: Delete, baseURL) =>
		axios.delete(`/products/${id}/`, { data: body, baseURL }),
};

const serviceOffline = {
	listOffline: async (params: List, baseURL) =>
		axios.get('/offline-products/', { baseURL, params }),
};

export default {
	...service,
	...serviceOffline,
};
