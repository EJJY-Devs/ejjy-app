import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from 'global';
import { getBaseUrl, wrapServiceWithCatch } from 'hooks/helper';
import { Query } from 'hooks/inteface';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { ChartOfAccountsService } from 'services';

const useChartOfAccounts = ({ params }: Query) =>
	useQuery<any>(
		[
			'useChartOfAccounts',
			params?.page,
			params?.pageSize,
			params?.search,
			params?.accountType,
			params?.subType,
			params?.normalBalance,
		],
		() =>
			wrapServiceWithCatch(
				ChartOfAccountsService.list(
					{
						page: params?.page || DEFAULT_PAGE,
						page_size: params?.pageSize || DEFAULT_PAGE_SIZE,
						search: params?.search,
						account_type: params?.accountType,
						sub_type: params?.subType,
						normal_balance: params?.normalBalance,
					},
					getBaseUrl(false),
				),
			),
		{
			initialData: { data: { results: [], count: 0 } },
			select: (query) => ({
				chartOfAccounts: query.data.results,
				total: query.data.count,
			}),
		},
	);

export const useChartOfAccountCreate = () => {
	const queryClient = useQueryClient();

	return useMutation<any, any, any>(
		({ accountCode, accountName, accountType, subType, normalBalance }: any) =>
			ChartOfAccountsService.create(
				{
					account_code: accountCode,
					account_name: accountName,
					account_type: accountType,
					sub_type: subType,
					normal_balance: normalBalance,
				},
				getBaseUrl(),
			),
		{
			onSuccess: () => {
				queryClient.invalidateQueries('useChartOfAccounts');
			},
		},
	);
};

export const useChartOfAccountEdit = () => {
	const queryClient = useQueryClient();

	return useMutation<any, any, any>(
		({
			id,
			accountCode,
			accountName,
			accountType,
			subType,
			normalBalance,
		}: any) =>
			ChartOfAccountsService.edit(
				id,
				{
					account_code: accountCode,
					account_name: accountName,
					account_type: accountType,
					sub_type: subType,
					normal_balance: normalBalance,
				},
				getBaseUrl(),
			),
		{
			onSuccess: () => {
				queryClient.invalidateQueries('useChartOfAccounts');
			},
		},
	);
};

export const useChartOfAccountDelete = () => {
	const queryClient = useQueryClient();

	return useMutation<any, any, any>(
		(id: number) => ChartOfAccountsService.delete(id, getBaseUrl()),
		{
			onSuccess: () => {
				queryClient.invalidateQueries('useChartOfAccounts');
			},
		},
	);
};

export default useChartOfAccounts;
