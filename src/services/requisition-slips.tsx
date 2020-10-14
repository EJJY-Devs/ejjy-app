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

interface IBranchIdGetRequestRequisitionSlip {
	preparing_branch_id?: number;
}

export const service = {
	list: async (params: IGetRequest) => axios.get('/requisition-slips/', { params }),
	listExtended: async (params: IGetRequest) =>
		axios.get('/requisition-slips/extended/', { params }),
	getById: async (id) => axios.get(`/requisition-slips/${id}/extended/`),
	getByIdAndBranch: async (params: IBranchIdGetRequestRequisitionSlip, id: number) =>
		axios.get(`/requisition-slips/${id}/with-preparing-branch-details/`, { params }),
	create: async (body: ICreateRequisitionSlip) => axios.post('/requisition-slips/', body),
	edit: async (body: IEditRequisitionSlip) => axios.patch(`/requisition-slips/${body.id}/`, body),
};
