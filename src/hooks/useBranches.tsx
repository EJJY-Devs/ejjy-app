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
				branches: query.data.results,
				total: query.data.count,
			}),
			...options,
		},
	);

export const useBranchRetrieve = ({ id, params, options }: Query) =>
	useQuery<any>(
		['useBranchRetrieve', id, params?.baseURL],
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
	useMutation<any, any, any>(({ name, serverUrl }: any) =>
		BranchesService.create(
			{
				name,
				server_url: serverUrl,
			},
			getGoogleApiUrl(),
		),
	);

export const useBranchPing = () =>
	useMutation<any, any, any>(({ id }: any) =>
		BranchesService.ping({ online_branch_id: id }, getLocalApiUrl()),
	);

export const useBranchEdit = () =>
	useMutation<any, any, any>(({ id, name, serverUrl }: any) =>
		BranchesService.edit(
			id,
			{
				name,
				server_url: serverUrl,
			},
			getGoogleApiUrl(),
		),
	);

export const useBranchDelete = () =>
	useMutation<any, any, any>((id: number) =>
		BranchesService.delete(id, getGoogleApiUrl()),
	);

export default useBranches;
