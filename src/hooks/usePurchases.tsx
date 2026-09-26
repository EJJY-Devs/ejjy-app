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

const usePurchases = ({ params, options }: Query) =>
	useQuery<any>(
		[
			'usePurchases',
			params?.page,
			params?.pageSize,
			params?.timeRange,
			params?.branchId,
			params?.journalEntryStatus,
			params?.search,
			params?.supplierAccountId,
		],
		() =>
			wrapServiceWithCatch(
				PurchasesService.list(
					{
						page: params?.page || DEFAULT_PAGE,
						page_size: params?.pageSize || DEFAULT_PAGE_SIZE,
						time_range: params?.timeRange,
						branch_id: params?.branchId,
						journal_entry_status: params?.journalEntryStatus ?? 'without',
						search: params?.search,
						supplier_account_id: params?.supplierAccountId,
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
			...options,
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
			supplierAccountId,
			invoiceNumber,
			paymentType,
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
					supplier_account_id: supplierAccountId,
					invoice_number: invoiceNumber,
					payment_type: paymentType,
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
				queryClient.invalidateQueries('usePurchases');
				queryClient.invalidateQueries('useRequisitionSlips');
				queryClient.invalidateQueries('useBranchProductBalances');
				queryClient.invalidateQueries('useBranchProducts');
				queryClient.invalidateQueries('useAccounts');
			},
		},
	);
};

export default usePurchases;
