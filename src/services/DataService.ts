import axios from 'axios';

interface Initialize {
	branch_id?: number;
	is_head_office?: boolean;
	product_ids?: string;
	branch_product_ids?: string;
}

interface Upload {
	is_back_office: boolean;
}

const service = {
	initialize: async (params: Initialize, baseURL) =>
		axios.get('/bulk-initialize/', { baseURL, params }),

	initializeIds: async (params: Initialize, baseURL) =>
		axios.get('/initialize-ids/', { baseURL, params }),

	upload: async (body: Upload, baseURL) =>
		axios.post('/offline-upload-data/', body, { baseURL }),
};

export default service;
