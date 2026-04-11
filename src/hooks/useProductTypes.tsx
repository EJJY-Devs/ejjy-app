import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from 'global';
import { wrapServiceWithCatch } from 'hooks/helper';
import { Query } from 'hooks/inteface';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { ProductTypesService } from 'services';
import { getLocalApiUrl, getOnlineApiUrl, isStandAlone } from 'utils';

const useProductTypes = ({ params }: Query) =>
	useQuery<any>(
		['useProductTypes', params?.page, params?.pageSize],
		() => {
			const service = isStandAlone()
				? ProductTypesService.list
				: ProductTypesService.listOffline;

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
				productTypes: query.data.results,
				total: query.data.count,
			}),
		},
	);

export const useProductTypeCreate = () => {
	const queryClient = useQueryClient();

	return useMutation<any, any, any>(
		({ name }: { name: string }) =>
			ProductTypesService.create(
				{
					name,
				},
				getOnlineApiUrl(),
			),
		{
			onSuccess: () => {
				queryClient.invalidateQueries('useProductTypes');
			},
		},
	);
};

export const useProductTypeEdit = () => {
	const queryClient = useQueryClient();

	return useMutation<any, any, any>(
		({ id, name }: { id: number; name: string }) =>
			ProductTypesService.edit(
				id,
				{
					name,
				},
				getOnlineApiUrl(),
			),
		{
			onSuccess: () => {
				queryClient.invalidateQueries('useProductTypes');
			},
		},
	);
};

export const useProductTypeDelete = () => {
	const queryClient = useQueryClient();

	return useMutation<any, any, any>(
		({ id }: { id: number }) =>
			ProductTypesService.delete(id, getOnlineApiUrl()),
		{
			onSuccess: () => {
				queryClient.invalidateQueries('useProductTypes');
			},
		},
	);
};

export default useProductTypes;
