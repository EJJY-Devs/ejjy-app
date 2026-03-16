import axios from 'axios';
import { IListRequest } from './interfaces';

interface List extends IListRequest {
	branch_id?: number;
	time_range?: string;
}

interface Detail {
	reference_number: string;
}

interface StatementOfFinancialPerformance {
	branch_id?: number;
	time_range?: string;
}

interface StatementOfFinancialPosition {
	branch_id?: number;
	time_range?: string;
}

const service = {
	list: async (params: List, baseURL: string) =>
		axios.get('/trial-balance/', { baseURL, params }),

	detail: async (params: Detail, baseURL: string) =>
		axios.get('/trial-balance/details/', { baseURL, params }),

	statementOfFinancialPerformance: async (
		params: StatementOfFinancialPerformance,
		baseURL: string,
	) =>
		axios.get('/trial-balance/statement-of-financial-performance/', {
			baseURL,
			params,
		}),

	statementOfFinancialPosition: async (
		params: StatementOfFinancialPosition,
		baseURL: string,
	) =>
		axios.get('/trial-balance/statement-of-financial-position/', {
			baseURL,
			params,
		}),
};

export default {
	...service,
};
