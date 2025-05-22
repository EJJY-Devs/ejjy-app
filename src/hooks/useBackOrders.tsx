import { actions } from 'ducks/back-orders';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, IS_APP_LIVE, request } from 'global';
import { wrapServiceWithCatch } from 'hooks/helper';
import { useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { BackOrdersService } from 'services';
import { getLocalApiUrl, modifiedCallback, modifiedExtraCallback } from 'utils';
import { Query } from './inteface';
import { useActionDispatch } from './useActionDispatch';

const EDIT_SUCCESS_MESSAGE = 'Back order was edited successfully';
const EDIT_ERROR_MESSAGE = 'An error occurred while updating the back order';

const RECEIVE_SUCCESS_MESSAGE = 'Back order was received successfully';
const RECEIVE_ERROR_MESSAGE =
	'An error occurred while receiving the back order';

export const useBackOrders = () => {
	// STATES
	const [status, setStatus] = useState<any>(request.NONE);
	const [errors, setErrors] = useState<any>([]);

	// PAGINATION

	// ACTIONS
	const retrieveAction = useActionDispatch(actions.retrieve);
	const editAction = useActionDispatch(actions.edit);
	const receiveAction = useActionDispatch(actions.receive);

	// GENERAL METHODS

	const callback = ({ status: requestStatus, errors: requestErrors = [] }) => {
		setStatus(requestStatus);
		setErrors(requestErrors);
	};

	// PAGINATION METHODS

	// REQUEST METHODS
	const retrieveBackOrder = (id, extraCallback = null) => {
		retrieveAction({
			id,
			callback: modifiedExtraCallback(callback, extraCallback),
		});
	};

	const editBackOrder = (data, extraCallback = null) => {
		editAction({
			...data,
			callback: modifiedExtraCallback(
				modifiedCallback(callback, EDIT_SUCCESS_MESSAGE, EDIT_ERROR_MESSAGE),
				extraCallback,
			),
		});
	};

	const receiveBackOrder = (data, extraCallback = null) => {
		receiveAction({
			...data,
			callback: modifiedExtraCallback(
				modifiedCallback(
					callback,
					RECEIVE_SUCCESS_MESSAGE,
					RECEIVE_ERROR_MESSAGE,
				),
				extraCallback,
			),
		});
	};

	return {
		retrieveBackOrder,
		editBackOrder,
		receiveBackOrder,
		status,
		errors,
	};
};

const useBackOrdersNew = ({ params }: Query) =>
	useQuery<any>(
		[
			'useBackOrders',
			params?.page,
			params?.pageSize,
			params?.type,
			params?.pageSize,
			params?.timeRange,
		],
		() =>
			wrapServiceWithCatch(
				BackOrdersService.list(
					{
						page: params?.page || DEFAULT_PAGE,
						page_size: params?.pageSize || DEFAULT_PAGE_SIZE,
						type: params?.type,
						time_range: params?.timeRange,
					},
					getLocalApiUrl(),
				),
			),
		{
			initialData: { data: { results: [], count: 0 } },
			select: (query) => ({
				backOrders: query.data.results,
				total: query.data.count,
			}),
		},
	);

export const useBackOrderRetrieve = ({ id, options }: Query) =>
	useQuery<any>(
		['useBackOrderRetrieve', id],
		() =>
			wrapServiceWithCatch(BackOrdersService.retrieve(id, getLocalApiUrl())),
		{
			select: (query) => query.data,
			...options,
		},
	);

export const useBackOrderCreate = () =>
	useMutation<any, any, any>(
		({
			encodedById,
			overallRemarks,
			products,
			senderId,
			type,
			customerName,
			customerAddress,
			customerTin,
			branchId,
		}: any) =>
			BackOrdersService.create(
				{
					is_online: IS_APP_LIVE,
					overall_remarks: overallRemarks,
					products,
					sender_id: senderId,
					encoded_by_id: encodedById,
					type,
					customer_name: customerName,
					customer_address: customerAddress,
					customer_tin: customerTin,
					branch_id: branchId,
				},
				getLocalApiUrl(),
			),
	);

export default useBackOrdersNew;
