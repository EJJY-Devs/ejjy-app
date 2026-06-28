import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from 'global';
import { wrapServiceWithCatch } from 'hooks/helper';
import { Query } from 'hooks/inteface';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { SupplierRegistrationsService } from 'services';
import { getLocalApiUrl } from 'utils';

const useSupplierRegistrations = ({ params }: Query = {}) =>
	useQuery<any>(
		[
			'useSupplierRegistrations',
			params?.page,
			params?.pageSize,
			params?.search,
			params?.isActive,
		],
		() =>
			wrapServiceWithCatch(
				SupplierRegistrationsService.list(
					{
						page: params?.page || DEFAULT_PAGE,
						page_size: params?.pageSize || DEFAULT_PAGE_SIZE,
						search: params?.search,
						is_active: params?.isActive,
					},
					getLocalApiUrl(),
				),
			),
		{
			initialData: { data: { results: [], count: 0 } },
			select: (query) => ({
				supplierRegistrations: query.data.results,
				total: query.data.count,
			}),
		},
	);

export const useSupplierRegistrationCreate = () => {
	const queryClient = useQueryClient();

	return useMutation<any, any, any>(
		({ accountId }: any) =>
			SupplierRegistrationsService.create(
				{ account_id: accountId },
				getLocalApiUrl(),
			),
		{
			onSuccess: () => {
				queryClient.invalidateQueries('useSupplierRegistrations');
			},
		},
	);
};

export const useSupplierRegistrationDelete = () => {
	const queryClient = useQueryClient();

	return useMutation<any, any, any>(
		(id) => SupplierRegistrationsService.delete(id, getLocalApiUrl()),
		{
			onSuccess: () => {
				queryClient.invalidateQueries('useSupplierRegistrations');
			},
		},
	);
};

export default useSupplierRegistrations;
