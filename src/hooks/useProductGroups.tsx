import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from 'global';
import { wrapServiceWithCatch } from 'hooks/helper';
import { Query } from 'hooks/inteface';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { ProductGroupsService } from 'services';
import { getLocalApiUrl, getOnlineApiUrl } from 'utils';

const useProductGroups = ({ params, shouldFetchOfflineFirst }: Query) =>
	useQuery<any>(
		[
			'useProductGroups',
			params?.page,
			params?.pageSize,
			shouldFetchOfflineFirst,
		],
		async () => {
			const baseURL = getLocalApiUrl();

			if (shouldFetchOfflineFirst) {
				await ProductGroupsService.listOffline(baseURL);
			}

			return wrapServiceWithCatch(
				ProductGroupsService.list(
					{
						page: params?.page || DEFAULT_PAGE,
						page_size: params?.pageSize || DEFAULT_PAGE_SIZE,
					},
					baseURL,
				),
			);
		},
		{
			initialData: { data: { results: [], count: 0 } },
			select: (query) => ({
				productGroups: query.data.results,
				total: query.data.count,
			}),
		},
	);

export const useProductGroupRetrieve = ({
	id,
	options,
	shouldFetchOfflineFirst,
}: Query) =>
	useQuery<any>(
		['useProductGroupRetrieve', id, shouldFetchOfflineFirst],
		async () => {
			const baseURL = getLocalApiUrl();

			if (shouldFetchOfflineFirst) {
				await ProductGroupsService.listOffline(baseURL);
			}

			return wrapServiceWithCatch(ProductGroupsService.retrieve(id, baseURL));
		},
		{
			select: (query) => query.data,
			...options,
		},
	);

export const useProductGroupCreate = () => {
	const queryClient = useQueryClient();

	return useMutation<any, any, any>(
		async ({ name, items }: any) => {
			const baseURL = getOnlineApiUrl();

			const response = await ProductGroupsService.create({ name }, baseURL);

			return ProductGroupsService.edit(
				Number(response.data.id),
				{
					name: response.data.name,
					items,
				},
				baseURL,
			);
		},
		{
			onSuccess: () => {
				queryClient.invalidateQueries('useProductGroups');
			},
		},
	);
};

export const useProductGroupEdit = () => {
	const queryClient = useQueryClient();

	return useMutation<any, any, any>(
		({ id, name, items }: any) =>
			ProductGroupsService.edit(
				id,
				{
					name,
					items,
				},
				getOnlineApiUrl(),
			),
		{
			onSuccess: () => {
				queryClient.invalidateQueries('useProductGroups');
			},
		},
	);
};

export const useProductGroupDelete = () => {
	const queryClient = useQueryClient();

	return useMutation<any, any, any>(
		(id: number) => ProductGroupsService.delete(id, getOnlineApiUrl()),
		{
			onSuccess: () => {
				queryClient.invalidateQueries('useProductGroups');
			},
		},
	);
};

export default useProductGroups;
