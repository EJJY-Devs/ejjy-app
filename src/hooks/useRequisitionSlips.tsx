import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from 'global';
import { wrapServiceWithCatch } from 'hooks/helper';
import { Query } from 'hooks/inteface';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useSelector } from 'react-redux';
import { RequisitionSlipsService } from 'services';
import {
	getLocalApiUrl,
	modifiedCallback,
	modifiedExtraCallback,
	isStandAlone,
} from 'utils';
import { actions, selectors, types } from '../ducks/requisition-slips';
import { request } from '../global/types';
import { useActionDispatch } from './useActionDispatch';

const EDIT_SUCCESS_MESSAGE = 'Requisition slip was edited successfully';
const EDIT_ERROR_MESSAGE =
	'An error occurred while updating the requisition slip';

const SET_OUT_OF_STOCK_SUCCESS_MESSAGE =
	'Products were set to out of stocks successfully';
const SET_OUT_OF_STOCK_ERROR_MESSAGE =
	'An error occurred while setting the products as out of stock';

export const useRequisitionSlips = () => {
	// STATES
	const [status, setStatus] = useState<any>(request.NONE);
	const [errors, setErrors] = useState<any>([]);
	const [recentRequest, setRecentRequest] = useState<any>();

	// SELECTORS
	const requisitionSlip = useSelector(selectors.selectRequisitionSlip());
	const requisitionSlipsByBranch = useSelector(
		selectors.selectRequisitionSlipsByBranch(),
	);
	const requisitionSlipForOutOfStock = useSelector(
		selectors.selectRequisitionSlipForOutOfStock(),
	);

	// ACTIONS
	const getRequisitionSlipsByIdAction = useActionDispatch(
		actions.getRequisitionSlipById,
	);
	const getRequisitionSlipsByIdAndBranch = useActionDispatch(
		actions.getRequisitionSlipByIdAndBranch,
	);

	const editRequisitionSlip = useActionDispatch(actions.editRequisitionSlip);
	const removeRequisitionSlipByBranch = useActionDispatch(
		actions.removeRequisitionSlipByBranch,
	);
	const setOutOfStock = useActionDispatch(actions.setOutOfStock);

	// GENERAL METHODS
	const resetError = () => setErrors([]);

	const resetStatus = () => setStatus(request.NONE);

	const reset = () => {
		resetError();
		resetStatus();
	};

	const callback = ({ status: requestStatus, errors: requestErrors = [] }) => {
		setStatus(requestStatus);
		setErrors(requestErrors);
	};

	// REQUEST METHODS
	const getRequisitionSlipsById = (data, extraCallback = null) => {
		setRecentRequest(types.GET_REQUISITION_SLIP_BY_ID);
		getRequisitionSlipsByIdAction({
			...data,
			callback: modifiedExtraCallback(callback, extraCallback),
		});
	};

	const getRequisitionSlipsByIdAndBranchRequest = (
		id,
		branchId,
		isForOutOfStock = false,
		extraCallback = null,
	) => {
		setRecentRequest(types.GET_REQUISITION_SLIP_BY_ID_AND_BRANCH);

		if (isForOutOfStock) {
			getRequisitionSlipsByIdAndBranch({
				id,
				branchId,
				isForOutOfStock,
				callback: modifiedExtraCallback(callback, extraCallback),
			});
			return;
		}

		if (!requisitionSlipsByBranch?.[branchId]) {
			getRequisitionSlipsByIdAndBranch({
				id,
				branchId,
				isForOutOfStock,
				callback: modifiedExtraCallback(callback, extraCallback),
			});
		} else {
			callback({ status: request.REQUESTING });
			callback({ status: request.SUCCESS });
		}
	};

	const editRequisitionSlipRequest = (id, action) => {
		setRecentRequest(types.EDIT_REQUISITION_SLIP);
		editRequisitionSlip({
			id,
			action,
			callback: modifiedCallback(
				callback,
				EDIT_SUCCESS_MESSAGE,
				EDIT_ERROR_MESSAGE,
			),
		});
	};

	const setOutOfStockRequest = (data) => {
		setRecentRequest(types.SET_OUT_OF_STOCK);
		setOutOfStock({
			...data,
			callback: modifiedCallback(
				callback,
				SET_OUT_OF_STOCK_SUCCESS_MESSAGE,
				SET_OUT_OF_STOCK_ERROR_MESSAGE,
			),
		});
	};

	return {
		requisitionSlip,
		requisitionSlipsByBranch,
		requisitionSlipForOutOfStock,

		getRequisitionSlipsById,
		getRequisitionSlipsByIdAndBranch: getRequisitionSlipsByIdAndBranchRequest,
		editRequisitionSlip: editRequisitionSlipRequest,
		setOutOfStock: setOutOfStockRequest,
		removeRequisitionSlipByBranch,
		status,
		errors,
		recentRequest,
		reset,
		resetStatus,
		resetError,
	};
};

export const useRequisitionSlipById = ({
	id,
	requestingUserType,
}: {
	id: number;
	requestingUserType: string;
}) =>
	useQuery<any>(
		['useRequisitionSlipById', id, requestingUserType],
		() =>
			wrapServiceWithCatch(
				RequisitionSlipsService.getById(
					id,
					requestingUserType,
					getLocalApiUrl(),
				),
			),
		{
			enabled: !!id, // Prevents the query from running if id is undefined or null
			initialData: { data: null },
			select: (query) => query.data,
		},
	);

const useRequisitionSlipsNew = ({ params }: Query) =>
	useQuery<any>(
		[
			'useRequisitionSlips',
			params?.branchId,
			params?.page,
			params?.pageSize,
			params?.status,
			params?.vendorId,
			params?.slipType,
			params?.timeRange || 'daily',
		],
		() => {
			const service = isStandAlone()
				? RequisitionSlipsService.list
				: RequisitionSlipsService.listOffline;

			return wrapServiceWithCatch(
				service(
					{
						branch_id: params?.branchId,
						page: params?.page || DEFAULT_PAGE,
						page_size: params?.pageSize || DEFAULT_PAGE_SIZE,
						status: params?.status,
						vendor_id: params?.vendorId,
						slip_type: params?.slipType,
						time_range: params?.timeRange || 'daily',
					},
					getLocalApiUrl(),
				),
			);
		},
		{
			initialData: { data: { results: [], count: 0 } },
			select: (query) => ({
				requisitionSlips: query.data.results,
				total: query.data.count,
			}),
		},
	);

export const useRequisitionSlipsRetrievePendingCount = ({ params }: Query) =>
	useQuery<any>(
		['useRequisitionSlipsRetrievePendingCount', params.userId],
		() =>
			wrapServiceWithCatch(
				RequisitionSlipsService.retrievePendingCount(
					{
						user_id: params.userId,
					},
					getLocalApiUrl(),
				),
			),
		{
			initialData: { data: 0 },
			select: (query) => query.data,
		},
	);

export const useRequisitionSlipCreate = () => {
	const queryClient = useQueryClient();

	return useMutation<any, any, any>(
		({
			preparedBy,
			approvedBy,
			products,
			branchId,
			vendorId,
			overallRemarks,
		}: any) =>
			RequisitionSlipsService.create(
				{
					prepared_by: preparedBy,
					approved_by: approvedBy,
					products,
					branch_id: branchId,
					vendor_id: vendorId,
					overall_remarks: overallRemarks,
				},
				getLocalApiUrl(),
			),
		{
			onSuccess: () => {
				queryClient.invalidateQueries('useRequisitionSlips');
			},
		},
	);
};

export default useRequisitionSlipsNew;
