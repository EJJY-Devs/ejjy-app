import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from 'global';
import { getBaseUrl, wrapServiceWithCatch } from 'hooks/helper';
import { Query } from 'hooks/inteface';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { ProductTypesService } from 'services';
import { getLocalApiUrl, isStandAlone } from 'utils';

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
				getBaseUrl(),
			),
		{
			onSuccess: () => {
				queryClient.invalidateQueries('useProductTypes');
			},
		},
	);
};

export default useProductTypes;
