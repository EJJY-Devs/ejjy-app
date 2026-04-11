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

interface StatementOfChangesInEquity {
	branch_id?: number;
	time_range?: string;
}

interface NotesToFinancialStatements {
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

	statementOfChangesInEquity: async (
		params: StatementOfChangesInEquity,
		baseURL: string,
	) =>
		axios.get('/trial-balance/statement-of-changes-in-equity/', {
			baseURL,
			params,
		}),

	notesToFinancialStatements: async (
		params: NotesToFinancialStatements,
		baseURL: string,
	) =>
		axios.get('/trial-balance/notes-to-financial-statements/', {
			baseURL,
			params,
		}),
};

export default {
	...service,
};
