import axios from 'axios';
import { IListRequest } from './interfaces';

interface List extends IListRequest {
	branch_id: number;
	has_bo_balance?: boolean;
	has_negative_balance?: boolean;
	identifier?: string;
	is_sold_in_branch?: boolean;
	product_category?: string;
	product_ids?: number[] | number | string;
	product_status?: string;
	time_range?: string;
	ids?: string;
	search_by?: string;
}

interface Edit {
	allowable_spoilage: number;
	assigned_personnel_id: number;
	cost_per_bulk: string;
	cost_per_piece: string;
	credit_price_per_bulk: number;
	credit_price: number;
	current_balance: number;
	is_daily_checked: boolean;
	is_randomly_checked: boolean;
	is_sold_in_branch: boolean;
	markdown_price_per_bulk1: string;
	markdown_price_per_bulk2: string;
	markdown_price_per_piece1: string;
	markdown_price_per_piece2: string;
	max_balance: number;
	price_per_bulk: string;
	price_per_piece: string;
	reorder_point: number;
	wholesale_price: number;
	special_price: number;
	acting_user_id: number;
}

type EditPriceCostData = {
	branch_ids: string;
	cost_per_bulk: string;
	cost_per_piece: string;
	credit_price_per_bulk: string;
	credit_price_per_piece: string;
	government_credit_price_per_bulk: string;
	government_credit_price_per_piece: string;
	markdown_price_per_bulk1: string;
	markdown_price_per_bulk2: string;
	markdown_price_per_piece1: string;
	markdown_price_per_piece2: string;
	price_per_bulk: string;
	price_per_piece: string;
};

interface EditPriceCost {
	acting_user_id: number;
	data: EditPriceCostData[];
	product_id: number;
}

const service = {
	list: async (params: List, baseURL) =>
		axios.get('/branches-products/', { baseURL, params }),

	listWithAnalytics: async (params: List, baseURL) =>
		axios.get('/branches-products/with-analytics/', { baseURL, params }),

	edit: async (id: number, body: Edit, baseURL) =>
		axios.patch(`/branches-products/${id}/`, body, { baseURL }),

	editPriceCost: async (body: EditPriceCost, baseURL) =>
		axios.patch('/branches-products/update-price-and-cost/', body, { baseURL }),
};

const serviceOffline = {
	listOffline: async (params: List, baseURL) =>
		axios.get('/offline-branches-products/', { baseURL, params }),
};

export default {
	...service,
	...serviceOffline,
};
