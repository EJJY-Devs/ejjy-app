import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from 'global';
import { getBaseUrl, wrapServiceWithCatch } from 'hooks/helper';
import { Query } from 'hooks/inteface';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { PatronageSystemTagsService } from 'services';
import { getLocalApiUrl, isStandAlone } from 'utils';

const usePatronageSystemTags = ({ params }: Query) =>
	useQuery<any>(
		['usePatronageSystemTags', params?.page, params?.pageSize],
		() => {
			const service = isStandAlone()
				? PatronageSystemTagsService.list
				: PatronageSystemTagsService.listOffline;

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
				patronageSystemTags: query.data.results,
				total: query.data.count,
			}),
		},
	);

export const usePatronageSystemTagCreate = () => {
	const queryClient = useQueryClient();

	return useMutation<any, any, any>(
		({ name, divisorAmount }: any) =>
			PatronageSystemTagsService.create(
				{
					name,
					divisor_amount: divisorAmount,
				},
				getBaseUrl(),
			),
		{
			onSuccess: () => {
				queryClient.invalidateQueries('usePatronageSystemTags');
			},
		},
	);
};

export const usePatronageSystemTagEdit = () => {
	const queryClient = useQueryClient();

	return useMutation<any, any, any>(
		({ id, name, divisorAmount }: any) =>
			PatronageSystemTagsService.edit(
				id,
				{
					name,
					divisor_amount: divisorAmount,
				},
				getBaseUrl(),
			),
		{
			onSuccess: () => {
				queryClient.invalidateQueries('usePatronageSystemTags');
			},
		},
	);
};

export const usePatronageSystemTagDelete = () => {
	const queryClient = useQueryClient();

	return useMutation<any, any, any>(
		(id: number) => PatronageSystemTagsService.delete(id, getBaseUrl()),
		{
			onSuccess: () => {
				queryClient.invalidateQueries('usePatronageSystemTags');
			},
		},
	);
};

export default usePatronageSystemTags;
