import axios from 'axios';
import _ from 'lodash';
import { getOnlineApiUrl } from 'utils';
import {
	GENERIC_BRANCH_ERROR_MESSAGE,
	GENERIC_ERROR_MESSAGE,
	GENERIC_STATUS_500_MESSAGE,
} from './global/constants';
import { API_TIMEOUT } from './services';

export default function configureAxios() {
	axios.defaults.timeout = API_TIMEOUT;

	axios.interceptors.request.use(
		(config) => config,
		(error) => Promise.reject(error),
	);

	axios.interceptors.response.use(null, (error) => {
		const modifiedError = { ...error };

		if (error.isAxiosError) {
			if (error.response?.status === 500) {
				modifiedError.errors = [GENERIC_STATUS_500_MESSAGE];
			} else if (error.response?.status === 404) {
				modifiedError.errors = ['Resource not found.'];
			} else if (typeof error?.response?.data === 'string') {
				const dataStr: string = error.response.data;
				const isHtml = dataStr.trimStart().startsWith('<');
				modifiedError.errors = isHtml ? [GENERIC_ERROR_MESSAGE] : [dataStr];
			} else if (typeof error?.response?.data === 'object') {
				modifiedError.errors = _.flatten(_.values(error?.response?.data));
			} else if (error?.config.baseURL !== getOnlineApiUrl()) {
				modifiedError.errors = [GENERIC_BRANCH_ERROR_MESSAGE];
			} else {
				modifiedError.errors = [GENERIC_ERROR_MESSAGE];
			}
		}

		return Promise.reject(modifiedError);
	});
}
