import axios from 'axios';
import { NO_VERIFICATION_CONFIG } from '.';
import { IGetRequest } from './interfaces';

interface ILogin {
	login: string;
	password: string;
}

interface IAcquireToken {
	username: string;
	password: string;
}

export const service = {
	login: async (body: ILogin, baseURL) =>
		axios.post('users/login/', body, { baseURL, ...NO_VERIFICATION_CONFIG }),

	loginOnline: async (body: ILogin, baseURL) =>
		axios.post('users/login_online/', body, { baseURL, ...NO_VERIFICATION_CONFIG }),

	retrieve: async (id: number, params: IGetRequest, baseURL) =>
		axios.get(`users/${id}/`, { baseURL, params }),

	acquireToken: async (body: IAcquireToken, baseURL) =>
		axios.post('tokens/acquire/', body, { baseURL, ...NO_VERIFICATION_CONFIG }),

	logout: async (id: number, baseURL) => axios.post(`users/${id}/logout/`, null, { baseURL }),

	logoutOnline: async (id: number, baseURL) =>
		axios.post(`users/${id}/logout_online/`, null, { baseURL }),
};
