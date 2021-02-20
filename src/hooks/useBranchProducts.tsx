/* eslint-disable react-hooks/exhaustive-deps */
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { actions, selectors, types } from '../ducks/branch-products';
import { request } from '../global/types';
import { modifiedCallback, modifiedExtraCallback } from '../utils/function';
import { useActionDispatch } from './useActionDispatch';

const EDIT_SUCCESS_MESSAGE = 'Branch product was edited successfully';
const EDIT_ERROR_MESSAGE = 'An error occurred while editing the branch product';

export const useBranchProducts = () => {
	const [status, setStatus] = useState<any>(request.NONE);
	const [errors, setErrors] = useState<any>([]);
	const [warnings, setWarnings] = useState<any>([]);
	const [recentRequest, setRecentRequest] = useState<any>();

	const branchProducts = useSelector(selectors.selectBranchProducts());
	const getBranchProducts = useActionDispatch(actions.getBranchProducts);
	const getBranchProductsByBranch = useActionDispatch(actions.getBranchProductsByBranch);
	const editBranchProduct = useActionDispatch(actions.editBranchProduct);

	const reset = () => {
		resetError();
		resetStatus();
	};

	const resetError = () => setErrors([]);

	const resetStatus = () => setStatus(request.NONE);

	const getBranchProductsRequest = () => {
		setRecentRequest(types.GET_BRANCH_PRODUCTS);
		getBranchProducts({ callback });
	};

	const getBranchProductsByBranchRequest = (branchId) => {
		setRecentRequest(types.GET_BRANCH_PRODUCTS_BY_BRANCH);
		getBranchProductsByBranch({ branchId, callback });
	};

	const editBranchProductRequest = (branchProduct, extraCallback = null) => {
		setRecentRequest(types.EDIT_BRANCH_PRODUCT);
		editBranchProduct({
			...branchProduct,
			allowable_spoilage: (branchProduct.allowable_spoilage || 0) / 100,
			callback: modifiedExtraCallback(
				modifiedCallback(callback, EDIT_SUCCESS_MESSAGE, EDIT_ERROR_MESSAGE),
				extraCallback,
			),
		});
	};

	const callback = ({ status, errors = [], warnings = [] }) => {
		setStatus(status);
		setErrors(errors);
		setWarnings(warnings);
	};

	return {
		branchProducts,
		getBranchProducts: getBranchProductsRequest,
		getBranchProductsByBranch: getBranchProductsByBranchRequest,
		editBranchProduct: editBranchProductRequest,
		status,
		errors,
		warnings,
		recentRequest,
		reset,
		resetStatus,
		resetError,
	};
};
