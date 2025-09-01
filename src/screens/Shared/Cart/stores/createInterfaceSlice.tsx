export const createInterfaceSlice: any = (set) => ({
	isLoading: false,
	setLoading: (value) => set(() => ({ isLoading: value })),
	focusSearchInput: null,
	setFocusSearchInput: (focusFunction) =>
		set(() => ({ focusSearchInput: focusFunction })),
});
