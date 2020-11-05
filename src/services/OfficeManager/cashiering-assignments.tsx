import axios from 'axios';
import { IGetRequest } from '../interfaces';

interface ICreateCashieringAssignment {
	user_id: number;
	branch_machine_id: number;
	date: string;
}

interface IEditCashieringAssignment {
	id: number;
	branch_machine_id: number;
}

interface IListCashieringAssignmentsByUserIdRequest extends IGetRequest {
	user_id: number;
}

export const service = {
	listByUserId: async (params: IListCashieringAssignmentsByUserIdRequest) =>
		axios.get('/cashiering-assignments/', { params }),
	getById: async (id) => axios.get(`/branches/${id}/`),
	create: async (body: ICreateCashieringAssignment) => axios.post('/cashiering-assignments/', body),
	edit: async (body: IEditCashieringAssignment) =>
		axios.patch(`/cashiering-assignments/${body.id}/`, body),
	remove: async (id) => axios.delete(`/cashiering-assignments/${id}/`),
};
