import axios from 'axios';
import { IListRequest } from './interfaces';

interface List extends IListRequest {
	branch_id?: number;
	status?: string;
}

interface ListBranchId {
	preparing_branch_id?: number;
}

type Product = {
	key: number;
	quantity_piece: number;
};

interface Create {
	requesting_user_username: number;
	type: 'manual' | 'automatic';
	products: Product[];
}

interface Edit {
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

const service = {
	list: async (params: List, baseURL) =>
		axios.get('/requisition-slips/extended/', { baseURL, params }),

	retrievePendingCount: async (params, baseURL) =>
		axios.get('/requisition-slips/pending-count/', { baseURL, params }),

	getById: async (id, requestingUserType, baseURL) =>
		axios.get(
			`/requisition-slips/${id}/extended/?requesting_user_type=${requestingUserType}`,
			{ baseURL },
		),

	getByIdAndBranch: async (params: ListBranchId, id: number, baseURL) =>
		axios.get(`/requisition-slips/${id}/with-preparing-branch-details/`, {
			baseURL,
			params,
		}),

	create: async (body: Create, baseURL) =>
		axios.post('/requisition-slips/', body, { baseURL }),

	edit: async (body: Edit, baseURL) =>
		axios.patch(`/requisition-slips/${body.id}/`, body, { baseURL }),
};

export default service;
