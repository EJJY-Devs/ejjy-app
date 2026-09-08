import axios from 'axios';

interface Generate {
	branch_id?: number;
	branch_machine_id?: number;
}

const service = {
	generate: async (body: Generate, baseURL: string) =>
		axios.post('/reports/generate-reports/', body, { baseURL }),
};

export default service;
