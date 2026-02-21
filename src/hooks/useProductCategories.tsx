import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from 'global';
import { wrapServiceWithCatch } from 'hooks/helper';
import { Query } from 'hooks/inteface';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { ProductCategoriesService } from 'services';
import { getLocalApiUrl, getOnlineApiUrl, isStandAlone } from 'utils';

const useProductCategories = ({ params }: Query) =>
	useQuery<any>(
		['useProductCategories', params?.page, params?.pageSize],
		() => {
			const service = isStandAlone()
				? ProductCategoriesService.list
				: ProductCategoriesService.listOffline;

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
				productCategories: query.data.results,
				total: query.data.count,
			}),
		},
	);

export const useProductCategoryCreate = () => {
	const queryClient = useQueryClient();

	return useMutation<any, any, any>(
		({ name, priorityLevel }: any) =>
			ProductCategoriesService.create(
				{
					name,
					priority_level: priorityLevel,
				},
				// Tags CRUD should always hit the online API.
				getOnlineApiUrl(),
			),
		{
			onSuccess: () => {
				queryClient.invalidateQueries('useProductCategories');
			},
		},
	);
};

export const useProductCategoryEdit = () => {
	const queryClient = useQueryClient();

	return useMutation<any, any, any>(
		({ id, name, priorityLevel }: any) =>
			ProductCategoriesService.edit(
				id,
				{
					name,
					priority_level: priorityLevel,
				},
				// Tags CRUD should always hit the online API.
				getOnlineApiUrl(),
			),
		{
			onSuccess: () => {
				queryClient.invalidateQueries('useProductCategories');
			},
		},
	);
};

export const useProductCategoryDelete = () => {
	const queryClient = useQueryClient();

	return useMutation<any, any, any>(
		(id: number) =>
			// Tags CRUD should always hit the online API.
			ProductCategoriesService.delete(id, getOnlineApiUrl()),
		{
			onSuccess: () => {
				queryClient.invalidateQueries('useProductCategories');
			},
		},
	);
};

export default useProductCategories;
