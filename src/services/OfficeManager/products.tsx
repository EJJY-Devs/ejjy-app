import axios from 'axios';
import { IGetRequest } from '../interfaces';

interface ICreateProduct {
	barcode: string;
	name: string;
	type: 'Wet' | 'Dry';
	unit_of_measurement: 'Weighing' | 'Non-Weighing';
	print_details: string;
	description: string;
	allowable_spoilage?: number;
	cost_per_piece: number;
	cost_per_bulk: number;
	reorder_point: number;
	max_balance: number;
	price_per_piece: number;
	price_per_bulk: number;
}

interface IEditProduct {
	id: number;
	barcode?: string;
	name?: string;
	type?: 'Wet' | 'Type';
	unit_of_measurement?: 'Weighing' | 'Non-Weighing';
	print_details?: string;
	description?: string;
	allowable_spoilage?: number;
	cost_per_piece?: number;
	cost_per_bulk?: number;
	reorder_point?: number;
	max_balance?: number;
	price_per_piece?: number;
	price_per_bulk?: number;
}

export const service = {
	list: async (params: IGetRequest, baseURL) => axios.get('/products/', { baseURL, params }),

	create: async (body: ICreateProduct, baseURL) => axios.post('/products/', body, { baseURL }),

	edit: async (body: IEditProduct, baseURL) =>
		axios.patch(`/products/${body.id}/online-update/`, body, { baseURL }),

	remove: async (id, baseURL) => axios.delete(`/products/${id}/online-destroy/`, { baseURL }),
};
