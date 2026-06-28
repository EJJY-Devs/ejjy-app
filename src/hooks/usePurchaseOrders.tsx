import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from 'global';
import { wrapServiceWithCatch } from 'hooks/helper';
import { Query } from 'hooks/inteface';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { PurchaseOrdersService } from 'services';
import { getLocalApiUrl } from 'utils';

export const usePurchaseOrderById = (id: number) =>
	useQuery<any>(
		['usePurchaseOrderById', id],
		() =>
			wrapServiceWithCatch(PurchaseOrdersService.getById(id, getLocalApiUrl())),
		{
			enabled: !!id,
			initialData: { data: null },
			select: (query) => query.data,
		},
	);

const usePurchaseOrders = ({ params }: Query) =>
	useQuery<any>(
		[
			'usePurchaseOrders',
			params?.page,
			params?.pageSize,
			params?.timeRange,
			params?.branchId,
			params?.requisitionSlipId,
		],
		() =>
			wrapServiceWithCatch(
				PurchaseOrdersService.list(
					{
						page: params?.page || DEFAULT_PAGE,
						page_size: params?.pageSize || DEFAULT_PAGE_SIZE,
						time_range: params?.timeRange,
						branch_id: params?.branchId,
						requisition_slip_id: params?.requisitionSlipId,
					},
					getLocalApiUrl(),
				),
			),
		{
			initialData: { data: { results: [], count: 0 } },
			select: (query) => ({
				purchaseOrders: query.data.results,
				total: query.data.count,
			}),
		},
	);

export const usePurchaseOrderCreate = () => {
	const queryClient = useQueryClient();

	return useMutation<any, any, any>(
		({
			products,
			supplierName,
			authorizerId,
			overallRemarks,
			branchId,
			requisitionSlipId,
		}: any) =>
			PurchaseOrdersService.create(
				{
					products,
					supplier_name: supplierName,
					authorizer_id: authorizerId,
					overall_remarks: overallRemarks,
					branch_id: branchId,
					requisition_slip_id: requisitionSlipId,
				},
				getLocalApiUrl(),
			),
		{
			onSuccess: () => {
				queryClient.invalidateQueries('useRequisitionSlips');
				queryClient.invalidateQueries('usePurchaseOrders');
			},
		},
	);
};

export default usePurchaseOrders;
