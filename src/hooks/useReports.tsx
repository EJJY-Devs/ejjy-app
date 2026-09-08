import { wrapServiceWithCatch } from 'hooks/helper';
import { useQuery } from 'react-query';
import { ReportsService } from 'services';
import { getLocalBranchId, getReportsApiUrl } from 'utils';

// The e-journal bulk-export mutation itself now lives in ejjy-global (shared
// with ejjy-cashiering) -- re-exported here so existing `from 'hooks'`
// imports keep working. Callers on this repo must pass readBaseURL/
// writeBaseURL (this repo has no single default axios baseURL) and
// groupByBranchMachine: true (backoffice's local API is shared by every
// machine on the branch, unlike a cashiering terminal's own).
export { useBulkExport } from 'ejjy-global';

export const useGenerateReports = () => {
	const REFETCH_INTERVAL_MS = 30_000;
	const branchId = getLocalBranchId();

	return useQuery(
		['useGenerateReports', branchId],
		() =>
			wrapServiceWithCatch(
				ReportsService.generate(
					{
						branch_id: branchId ? Number(branchId) : undefined,
					},
					getReportsApiUrl(),
				),
			),
		{
			refetchInterval: REFETCH_INTERVAL_MS,
			refetchIntervalInBackground: true,
			notifyOnChangeProps: [],
		},
	);
};
