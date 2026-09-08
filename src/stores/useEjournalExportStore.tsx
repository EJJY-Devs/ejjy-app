import create from 'zustand';

// Lives outside the component tree (unlike ReportTimeRangeModal's own state)
// specifically so an e-journal export in progress is still tracked -- and
// can still drive a persistent status indicator -- even after the modal
// that started it has been closed and unmounted.
interface State {
	isExporting: boolean;
	progress: number;
	branchMachineName?: string;
}

const initialState: State = {
	isExporting: false,
	progress: 0,
	branchMachineName: undefined,
};

const useEjournalExportStore = create<any>((set) => ({
	ejournalExport: initialState,
	setEjournalExport: (payload: Partial<State>) =>
		set((state) => ({
			ejournalExport: {
				...state.ejournalExport,
				...payload,
			},
		})),
}));

export default useEjournalExportStore;
