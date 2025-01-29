// createRefetchSlice.js
export const createRefetchSlice: any = (set) => ({
	refetchData: false, // This will act as our flag
	setRefetchData: () => set((state) => ({ refetchData: !state.refetchData })), // Toggle the refetch flag
});
