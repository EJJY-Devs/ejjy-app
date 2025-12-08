import axios from 'axios';

interface ConvertProduct {
	stock_out_branch_product_id: number;
	stock_out_qty: number;
	stock_in_branch_product_id: number;
	stock_in_qty: number;
	authorizer_id: number;
}

const service = {
	create: async (body: ConvertProduct, baseURL) =>
		axios.post('/product-conversions/', body, { baseURL }),
};

export default {
	...service,
};
