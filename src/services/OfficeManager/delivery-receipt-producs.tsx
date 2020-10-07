import axios from 'axios';

export const service = {
	getById: async (id: number) =>
		axios.get(`/delivery-receipt-products/${id}/with-adjustment-slips/`),
};
