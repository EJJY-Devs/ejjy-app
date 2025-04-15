import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, serviceTypes } from 'global';
import { wrapServiceWithCatch } from 'hooks/helper';
import { Query } from 'hooks/inteface';
import { useMutation, useQuery } from 'react-query';
import { BranchesService } from 'services';
import { getGoogleApiUrl, getLocalApiUrl, isStandAlone } from 'utils';

const useBranches = ({ key, params, options }: Query = {}) =>
	useQuery<any>(
		[
			'useBranches',
			key,
			params?.baseURL,
			params?.page,
			params?.pageSize,
			params?.serviceType,
		],
		() => {
			let service = isStandAlone()
				? BranchesService.list
				: BranchesService.listOffline;

			if (serviceTypes.NORMAL === params?.serviceType) {
				service = BranchesService.list;
			}

			if (serviceTypes.OFFLINE === params?.serviceType) {
				service = BranchesService.listOffline;
			}

			return wrapServiceWithCatch(
				service(
					{
						page_size: params?.pageSize || DEFAULT_PAGE_SIZE,
						page: params?.page || DEFAULT_PAGE,
					},
					params?.baseURL || getLocalApiUrl(),
				),
			);
		},
		{
			initialData: { data: { results: [], count: 0 } },
			select: (query) => ({
				branches: query?.data?.results || [],
				total: query?.data?.count || 0,
			}),
			...options,
		},
	);

export const useBranchRetrieve = ({ id, params, options }: Query) =>
	useQuery<any>(
		['useBranchRetrieveLegacy', id, params?.baseURL],
		() => {
			const service = isStandAlone()
				? BranchesService.retrieve
				: BranchesService.retrieveOffline;

			return wrapServiceWithCatch(
				service(id, params?.baseURL || getLocalApiUrl()),
			);
		},
		{
			select: (query) => query.data,
			...options,
		},
	);

export const useBranchCreate = () =>
	useMutation<any, any, any>(
		({
			name,
			serverUrl,
			storeName,
			storeAddress,
			proprietor,
			contactNumber,
			vatType,
			tin,
		}: any) =>
			BranchesService.create(
				{
					name,
					server_url: serverUrl,
					store_name: storeName,
					store_address: storeAddress,
					proprietor,
					contact_number: contactNumber,
					vat_type: vatType,
					tin,
				},
				getGoogleApiUrl(),
			),
	);

export const useBranchPing = () =>
	useMutation<any, any, any>(({ branchKey }: any) =>
		BranchesService.ping({ branch_key: branchKey }, getLocalApiUrl()),
	);

export const useBranchEdit = () =>
	useMutation<any, any, any>(
		({
			id,
			name,
			serverUrl,
			storeName,
			storeAddress,
			proprietor,
			contactNumber,
			vatType,
			tin,
		}: any) =>
			BranchesService.edit(
				id,
				{
					name,
					server_url: serverUrl,
					store_name: storeName,
					store_address: storeAddress,
					proprietor,
					contact_number: contactNumber,
					vat_type: vatType,
					tin,
				},
				getGoogleApiUrl(),
			),
	);

export const useBranchDelete = () =>
	useMutation<any, any, any>((id: number) =>
		BranchesService.delete(id, getGoogleApiUrl()),
	);

export default useBranches;
