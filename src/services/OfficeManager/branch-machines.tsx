import axios from 'axios';
import { IGetRequest } from '../interfaces';

export const service = {
	list: async (params: IGetRequest) => axios.get('/branches-machines/', { params }),
};
