import axios from 'axios';
import { IGetRequest } from './interfaces';

type Product = {
	product_id: number;
	quantity_piece: number;
	quantity_bulk: number;
};

interface ICreatePurchaseRequest {
	requestor_id: number;
	type: 'manual' | 'automatic';
	products: Product[];
}

interface IEditPurchaseRequest {
	id: number;
	action:
		| 'new'
		| 'seen'
		| 'f_os1_created'
		| 'f_os1_prepared'
		| 'f_ds1_created'
		| 'f_ds1_done'
		| 'f_ds1_error';
}

interface IBranchIdGetRequestPurchaseRequest {
	preparing_branch_id: number;
}

export const service = {
	list: async (params: IGetRequest) => axios.get('/purchase-requests/', { params }),
	listExtended: async (params: IGetRequest) =>
		axios.get('/purchase-requests/extended/', { params }),
	getById: async (id) => axios.get(`/purchase-requests/${id}/extended`),
	getByIdAndBranch: async (params: IBranchIdGetRequestPurchaseRequest, id: number) =>
		axios.get(`/purchase-requests/${id}/with-preparing-branch-details`, { params }),
	create: async (body: ICreatePurchaseRequest) => axios.post('/purchase-requests/', body),
	edit: async (body: IEditPurchaseRequest) => axios.patch(`/purchase-requests/${body.id}/`, body),
};
