import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from 'global';
import { wrapServiceWithCatch } from 'hooks/helper';
import { Query } from 'hooks/inteface';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { ProductChecksService } from 'services';
import { getLocalApiUrl } from 'utils';

const useProductChecks = ({ params }: Query) =>
	useQuery<any>(
		[
			'useProductChecks',
			params?.serverUrl,
			params?.isFilledUp,
			params?.onlyOfToday,
			params?.page,
			params?.pageSize,
			params?.timeRange,
			params?.type,
		],
		() =>
			wrapServiceWithCatch(
				ProductChecksService.list(
					{
						is_filled_up: params?.isFilledUp,
						only_of_today: params?.onlyOfToday,
						page_size: params?.pageSize || DEFAULT_PAGE_SIZE,
						page: params?.page || DEFAULT_PAGE,
						time_range: params?.timeRange,
						type: params?.type,
					},
					params?.serverUrl || getLocalApiUrl(),
				),
			),
		{
			initialData: { data: { results: [], count: 0 } },
			select: (query) => ({
				productChecks: query.data.results,
				total: query.data.count,
			}),
		},
	);

export const useProductCheckRetrieve = ({ id, options }: Query) =>
	useQuery<any>(
		['useProductCheckRetrieve', id],
		() =>
			wrapServiceWithCatch(ProductChecksService.retrieve(id, getLocalApiUrl())),
		{
			select: (query) => query.data,
			...options,
		},
	);

export const useProductCheckCreateDaily = (options = {}) =>
	useMutation<any, any, any>(
		() => ProductChecksService.createDailyChecks(getLocalApiUrl()),
		options,
	);

export const useProductCheckCreateRandom = (options = {}) =>
	useMutation<any, any, any>(
		() => ProductChecksService.createRandomChecks(getLocalApiUrl()),
		options,
	);

export const useProductCheckFulfill = (options = {}) => {
	const queryClient = useQueryClient();

	return useMutation<any, any, any>(
		({ id, products }) =>
			ProductChecksService.fulfill(id, { products }, getLocalApiUrl()),
		{
			onSuccess: () => {
				queryClient.invalidateQueries('useProductChecks');
			},
			...options,
		},
	);
};

export default useProductChecks;
