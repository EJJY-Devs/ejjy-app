import axios from 'axios';
import { IGetRequest } from './interfaces';

type Product = {
	product_id: number;
	quantity_piece: number;
	quantity_bulk: number;
};

interface ICreateRequisitionSlip {
	requestor_id: number;
	type: 'manual' | 'automatic';
	products: Product[];
}

interface IEditRequisitionSlip {
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

interface IGetRequisitionSlip extends IGetRequest {
	branch_id?: number;
	status?: string;
}

interface IGetRequestRequisitionSlipBranchId {
	preparing_branch_id?: number;
}

export const service = {
	list: async (params: IGetRequisitionSlip, baseURL) =>
		axios.get('/requisition-slips/', { baseURL, params }),

	listExtended: async (params: IGetRequisitionSlip, baseURL) =>
		axios.get('/requisition-slips/extended/', { baseURL, params }),

	getById: async (id, baseURL) => axios.get(`/requisition-slips/${id}/extended/`, { baseURL }),

	getByIdAndBranch: async (params: IGetRequestRequisitionSlipBranchId, id: number, baseURL) =>
		axios.get(`/requisition-slips/${id}/with-preparing-branch-details/`, { baseURL, params }),

	create: async (body: ICreateRequisitionSlip, baseURL) =>
		axios.post('/requisition-slips/', body, { baseURL }),

	edit: async (body: IEditRequisitionSlip, baseURL) =>
		axios.patch(`/requisition-slips/${body.id}/`, body, { baseURL }),
};
