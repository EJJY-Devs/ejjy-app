import {
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	appTypes,
	headOfficeTypes,
} from 'global';
import { wrapServiceWithCatch } from 'hooks/helper';
import { Query } from 'hooks/inteface';
import { useMutation, useQuery } from 'react-query';
import { ReceivingVouchersService } from 'services';
import { getLocalApiUrl, getHeadOfficeType, getAppType } from 'utils';

const useReceivingVouchers = ({ params }: Query) =>
	useQuery<any>(
		[
			'useReceivingVouchers',
			params?.page,
			params?.pageSize,
			params?.timeRange || 'daily',
			params?.branchId,
		],
		() => {
			const service =
				getHeadOfficeType() === headOfficeTypes.MAIN ||
				getAppType() === appTypes.BACK_OFFICE
					? ReceivingVouchersService.list
					: ReceivingVouchersService.listOffline;

			return wrapServiceWithCatch(
				service(
					{
						page: params?.page || DEFAULT_PAGE,
						page_size: params?.pageSize || DEFAULT_PAGE_SIZE,
						time_range: params?.timeRange || 'daily',
						branch_id: params?.branchId,
					},
					getLocalApiUrl(),
				),
			);
		},
		{
			initialData: { data: { results: [], count: 0 } },
			select: (query) => ({
				receivingVouchers: query.data.results,
				total: query.data.count,
			}),
		},
	);

export const useReceivingVoucherCreate = () =>
	useMutation<any, any, any>(
		({
			products,
			supplierName,
			supplierAddress,
			supplierTin,
			encodedById,
			checkedById,
			branchId,
			overallRemarks,
		}: any) =>
			ReceivingVouchersService.create(
				{
					products,
					supplier_name: supplierName,
					supplier_address: supplierAddress,
					supplier_tin: supplierTin,
					encoded_by_id: encodedById,
					checked_by_id: checkedById,
					branch_id: branchId,
					overall_remarks: overallRemarks,
				},
				getLocalApiUrl(),
			),
	);

export default useReceivingVouchers;
