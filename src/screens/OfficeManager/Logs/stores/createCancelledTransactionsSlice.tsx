export const createCancelledTransactionsSlice: any = (set) => ({
	cancelledTransactionsCount: 0,
	setCancelledTransactionsCount: (value) =>
		set(() => ({ cancelledTransactionsCount: value })),
});
