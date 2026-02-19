import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from 'global';
import { wrapServiceWithCatch } from 'hooks/helper';
import { Query } from 'hooks/inteface';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { BrandNamesService } from 'services';
import { getLocalApiUrl, getOnlineApiUrl, isStandAlone } from 'utils';

const useBrandNames = ({ params }: Query) =>
	useQuery<any>(
		['useBrandNames', params?.page, params?.pageSize],
		() => {
			const service = isStandAlone()
				? BrandNamesService.list
				: BrandNamesService.listOffline;

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
				brandNames: query.data.results,
				total: query.data.count,
			}),
		},
	);

export const useBrandNameCreate = () => {
	const queryClient = useQueryClient();

	return useMutation<any, any, any>(
		({ name }: { name: string }) =>
			BrandNamesService.create(
				{
					name,
				},
				getOnlineApiUrl(),
			),
		{
			onSuccess: () => {
				queryClient.invalidateQueries('useBrandNames');
			},
		},
	);
};

export const useBrandNameEdit = () => {
	const queryClient = useQueryClient();

	return useMutation<any, any, any>(
		({ id, name }: { id: number; name: string }) =>
			BrandNamesService.edit(
				id,
				{
					name,
				},
				getOnlineApiUrl(),
			),
		{
			onSuccess: () => {
				queryClient.invalidateQueries('useBrandNames');
			},
		},
	);
};

export const useBrandNameDelete = () => {
	const queryClient = useQueryClient();

	return useMutation<any, any, any>(
		({ id }: { id: number }) => BrandNamesService.delete(id, getOnlineApiUrl()),
		{
			onSuccess: () => {
				queryClient.invalidateQueries('useBrandNames');
			},
		},
	);
};

export default useBrandNames;
