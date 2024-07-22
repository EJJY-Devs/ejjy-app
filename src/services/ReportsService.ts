import axios from 'axios';

type BulkExportData = {
	contents: string;
	file_name: string;
	folder_name: string;
};

interface BulkExport {
	data: BulkExportData[];
}

interface Generate {
	branch_id?: number;
	branch_machine_id?: number;
}

const service = {
	bulkExportReports: async (body: BulkExport, baseURL: string) =>
		axios.post('/reports/bulk-export/', body, { baseURL }),

	generate: async (body: Generate, baseURL: string) =>
		axios.post('/reports/generate-reports/', body, { baseURL }),
};

export default service;
