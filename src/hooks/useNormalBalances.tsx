import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from 'global';
import { wrapServiceWithCatch } from 'hooks/helper';
import { Query } from 'hooks/inteface';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { NormalBalancesService } from 'services';
import { getLocalApiUrl, getOnlineApiUrl, isStandAlone } from 'utils';

const useNormalBalances = ({ params }: Query) =>
	useQuery<any>(
		['useNormalBalances', params?.page, params?.pageSize],
		() => {
			const service = isStandAlone()
				? NormalBalancesService.list
				: NormalBalancesService.listOffline;

			return wrapServiceWithCatch(
				service(
					{
						page: params?.page || DEFAULT_PAGE,
						page_size: params?.pageSize || DEFAULT_PAGE_SIZE,
					},
					getLocalApiUrl(),
				),
			);
		},
		{
			initialData: { data: { results: [], count: 0 } },
			select: (query) => ({
				normalBalances: query.data.results,
				total: query.data.count,
			}),
		},
	);

export const useNormalBalanceCreate = () => {
	const queryClient = useQueryClient();

	return useMutation<any, any, any>(
		({ name }: { name: string }) =>
			NormalBalancesService.create(
				{
					name,
				},
				getOnlineApiUrl(),
			),
		{
			onSuccess: () => {
				queryClient.invalidateQueries('useNormalBalances');
			},
		},
	);
};

export const useNormalBalanceEdit = () => {
	const queryClient = useQueryClient();

	return useMutation<any, any, any>(
		({ id, name }: { id: number; name: string }) =>
			NormalBalancesService.edit(
				id,
				{
					name,
				},
				getOnlineApiUrl(),
			),
		{
			onSuccess: () => {
				queryClient.invalidateQueries('useNormalBalances');
			},
		},
	);
};

export const useNormalBalanceDelete = () => {
	const queryClient = useQueryClient();

	return useMutation<any, any, any>(
		({ id }: { id: number }) =>
			NormalBalancesService.delete(id, getOnlineApiUrl()),
		{
			onSuccess: () => {
				queryClient.invalidateQueries('useNormalBalances');
			},
		},
	);
};

export default useNormalBalances;
