import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from 'global';
import { getBaseUrl, wrapServiceWithCatch } from 'hooks/helper';
import { Query } from 'hooks/inteface';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { StorageTypesService } from 'services';
import { getLocalApiUrl, isStandAlone } from 'utils';

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
				getBaseUrl(),
			),
		{
			onSuccess: () => {
				queryClient.invalidateQueries('useStorageTypes');
			},
		},
	);
};

export default useStorageTypes;
