import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from 'global';
import { wrapServiceWithCatch } from 'hooks/helper';
import { Query } from 'hooks/inteface';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { StorageTypesService } from 'services';
import { getLocalApiUrl, getOnlineApiUrl, isStandAlone } from 'utils';

const useStorageTypes = ({ params }: Query) =>
	useQuery<any>(
		['useStorageTypes', params?.page, params?.pageSize],
		() => {
			const service = isStandAlone()
				? StorageTypesService.list
				: StorageTypesService.listOffline;

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
				storageTypes: query.data.results,
				total: query.data.count,
			}),
		},
	);

export const useStorageTypeCreate = () => {
	const queryClient = useQueryClient();

	return useMutation<any, any, any>(
		({ name }: { name: string }) =>
			StorageTypesService.create(
				{
					name,
				},
				getOnlineApiUrl(),
			),
		{
			onSuccess: () => {
				queryClient.invalidateQueries('useStorageTypes');
			},
		},
	);
};

export const useStorageTypeEdit = () => {
	const queryClient = useQueryClient();

	return useMutation<any, any, any>(
		({ id, name }: { id: number; name: string }) =>
			StorageTypesService.edit(
				id,
				{
					name,
				},
				getOnlineApiUrl(),
			),
		{
			onSuccess: () => {
				queryClient.invalidateQueries('useStorageTypes');
			},
		},
	);
};

export const useStorageTypeDelete = () => {
	const queryClient = useQueryClient();

	return useMutation<any, any, any>(
		({ id }: { id: number }) =>
			StorageTypesService.delete(id, getOnlineApiUrl()),
		{
			onSuccess: () => {
				queryClient.invalidateQueries('useStorageTypes');
			},
		},
	);
};

export default useStorageTypes;
