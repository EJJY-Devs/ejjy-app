import dayjs from 'dayjs';
import { useBulkExport } from 'ejjy-global';
import { branchMachineTypes, MAX_PAGE_SIZE } from 'global';
import { useBranchMachines, useSiteSettings } from 'hooks';
import { useEffect, useRef } from 'react';
import { useEjournalExportStore, useUserStore } from 'stores';
import {
	getEjournalLastExportedAt,
	getLocalApiUrl,
	getReportsApiUrl,
	setEjournalLastExportedAt,
} from 'utils';

const branchMachineCashieringTypes = [
	branchMachineTypes.CASHIERING,
	branchMachineTypes.SCALE_AND_CASHIERING,
];

// Safety margin subtracted from the checkpoint before every incremental
// export, so a transaction/X-read/Z-read that was created offline on the
// cashiering terminal (preserving its original, already-past timestamp)
// and only synced to this branch's data after the checkpoint had already
// moved past that date still gets swept up instead of being silently
// excluded forever -- the incremental fetch below filters by each record's
// own business timestamp, not by when it was synced, so without this
// margin a late-arriving record older than the checkpoint would never be
// picked up by any future run. Re-covering this window on every run is
// cheap: the backend skips writing any file that already exists on disk.
// Widen this if cashiering terminals are ever seen to stay offline longer
// than a week before reconnecting and syncing.
const SYNC_LOOKBACK_DAYS = 7;

interface Params {
	branchId: string | number | null;
	enabled: boolean;
}

// Runs the e-journal export automatically once per app session, for every
// cashiering branch machine on the branch, scoped (via `since`) to just
// what changed since that machine's own last successful export -- see
// setEjournalLastExportedAt/getEjournalLastExportedAt.
//
// Deliberately a no-op for a branch machine with no recorded checkpoint
// yet: the very first export of a machine's full history can take hours
// (it's the one-time backfill), and that's only ever meant to be run
// deliberately from ReportTimeRangeModal -- never sprung on someone
// automatically at app open. Once that manual run has completed at least
// once, every later app open exports incrementally from here on.
export const useAutoEjournalExport = ({ branchId, enabled }: Params) => {
	const hasRunRef = useRef(false);

	const user = useUserStore((state) => state.user);
	const { setEjournalExport } = useEjournalExportStore();
	const {
		data: { branchMachines },
	} = useBranchMachines({
		params: { branchId, pageSize: MAX_PAGE_SIZE },
		options: { enabled: enabled && !!branchId },
	});
	const { data: siteSettings } = useSiteSettings({
		options: { enabled },
	});
	const { mutateAsync: bulkExport } = useBulkExport();

	useEffect(() => {
		if (
			!enabled ||
			hasRunRef.current ||
			!siteSettings ||
			!user ||
			branchMachines.length === 0
		) {
			return;
		}

		// Guards against re-running on every re-render of this effect's own
		// deps (e.g. branchMachines/siteSettings refetching) -- this is
		// meant to fire (at most) once per app session, not on a schedule.
		hasRunRef.current = true;

		const cashieringBranchMachines = branchMachines.filter((machine) =>
			branchMachineCashieringTypes.includes(machine.type),
		);

		(async () => {
			// Sequential, not Promise.all: every machine shares the same
			// useEjournalExportStore (see EjournalExportIndicator), so
			// running them concurrently would have their progress updates
			// stomp on each other.
			// eslint-disable-next-line no-restricted-syntax
			for (const branchMachine of cashieringBranchMachines) {
				const checkpoint = getEjournalLastExportedAt(branchMachine.id);

				if (!checkpoint) {
					// eslint-disable-next-line no-continue
					continue;
				}

				// See SYNC_LOOKBACK_DAYS above -- the fetch always re-covers a
				// trailing margin behind the checkpoint, not just from the
				// checkpoint itself.
				const since = dayjs(checkpoint)
					.subtract(SYNC_LOOKBACK_DAYS, 'day')
					.toISOString();

				const startedAt = dayjs().toISOString();

				setEjournalExport({
					isExporting: true,
					progress: 0,
					branchMachineName: branchMachine.name,
				});

				try {
					// eslint-disable-next-line no-await-in-loop
					await bulkExport({
						branchMachine,
						siteSettings,
						user,
						since,
						groupByBranchMachine: true,
						readBaseURL: getReportsApiUrl(),
						writeBaseURL: getLocalApiUrl(),
						onProgress: (progress) => setEjournalExport({ progress }),
					});

					setEjournalLastExportedAt(branchMachine.id, startedAt);
				} catch (error) {
					// Silent: this runs unattended at app open. The checkpoint
					// only advances on success, so a failed run is simply
					// retried in full (still cheap -- see the skip-if-exists
					// behavior on the backend) on the next app open.
				} finally {
					setEjournalExport({ isExporting: false });
				}
			}
		})();
	}, [
		enabled,
		siteSettings,
		user,
		branchMachines,
		bulkExport,
		setEjournalExport,
	]);
};
