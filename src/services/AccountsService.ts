import axios from 'axios';
import { IListRequest } from './interfaces';

interface List extends IListRequest {
	type?: string;
	with_credit_registration?: boolean;
	with_supplier_registration?: boolean;
}

interface Modify {
	biodata_image?: string;
	birthday: string;
	business_address?: string;
	business_name?: string;
	civil_status?: string;
	contact_number: string;
	email_address?: string;
	father_name?: string;
	first_name: string;
	gender: string;
	home_address: string;
	is_point_system_eligible: boolean;
	last_name: string;
	middle_name?: string;
	mother_maiden_name?: string;
	nationality?: string;
	place_of_birth?: string;
	religion?: string;
	tin: string;
	type: string;
}

interface RedeemPoints {
	redeemed_points: number;
	redeem_authorizer_id: number;
	redeem_remarks: string;
}

const service = {
	list: async (params: List, baseURL: string) =>
		axios.get('/accounts/', { baseURL, params }),

	retrieve: async (id: number, baseURL) =>
		axios.get(`/accounts/${id}/`, { baseURL }),

	create: async (body: Modify, baseURL: string) =>
		axios.post('/accounts/', body, { baseURL }),

	edit: async (id: number, body: Modify, baseURL: string) =>
		axios.patch(`/accounts/${id}/`, body, { baseURL }),

	redeemPoints: async (id: number, body: RedeemPoints, baseURL: string) =>
		axios.post(`/accounts/${id}/redeem-points/`, body, { baseURL }),

	creditLogs: async (baseURL: string) =>
		axios.get('/accounts/credit-logs/', { baseURL }),
};

const serviceOffline = {
	listOffline: async (params: List, baseURL: string) =>
		axios.get('/offline-accounts/', { baseURL, params }),
};

export default {
	...service,
	...serviceOffline,
};
