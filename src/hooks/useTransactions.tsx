import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, timeRangeTypes } from 'global';
import { wrapServiceWithCatch } from 'hooks/helper';
import { useQuery } from 'react-query';
import { TransactionsService } from 'services';
import { getLocalApiUrl } from 'utils';
import { Query } from './inteface';

const useTransactions = ({ params, options }: Query) =>
	useQuery<any>(
		[
			'useTransactions',
			params?.branchMachineId,
			params?.isAdjusted,
			params?.modeOfPayment,
			params?.orNumber,
			params?.page,
			params?.pageSize,
			params?.payorCreditorAccountId,
			params?.statuses,
			params?.timeRange,
		],
		() =>
			wrapServiceWithCatch(
				TransactionsService.list(
					{
						branch_machine_id: params?.branchMachineId,
						is_adjusted: params?.isAdjusted,
						mode_of_payment: params?.modeOfPayment,
						or_number: params?.orNumber,
						page_size: params?.pageSize || DEFAULT_PAGE_SIZE,
						page: params?.page || DEFAULT_PAGE,
						payor_creditor_account_id: params?.payorCreditorAccountId,
						statuses: params?.statuses,
						time_range: params?.timeRange || timeRangeTypes.DAILY,
					},
					getLocalApiUrl(),
				),
			),
		{
			initialData: { data: { results: [], count: 0 } },
			select: (query) => ({
				transactions: query.data.results,
				total: query.data.count,
				warning: query.data?.warning,
			}),
			...options,
		},
	);

export const useTransactionRetrieve = ({ id, options }: Query) =>
	useQuery<any>(
		['useTransactionRetrieve', id],
		() =>
			wrapServiceWithCatch(TransactionsService.retrieve(id, getLocalApiUrl())),
		{
			select: (query) => query.data,
			...options,
		},
	);

export const useTransactionsSummary = ({ params, options }: Query) =>
	useQuery<any>(
		[
			'useTransactionsSummary',
			params?.branchMachineId,
			params?.statuses,
			params?.timeRange,
		],
		() =>
			wrapServiceWithCatch(
				TransactionsService.summary(
					{
						branch_machine_id: params?.branchMachineId,
						statuses: params?.statuses,
						time_range: params?.timeRange || timeRangeTypes.DAILY,
					},
					getLocalApiUrl(),
				),
			),
		{
			select: (query) => ({
				summary: query?.data,
			}),
			...options,
		},
	);

export default useTransactions;
