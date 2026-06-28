import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from 'global';
import { wrapServiceWithCatch } from 'hooks/helper';
import { Query } from 'hooks/inteface';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { PurchasesService } from 'services';
import { getLocalApiUrl } from 'utils';

export const usePurchaseById = (id: number) =>
	useQuery<any>(
		['usePurchaseById', id],
		() => wrapServiceWithCatch(PurchasesService.getById(id, getLocalApiUrl())),
		{
			enabled: !!id,
			initialData: { data: null },
			select: (query) => query.data,
		},
	);

const usePurchases = ({ params }: Query) =>
	useQuery<any>(
		[
			'usePurchases',
			params?.page,
			params?.pageSize,
			params?.timeRange,
			params?.branchId,
		],
		() =>
			wrapServiceWithCatch(
				PurchasesService.list(
					{
						page: params?.page || DEFAULT_PAGE,
						page_size: params?.pageSize || DEFAULT_PAGE_SIZE,
						time_range: params?.timeRange,
						branch_id: params?.branchId,
					},
					getLocalApiUrl(),
				),
			),
		{
			initialData: { data: { results: [], count: 0 } },
			select: (query) => ({
				purchases: query.data.results,
				total: query.data.count,
			}),
		},
	);

export const usePurchaseUpdate = () => {
	const queryClient = useQueryClient();

	return useMutation<any, any, any>(
		({ id, journalEntryId }: { id: number; journalEntryId: number }) =>
			PurchasesService.update(
				id,
				{ journal_entry_id: journalEntryId },
				getLocalApiUrl(),
			),
		{
			onSuccess: () => {
				queryClient.invalidateQueries('usePurchases');
			},
		},
	);
};

export const usePurchaseCreate = () => {
	const queryClient = useQueryClient();

	return useMutation<any, any, any>(
		({
			products,
			supplierName,
			encodedById,
			authorizerId,
			overallRemarks,
			branchId,
			requisitionSlipId,
			purchaseOrderId,
		}: any) =>
			PurchasesService.create(
				{
					products,
					supplier_name: supplierName,
					encoded_by_id: encodedById,
					authorizer_id: authorizerId,
					overall_remarks: overallRemarks,
					branch_id: branchId,
					requisition_slip_id: requisitionSlipId,
					purchase_order_id: purchaseOrderId,
				},
				getLocalApiUrl(),
			),
		{
			onSuccess: () => {
				queryClient.invalidateQueries('useRequisitionSlips');
				queryClient.invalidateQueries('useBranchProductBalances');
				queryClient.invalidateQueries('useBranchProducts');
			},
		},
	);
};

export default usePurchases;
