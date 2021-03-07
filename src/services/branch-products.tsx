import axios from 'axios';
import { IGetRequest } from './interfaces';

interface IEditBranchProduct {
	id?: number;
	product_id?: number;
	reorder_point?: number;
	max_balance?: number;
	price_per_piece?: number;
	discounted_price_per_piece1?: number;
	discounted_price_per_piece2?: number;
	price_per_bulk?: number;
	discounted_price_per_bulk1?: number;
	discounted_price_per_bulk2?: number;
	current_balance?: number;
	allowable_spoilage?: number;
}

interface IGetBranchProducts extends IGetRequest {
	search?: string;
}

export const service = {
	list: async (params: IGetBranchProducts, baseURL) =>
		axios.get('/branches-products/extended/', { baseURL, params }),

	listByBranch: async (params: IGetBranchProducts, baseURL) =>
		axios.get('branches-products/with-branch-manager-details/', { baseURL, params }),

	edit: async (body: IEditBranchProduct, baseURL) =>
		axios.patch(`/branches-products/${body.id}/`, body, { baseURL }),
};
