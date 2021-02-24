import axios from 'axios';
import { IGetRequest } from '../interfaces';

interface ICreateProduct {
	name: string;
	machine_id: string;
	machine_printer_serial_number: string;
}

interface IEditProduct {
	machine_id: string;
	machine_printer_serial_number: string;
}

export const service = {
	list: async (params: IGetRequest, baseURL) =>
		axios.get('/branches-machines/', { baseURL, params }),

	create: async (body: ICreateProduct, baseURL) =>
		axios.post('/branches-machines/', body, { baseURL }),

	edit: async (id: number, body: IEditProduct, baseURL) =>
		axios.patch(`/branches-machines/${id}/`, body, { baseURL }),
};
