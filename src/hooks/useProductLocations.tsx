import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from 'global';
import { wrapServiceWithCatch } from 'hooks/helper';
import { Query } from 'hooks/inteface';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { ProductLocationsService } from 'services';
import { getLocalApiUrl, getOnlineApiUrl, isStandAlone } from 'utils';

const useProductLocations = ({ params }: Query) =>
	useQuery<any>(
		['useProductLocations', params?.page, params?.pageSize],
		() => {
			const service = isStandAlone()
				? ProductLocationsService.list
				: ProductLocationsService.listOffline;

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
				productLocations: query.data.results,
				total: query.data.count,
			}),
		},
	);

export const useProductLocationCreate = () => {
	const queryClient = useQueryClient();

	return useMutation<any, any, any>(
		({ name }: { name: string }) =>
			ProductLocationsService.create(
				{
					name,
				},
				getOnlineApiUrl(),
			),
		{
			onSuccess: () => {
				queryClient.invalidateQueries('useProductLocations');
			},
		},
	);
};

export const useProductLocationEdit = () => {
	const queryClient = useQueryClient();

	return useMutation<any, any, any>(
		({ id, name }: { id: number; name: string }) =>
			ProductLocationsService.edit(
				id,
				{
					name,
				},
				getOnlineApiUrl(),
			),
		{
			onSuccess: () => {
				queryClient.invalidateQueries('useProductLocations');
			},
		},
	);
};

export const useProductLocationDelete = () => {
	const queryClient = useQueryClient();

	return useMutation<any, any, any>(
		({ id }: { id: number }) =>
			ProductLocationsService.delete(id, getOnlineApiUrl()),
		{
			onSuccess: () => {
				queryClient.invalidateQueries('useProductLocations');
			},
		},
	);
};

export default useProductLocations;
