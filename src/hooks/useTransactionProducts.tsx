import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, timeRangeTypes } from 'global';
import { wrapServiceWithCatch } from 'hooks/helper';
import { useQuery } from 'react-query';
import { TransactionProductsService } from 'services';
import { getLocalApiUrl } from 'utils';
import { Query } from './inteface';

const useTransactionProducts = ({ params, options }: Query) =>
	useQuery<any>(
		[
			'useTransactionProducts',
			params?.isVatExempted,
			params?.orNumber,
			params?.page,
			params?.pageSize,
			params?.statuses,
			params?.timeRange,
		],
		() =>
			wrapServiceWithCatch(
				TransactionProductsService.list(
					{
						is_vat_exempted: params?.isVatExempted,
						or_number: params?.orNumber,
						page_size: params?.pageSize || DEFAULT_PAGE_SIZE,
						page: params?.page || DEFAULT_PAGE,
						statuses: params?.statuses,
						time_range: params?.timeRange || timeRangeTypes.DAILY,
					},
					getLocalApiUrl(),
				),
			),
		{
			initialData: { data: { results: [], count: 0 } },
			select: (query) => ({
				transactionProducts: query.data.results,
				total: query.data.count,
			}),
			...options,
		},
	);

export const useTransactionProductDates = ({
	params,
	options,
}: {
	params?: {
		timeRange?: string;
		branchId?: string | number;
	};
	options?: any;
} = {}) =>
	useQuery<any>(
		['useTransactionProductDates', params?.timeRange, params?.branchId],
		() =>
			wrapServiceWithCatch(
				TransactionProductsService.getDates(
					{
						time_range: params?.timeRange,
						branch_id: params?.branchId,
					},
					getLocalApiUrl(),
				),
			),
		{
			initialData: { data: [] },
			select: (query) => query.data,
			...options,
		},
	);

export default useTransactionProducts;
