import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from 'global';
import { wrapServiceWithCatch } from 'hooks/helper';
import { Query } from 'hooks/inteface';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { AuditLogsService } from 'services';
import { getLocalApiUrl } from 'utils';

const useAuditLogs = ({ params }: Query) =>
	useQuery<any>(
		[
			'useAuditLogs',
			params?.serverUrl,
			params?.isFilledUp,
			params?.page,
			params?.pageSize,
			params?.timeRange,
			params?.type,
			params?.status,
			params?.branchId,
		],
		() =>
			wrapServiceWithCatch(
				AuditLogsService.list(
					{
						is_filled_up: params?.isFilledUp,
						page: params?.page || DEFAULT_PAGE,
						page_size: params?.pageSize || DEFAULT_PAGE_SIZE,
						time_range: params?.timeRange,
						type: params?.type,
						status: params?.status,
						branch_id: params?.branchId,
					},
					params?.serverUrl || getLocalApiUrl(),
				),
			),
		{
			initialData: { data: { results: [], count: 0 } },
			select: (query) => ({
				auditLogs: query.data.results,
				total: query.data.count,
			}),
		},
	);

export const useAuditLogCounts = ({ params }: Query) =>
	useQuery<any>(
		['useAuditLogCounts', params?.serverUrl, params?.branchId],
		() =>
			wrapServiceWithCatch(
				AuditLogsService.getCounts(params?.serverUrl || getLocalApiUrl(), {
					branch_id: params?.branchId,
				}),
			),
		{
			initialData: { data: { daily: 0, random: 0, pending: 0 } },
			select: (query) => ({
				daily: query.data.daily,
				random: query.data.random,
				pending: query.data.pending,
			}),
			refetchInterval: 30_000,
			refetchIntervalInBackground: true,
		},
	);

export const useAuditLogCreate = (serverUrl: string) => {
	const queryClient = useQueryClient();

	return useMutation<any, any, any>(
		({
			branchProductId,
			type,
			inputtedQty,
		}: {
			branchProductId: number;
			type: 'daily' | 'random';
			inputtedQty: number;
		}) =>
			AuditLogsService.create(
				{
					branch_product_id: branchProductId,
					type,
					inputted_qty: inputtedQty,
				},
				serverUrl || getLocalApiUrl(),
			),
		{
			onSuccess: () => {
				queryClient.invalidateQueries('useAuditLogs');
				queryClient.invalidateQueries('useAuditLogCounts');
			},
		},
	);
};

export const useAuditLogMarkAdjusted = (serverUrl: string) => {
	const queryClient = useQueryClient();

	return useMutation<any, any, any>(
		({ id, adjustmentSlipId }: { id: number; adjustmentSlipId: number }) =>
			AuditLogsService.markAdjusted(
				id,
				{ adjustment_slip_id: adjustmentSlipId },
				serverUrl || getLocalApiUrl(),
			),
		{
			onSuccess: () => {
				queryClient.invalidateQueries('useAuditLogs');
				queryClient.invalidateQueries('useAuditLogCounts');
			},
		},
	);
};

export const useAuditLogRetrieve = ({ id, options }: Query) =>
	useQuery<any>(
		['useAuditLogRetrieve', id],
		() => wrapServiceWithCatch(AuditLogsService.retrieve(id, getLocalApiUrl())),
		{
			select: (query) => query.data,
			...options,
		},
	);

export default useAuditLogs;
