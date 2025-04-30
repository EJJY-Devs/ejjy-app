import create from 'zustand';
import { createCancelledTransactionsSlice } from './createCancelledTransactionsSlice';

export const useLogsStore = create<any>()((...a) => ({
	...createCancelledTransactionsSlice(...a),
}));
