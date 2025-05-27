import axios from 'axios';

interface Edit {
	value: number;
}

const service = {
	edit: async (id: number, body: Edit, baseURL) =>
		axios.patch(`/branches-product-balances/${id}/`, body, { baseURL }),
};

export default {
	...service,
};
